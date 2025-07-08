import express from "express";
import { createChatroom } from "./controller/chatroom.controller.js";

const router = express.Router();

// 채팅방 생성 API
router.post("/chatrooms", createChatroom);

export default router;