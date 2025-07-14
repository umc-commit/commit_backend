import express from "express";
import { addUser, userLogin } from "./controller/user.controller.js";
import { signJwt } from "../jwt.config.js";
import passport from "passport";

const router = express.Router();

// 회원가입 API
router.post("", addUser);

// 로그인 API 
router.post("/login",userLogin);


// 프론트랑 연동하면 삭제될 부분 
router.get("/signup", (req, res) => {
  res.send("Signup Page");
});


// 구글 로그인 페이지로 이동
router.get("/oauth2/login/google", passport.authenticate("google"));

// 구글 로그인 성공 시 구글이 /oauth2/callback/google로 인증 정보를 넘김  
router.get(
  "/oauth2/callback/google",
  passport.authenticate("google", {
    failureRedirect: "/oauth2/login/google",
    failureMessage: true,
  }),
  (req, res) => {
    console.log("req.user", req.user); // BigInt 의심 필드 확인

    if(req.user.signupRequired){
      const token = signJwt({
        provider: req.user.provider.toString(),
        oauth_id : req.user.oauth_id.toString(),
      });
      return res.redirect(`/signup?token=${token}`);
    }
    res.redirect("/")
  }
);

// 카카오 로그인 페이지로 이동
router.get("/oauth2/login/kakao", passport.authenticate("kakao"));

// 카카오 로그인 성공 시 구글이 /oauth2/callback/kakao로 인증 정보를 넘김  
router.get(
  "/oauth2/callback/kakao",
  passport.authenticate("kakao", {
    failureRedirect: "/oauth2/login/kakao",
    failureMessage: true,
  }),
  (req, res) => {
    console.log("req.user", req.user); // BigInt 의심 필드 확인

    if(req.user.signupRequired){
      const token = signJwt({
        provider: req.user.provider.toString(),
        oauth_id : req.user.oauth_id.toString(),
      });
      return res.redirect(`/signup?token=${token}`);
    }
    res.redirect("/")
  }
);

export default router;