import dotenv from "dotenv";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./db.config.js";

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
  const email = profile.emails?.[0]?.value;
  if (!email) {
    throw new Error(`profile.email was not found: ${profile}`);
  }

  const user = await prisma.account.findFirst({ 
    where: {oauthId : profile.id, provider:'google'},
  });

  if (user !== null) {
    return { id: user.id, nickname: user.nickname, account_id : user.account_id };
  }

  // 사용자가 없으면 회원가입 페이지로 이동하도록 응답
  // ex. 프론트에서 signupRequired : true를 응답받으면 회원가입 페이지로 이동 
  return {
    signupRequired : true, 
    provider : 'google', 
    oauth_id : profile.id,
  };
};