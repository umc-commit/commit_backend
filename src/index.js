import cors from 'cors';
import dotenv from "dotenv";
import express from "express";
import { setupSwagger } from './common/swagger/index.js';
import http from 'http';
import setupSocket from "./chat/socket/socket.js";
import routes from "./routes.js";
import { stringifyWithBigInt, parseWithBigInt } from './bigintJson.js';
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import session from "express-session";
import passport from "passport";
import { googleStrategy } from "./auth.config.js";
import { kakaoStrategy } from './auth.config.js';
import { naverStrategy } from './auth.config.js';
import { twitterStrategy } from './auth.config.js';
import { prisma } from "./db.config.js";
import path from "path";


dotenv.config();

passport.use("google", googleStrategy);
passport.use("kakao", kakaoStrategy);
passport.use("naver", naverStrategy);
passport.use("twitter", twitterStrategy);

passport.serializeUser((user, done) => {
  const safeUser = {
    ...user,
    id: typeof user.id === "bigint" ? user.id.toString() : user.id,
    oauth_id: typeof user.oauth_id === "bigint" ? user.oauth_id.toString() : user.oauth_id,
  };
  done(null, safeUser);
});

passport.deserializeUser((user, done) => done(null, user));

const app = express();
const port = process.env.PORT || 3000;


// http 서버 생성
const server = http.createServer(app);
setupSocket(server);

app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

/**
 * 공통 응답을 사용할 수 있는 헬퍼 함수 등록
 */
app.use((req, res, next) => {
  res.success = (success) => {
    const jsonStr = stringifyWithBigInt(success);
    const jsonObj = JSON.parse(jsonStr);
    return res.json({ resultType: "SUCCESS", error: null, success: jsonObj });
  };

  res.error = ({ errorCode = "unknown", reason = null, data = null }) => {
    return res.json({
      resultType: "FAIL",
      error: { errorCode, reason, data },
      success: null,
    });
  };

  next();
});

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 공통 api 라우터
app.use("/api", routes);

// 프론트랑 연동하면 삭제될 부분 
app.get("/signup", (req, res) => {
  res.send("Signup Page");
});

// 결제 테스트 페이지를 위한 ejs 설정
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));
app.get("/client-paytest", (req, res) => {
  res.render("client-paytest", { impKey: process.env.PUBLIC_IMP_KEY });
});

// Swagger 설정 
setupSwagger(app);  

app.get('/', (req, res) => {
  res.send('Hello World!')
})

/**
 * 전역 오류를 처리하기 위한 미들웨어
 */
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const errorPayload = {
    errorCode: err.errorCode || "unknown",
    reason: err.reason || err.message || null,
    data: err.data || null,
  };

  const jsonStr = stringifyWithBigInt(errorPayload);
  const jsonObj = JSON.parse(jsonStr);

  if (typeof res.error === "function") {
    res.status(err.statusCode || 500).error(jsonObj);
  } else {
    res.status(err.statusCode || 500).json({
      resultType: "FAIL",
      error: jsonObj,
      success: null,
    });
  }

});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log(`📚 Swagger UI: http://localhost:${port}/api-docs`)
})