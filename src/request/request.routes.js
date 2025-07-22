import { Router } from 'express';
import {
    getRequestList,
    updateRequestStatus 
} from "./controller/request.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// 신청 목록 조회 API
router.get('/', authenticate, getRequestList);
// 신청 상태 변경 API
router.patch('/:requestId/status', authenticate, updateRequestStatus);

export default router;