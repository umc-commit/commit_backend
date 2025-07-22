import { Router } from 'express';
import { getRequestList } from "./controller/request.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// 신청 목록 조회 API
router.get('/', authenticate, getRequestList);

export default router;