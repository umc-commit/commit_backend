import express from "express";
import chatRouter from "./chat/chat.routes.js";
import reviewRouter from "./review/review.routes.js";

const router = express.Router();

router.use("/chat", chatRouter);
router.use("/reviews", reviewRouter);

export default router;