import express from "express";
import { addUser, userLogin } from "./controller/user.controller.js";

const router = express.Router();

// 회원가입 API
router.post("", addUser);

// 로그인 API 
router.post("/login",userLogin);

export default router;