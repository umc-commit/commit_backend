import { Router } from 'express';
import { 
    getCommissionDetail,
    getCommissionArtistInfo,
    getCommissionForm,
    uploadRequestImage,
    submitCommissionRequest,
    getCommissionReport
 } from "./controller/commission.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// 커미션 리포트 조회 API
router.get('/reports', authenticate, getCommissionReport);

// 커미션 신청 이미지 업로드 API
router.post('/request-images/upload', authenticate, uploadRequestImage);

// 커미션 게시글 상세글 조회 API
router.get('/:commissionId', authenticate, getCommissionDetail);

// 커미션 게시글 작가 정보 조회 API
router.get('/:commissionId/artist', authenticate, getCommissionArtistInfo);

// 커미션 신청폼 조회 API
router.get('/:commissionId/forms', authenticate, getCommissionForm);

// 커미션 신청 제출 API
router.post('/:commissionId/requests', authenticate, submitCommissionRequest);

export default router;