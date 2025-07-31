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
import homeRouter from "./home/home.routes.js"
import tokenRouter from "./token.routes.js"

const router = express.Router();

router.use("/chatrooms", chatRouter);
router.use("/", bookmarkRouter);
router.use("/search", searchRouter)
router.use("/commissions", commissionRouter);
router.use("/users", userRouter);
router.use("/reviews", reviewRouter);
router.use("/notifications", notificationRouter);
router.use("/payments", paymentRouter);
router.use("/points", pointRouter);
router.use("/requests", requestRouter);
router.use("/home", homeRouter);
router.use("/", tokenRouter);


export default router;