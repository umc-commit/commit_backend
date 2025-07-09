import express from "express";
import chatRouter from "./chat/chat.routes.js";
import bookmarkRouter from './bookmark/bookmark.route.js';

const router = express.Router();

router.use("/chatrooms", chatRouter);
router.use("/", bookmarkRouter);

export default router;