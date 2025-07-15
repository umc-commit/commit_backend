import express from "express";
import { createChatroom } from "./controller/chatroom.controller.js";
import { showChatroom } from "./controller/chatroom.controller.js";
import { deleteChatrooms } from "./controller/chatroom.controller.js";
// import { sendMessages } from "./controller/chat.controller.js";

const router = express.Router();

// 채팅방 생성 API
router.post("", createChatroom);

// 채팅방 조회 API
router.get("/:consumerId", showChatroom);

// 채팅방 삭제 API
router.delete("/delete", deleteChatrooms);

// router.get("/:chatroomId/messages", showMessages);

export default router;