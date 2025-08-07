import express from "express";
import { addUser, userLogin, getUserProfile, UpdateMyprofile, AccessUserCategories, CheckUserNickname, FollowArtist, CancelArtistFollow, LookUserFollow, LookUserBadge } from "./controller/user.controller.js";
import { signJwt } from "../jwt.config.js";
import passport from "passport";
import { authenticate } from "../middlewares/auth.middleware.js";
// 리뷰 관련 import 추가
import reviewController from '../review/controller/review.controller.js';

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
    session:false,
  }),
  (req, res) => {
    console.log("req.user", req.user); // BigInt 의심 필드 확인

    let token;

    if(req.user.signupRequired){
      token = signJwt({
        provider: req.user.provider,
        oauth_id : req.user.oauth_id,
      });
      return res.redirect(`commit://oauth2/callback/google?token=${token}&signupRequired=true`);
    }

    if(req.user.role === 'artist') {
      token = signJwt({
        accountId: req.user.accountId,
        artistId:req.user.artistId,
        userId: req.user.artistId,
        role:req.user.role,
      });
    }
    if(req.user.role === 'client'){
      token = signJwt({
        accountId: req.user.accountId,
        userId:req.user.userId,
        role:req.user.role,
      });
    }

    res.redirect(`commit://oauth2/callback/google?token=${token}&signupRequired=false`);
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
    session:false,
  }),
  (req, res) => {
    console.log("req.user", req.user); // BigInt 의심 필드 확인
    
    let token;

    if(req.user.signupRequired){
      token = signJwt({
        provider: req.user.provider,
        oauth_id : req.user.oauth_id,
      });
      return res.redirect(`/signup?token=${token}`);
    }
    token = signJwt({
      accountId: req.user.accountId,
      role:req.user.role,
    });

    res.redirect(`/?token=${token}`)
  }
);

// 네이버 로그인 페이지로 이동
router.get("/oauth2/login/naver", passport.authenticate("naver"));

// 네이버 로그인 성공 시 구글이 /oauth2/callback/naver로 인증 정보를 넘김  
router.get(
  "/oauth2/callback/naver",
  passport.authenticate("naver", {
    failureRedirect: "/oauth2/login/naver",
    failureMessage: true,
    session:false,
  }),
  (req, res) => {
    console.log("req.user", req.user); // BigInt 의심 필드 확인

    let token;

    if(req.user.signupRequired){
      token = signJwt({
        provider: req.user.provider.toString(),
        oauth_id : req.user.oauth_id.toString(),
      });
      return res.redirect(`/signup?token=${token}`);
    }

    token = signJwt({
      accountId: req.user.accountId,
      role:req.user.role,
    });

    res.redirect(`/?token=${token}`)
  }
);

// 트위터 로그인 페이지로 이동
router.get("/oauth2/login/twitter", passport.authenticate("twitter"));

// 트위터 로그인 성공 시 구글이 /oauth2/callback/twitter로 인증 정보를 넘김  
router.get(
  "/oauth2/callback/twitter",
  passport.authenticate("twitter", {
    failureRedirect: "/oauth2/login/twitter",
    failureMessage: true,
  }),
  (req, res) => {
    console.log("req.user", req.user); // BigInt 의심 필드 확인
    
    let token;

    if(req.user.signupRequired){
      token = signJwt({
        provider: req.user.provider.toString(),
        oauth_id : req.user.oauth_id.toString(),
      });
      return res.redirect(`/signup?token=${token}`);
    }

    token = signJwt({
      userId: req.user.id?.toString(),
    });


    res.redirect(`/?token=${token}`)
  }
);

// 사용자 프로필 조회 
router.get("/me", authenticate, getUserProfile);


/**
 * 사용자별 리뷰 목록 조회 API
 * GET /api/users/:userId/reviews
 */
router.get('/:userId/reviews',
    authenticate,
    reviewController.getReviewsByUserId
);

// 사용자 프로필 수정
router.patch("/me", authenticate, UpdateMyprofile);


// 사용자가 선택한 카테고리 조회
router.get("/categories", authenticate, AccessUserCategories);

// 닉네임 중복 확인 
router.get("/check-nickname", CheckUserNickname);

// 사용자가 원하는 작가 팔로우하기 
router.post("/follows/:artistId", authenticate,FollowArtist);

// 작가 팔로우 취소하기 
router.delete("/follows/:artistId", authenticate, CancelArtistFollow);

// 사용자가 팔로우하는 작가 조회하기 
router.get("/follows", authenticate, LookUserFollow);

// 사용자의 뱃지 조회하기 
router.get("/badges", authenticate, LookUserBadge);


export default router;