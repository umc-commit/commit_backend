import express from "express";
import { paymentConfirm } from "./controller/payment.controller.js";
import { getPayments } from "./controller/payment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 결제 정보 저장 API
router.post("/complete", paymentConfirm);

// 결제 정보 조회 API
router.get("", authenticate, getPayments);

export default router;