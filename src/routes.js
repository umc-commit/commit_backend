import express from "express";
import chatRouter from "./chat/chat.routes.js";
import reviewRouter from "./review/review.routes.js";

const router = express.Router();

router.use("/chat", chatRouter);
router.use("/reviews", reviewRouter);  // 리뷰 관련 API들
router.use("/requests", reviewRouter); // 임시 리뷰 작성 API

// TODO: 커미션 신청 페이지 작업 완료되면 라우터 분리 예정
// router.use("/requests", requestRouter);

export default router;