import express from "express";
import { createChatroom } from "./controller/chatroom.controller.js";
import { getChatroom } from "./controller/chatroom.controller.js";
import { deleteChatrooms } from "./controller/chatroom.controller.js";
import { showMessages } from "./controller/chat.controller.js";
import { getMessageByKeyword } from "./controller/chat.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 채팅방 생성 API
router.post("", createChatroom);

// 채팅방 삭제 API
router.delete("/delete", authenticate, deleteChatrooms);

// 채팅 메시지 검색 API
router.get("/search/messages", getMessageByKeyword);

// 채팅방 조회 API
router.get("", getChatroom);

// 채팅 메시지 조회 API
router.get("/:chatroomId/messages", showMessages);

export default router;