import { Router } from 'express';
import {
    getRequestList,
    getRequestDetail,
    updateRequestStatus,
    getSubmittedRequestForm,
    getCompletedRequests
} from "./controller/request.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import reviewController from '../review/controller/review.controller.js';

const router = Router();

// 신청 목록 조회 API
router.get('/', authenticate, getRequestList);
// 완료된 신청내역 조회 API
router.get('/record', authenticate, getCompletedRequests);
// 신청 상세 조회 API
router.get('/:requestId', authenticate, getRequestDetail);
// 신청 상태 변경 API
router.patch('/:requestId/status', authenticate, updateRequestStatus);
// 제출된 신청서 조회 API
router.get('/:requestId/forms', authenticate, getSubmittedRequestForm);

/**
 * 리뷰 작성 API
 * POST /api/requests/:requestId/reviews
 */
router.post('/:requestId/reviews',
    authenticate,
    reviewController.createReview
);

export default router;