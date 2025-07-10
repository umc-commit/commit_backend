import express from "express";
import { addUser } from "./controller/user.controller.js";

const router = express.Router();

// 회원가입 API
router.post("", addUser);

export default router;