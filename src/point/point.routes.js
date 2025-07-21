import express from "express";
import { getUserPoint } from "./controller/point.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 포인트 조회 API
router.get("/current", authenticate, getUserPoint);

export default router;