import { Router } from 'express';
import { 
    getCommissionDetail,
    getCommissionForm
 } from "./controller/commission.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// 커미션 게시글 상세글 조회 API
router.get('/:commissionId', authenticate, getCommissionDetail);

// 커미션 신청폼 조회 API
router.get('/:commissionId/forms', authenticate, getCommissionForm);

export default router;