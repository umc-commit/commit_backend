import express from 'express';
import reviewController from './controller/review.controller.js';
import reviewService from './service/review.service.js';

const router = express.Router();

// TODO: 실제 JWT 인증 미들웨어로 교체 필요
const authenticateToken = (req, res, next) => {
    // 테스트용 하드코딩
    req.user = { id: 1, nickname: 'testuser' };
    next();
};

/**
 * 리뷰 이미지 업로드 API
 * POST /api/reviews/images/upload
 */
router.post('/images/upload',
    authenticateToken,
    reviewService.upload.single('image'),
    reviewController.uploadImage
);

/**
 * 리뷰 작성 API
 * POST /api/requests/:requestId/reviews
 * 
 * TODO: request 작업 완료되면 request.routes.js로 이동 예정
 * 현재는 임시로 reviewRouter에서 처리
 * 
 */
router.post('/:requestId/reviews',
    authenticateToken,
    reviewController.createReview
);

export default router;