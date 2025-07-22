import express from "express";
import chatRouter from "./chat/chat.routes.js";
import reviewRouter from "./review/review.routes.js";
import bookmarkRouter from './bookmark/bookmark.route.js';
import userRouter from "./user/user.routes.js"
import searchRouter from "./search/search.routes.js"
import commissionRouter from "./commission/commission.routes.js"
import notificationRouter from "./notification/notification.routes.js";
import paymentRouter from "./payment/payment.routes.js"
import pointRouter from "./point/point.routes.js"
import requestRouter from "./request/request.routes.js"

const router = express.Router();

router.use("/chatrooms", chatRouter);
router.use("/", bookmarkRouter);
router.use("/search", searchRouter)
router.use("/commissions", commissionRouter);
router.use("/users", userRouter);
router.use("/reviews", reviewRouter);  // 리뷰 관련 API들
router.use("/requests", reviewRouter); // 임시 리뷰 작성 API
router.use("/notifications", notificationRouter);
router.use("/payments", paymentRouter);
router.use("/points", pointRouter);
router.use("/requests", requestRouter);

// TODO: 커미션 신청 페이지 작업 완료되면 라우터 분리 예정
// router.use("/requests", requestRouter);


export default router;