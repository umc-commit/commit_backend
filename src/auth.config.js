import dotenv from "dotenv";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./db.config.js";
import { Strategy as KakaoStrategy } from "passport-kakao";
import { Strategy as NaverStrategy } from "passport-naver";
dotenv.config();

export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.PASSPORT_GOOGLE_CLIENT_ID,
    clientSecret: process.env.PASSPORT_GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/users/oauth2/callback/google",
    scope: ["email", "profile"],
    state: true,
  },
  (accessToken, refreshToken, profile, cb) => {
    return googleVerify(profile)
      .then((user) => cb(null, user))
      .catch((err) => cb(err));
  }
);

const googleVerify = async (profile) => {

  const user = await prisma.account.findFirst({ 
    where: {oauthId : profile.id, provider:profile.provider},
  });

  if (user !== null) {
    return { id: user.id, nickname: user.nickname, account_id : user.account_id };
  }

  // 사용자가 없으면 회원가입 페이지로 이동하도록 응답
  // ex. 프론트에서 signupRequired : true를 응답받으면 회원가입 페이지로 이동 
  return {
    signupRequired : true, 
    provider : profile.provider, 
    oauth_id : profile.id,
  };
};

export const kakaoStrategy = new KakaoStrategy(
  {
    clientID: process.env.PASSPORT_KAKAO_CLIENT_ID,
    clientSecret: process.env.PASSPORT_KAKAO_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/users/oauth2/callback/kakao",
    scope: undefined,
    state: true,
  },
  (accessToken, refreshToken, profile, cb) => {
    return kakaoVerify(profile)
      .then((user) => cb(null, user))
      .catch((err) => cb(err));
  }
);

const kakaoVerify = async (profile) => {

  const user = await prisma.account.findFirst({ 
    where: {oauthId : profile.id.toString(), provider:profile.provider},
  });

  if (user !== null) {
    return { id: user.id, nickname: user.nickname, account_id : user.account_id };
  }

  // 사용자가 없으면 회원가입 페이지로 이동하도록 응답
  // ex. 프론트에서 signupRequired : true를 응답받으면 회원가입 페이지로 이동 
  return {
    signupRequired : true, 
    provider : profile.provider, 
    oauth_id : profile.id,
  };
};


export const naverStrategy = new NakaoStrategy(
  {
    clientID: process.env.PASSPORT_NAVER_CLIENT_ID,
    clientSecret: process.env.PASSPORT_NAVER_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/users/oauth2/callback/naver",
    scope: undefined,
    state: true,
  },
  (accessToken, refreshToken, profile, cb) => {
    return naverVerify(profile)
      .then((user) => cb(null, user))
      .catch((err) => cb(err));
  }
);

const naverVerify = async (profile) => {

  const user = await prisma.account.findFirst({ 
    where: {oauthId : profile.id.toString(), provider:profile.provider},
  });

  if (user !== null) {
    return { id: user.id, nickname: user.nickname, account_id : user.account_id };
  }

  // 사용자가 없으면 회원가입 페이지로 이동하도록 응답
  // ex. 프론트에서 signupRequired : true를 응답받으면 회원가입 페이지로 이동 
  return {
    signupRequired : true, 
    provider : profile.provider, 
    oauth_id : profile.id,
  };
};