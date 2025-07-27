import express from "express";
import { getUserPoint, transferPoint, getTransactionHistory } from "./controller/point.controller.js";
import { getProducts } from "./controller/point.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 포인트 조회 API
router.get("/current", authenticate, getUserPoint);

// 상품 조회 API
router.get("/products", getProducts);

// 포인트 거래 API
router.post("/transfer", authenticate, transferPoint);

// 포인트 거래 조회 API
router.get("/transactions", authenticate, getTransactionHistory);

export default router;