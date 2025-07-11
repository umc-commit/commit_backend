import cors from 'cors';
import dotenv from "dotenv";
import express from "express";
import { setupSwagger } from './common/swagger/index.js';
import http from 'http';
import setupSocket from "./socket.js";
import routes from "./routes.js";
import { stringifyWithBigInt, parseWithBigInt } from './bigintJson.js';
import passport from "passport";
import session from "express-session";

dotenv.config();

const app = express()
const port = process.env.PORT || 3000;

// http 서버 생성
const server = http.createServer(app);
setupSocket(server);

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

  res.status(err.statusCode || 500).error(jsonObj);
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log(`📚 Swagger UI: http://localhost:${port}/api-docs`)
})