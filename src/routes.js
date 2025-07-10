import express from "express";
import chatRouter from "./chat/chat.routes.js";
import bookmarkRouter from './bookmark/bookmark.route.js';
import userRouter from "./user/user.routes.js"

const router = express.Router();

router.use("/chatrooms", chatRouter);
router.use("/", bookmarkRouter);
router.use("/users", userRouter);

export default router;