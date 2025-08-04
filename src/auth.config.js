import dotenv from "dotenv";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./db.config.js";
import { Strategy as KakaoStrategy } from "passport-kakao";
import { Strategy as NaverStrategy } from "passport-naver";
import { Strategy as TwitterStrategy} from "passport-twitter";

dotenv.config();

export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.PASSPORT_GOOGLE_CLIENT_ID,
    clientSecret: process.env.PASSPORT_GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/api/users/oauth2/callback/google`,
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

  console.log("profile -> ",profile);

  const user = await prisma.account.findFirst({ 
    where: {oauthId : profile.id, provider:profile.provider},
    include:{users:true, artists:true},
  });

  console.log("user -> ", user);

  if (user && user.users.length>0) {
    return { id: user.users[0].id, nickname: user.users[0].nickname, accountId : user.id.toString(), userId: user.users[0].id.toString(), role:'client', provider: user.provider, oauthId:user.oauthId };
  }

  if(user && user.artists.length>0){
    return{id:user.artists[0].id, nickname:user.artists[0].nickname, accountId:user.id.toString(), artistId: user.artists[0].id.toString(), role:'artist', provider:user.provider, oauthId: user.oauthId};
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

  console.log(profile);

  const user = await prisma.account.findFirst({ 
    where: {oauthId : profile.id.toString(), provider:profile.provider},
    include:{users:true, artists:true},
  });

  console.log(user);

  if (user && user.users.length>0) {
    return { id: user.users[0].id, nickname: user.users[0].nickname, accountId : user.id.toString(), userId: user.users[0].id.toString(), role:'client', provider: user.provider, oauthId:user.oauthId };
  }

  if(user && user.artists.length>0){
    return{id:user.artists[0].id, nickname:user.artists[0].nickname, accountId:user.id.toString(), artistId: user.artists[0].id.toString(), role:'artist', provider:user.provider, oauthId: user.oauthId};
  }

  // 사용자가 없으면 회원가입 페이지로 이동하도록 응답
  // ex. 프론트에서 signupRequired : true를 응답받으면 회원가입 페이지로 이동 
  return {
    signupRequired : true, 
    provider : profile.provider, 
    oauth_id : profile.id.toString(),
  };
};


export const naverStrategy = new NaverStrategy(
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
    include:{users:true, artists:true},
  });

  console.log(user);

  if (user && user.users.length>0) {
    return { id: user.users[0].id, nickname: user.users[0].nickname, accountId : user.id.toString(), userId: user.users[0].id.toString(), role:'client', provider: user.provider, oauthId:user.oauthId };
  }

  if(user && user.artists.length>0){
    return{id:user.artists[0].id, nickname:user.artists[0].nickname, accountId:user.id.toString(), artistId: user.artists[0].id.toString(), role:'artist', provider:user.provider, oauthId: user.oauthId};
  }

  // 사용자가 없으면 회원가입 페이지로 이동하도록 응답
  // ex. 프론트에서 signupRequired : true를 응답받으면 회원가입 페이지로 이동 
  return {
    signupRequired : true, 
    provider : profile.provider, 
    oauth_id : profile.id,
  };
};


export const twitterStrategy = new TwitterStrategy(
  {
    consumerKey: process.env.PASSPORT_TWITTER_CLIENT_ID,
    consumerSecret: process.env.PASSPORT_TWITTER_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/users/oauth2/callback/twitter",
    scope: undefined,
    state: true,
  },
  (accessToken, refreshToken, profile, cb) => {
    return twitterVerify(profile)
      .then((user) => cb(null, user))
      .catch((err) => cb(err));
  }
);

const twitterVerify = async (profile) => {

  const user = await prisma.account.findFirst({ 
    where: {oauthId : profile.id.toString(), provider:profile.provider},
    include:{users:true},
  });

  if (user !== null) {
    return { id: user.users[0].id, nickname: user.users[0].nickname, account_id : user.id.toString() };
  }

  // 사용자가 없으면 회원가입 페이지로 이동하도록 응답
  // ex. 프론트에서 signupRequired : true를 응답받으면 회원가입 페이지로 이동 
  return {
    signupRequired : true, 
    provider : profile.provider, 
    oauth_id : profile.id,
  };
};