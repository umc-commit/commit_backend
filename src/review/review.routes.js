import express from 'express';
import reviewController from './controller/review.controller.js';
import reviewService from './service/review.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * 리뷰 이미지 업로드 API
 * POST /api/reviews/images/upload
 */
router.post('/images/upload',
    authenticate,
    reviewService.upload.single('image'),
    reviewController.uploadImage
);

/**
 * 리뷰 수정 API
 * PATCH /api/reviews/:reviewId
 */
router.patch('/:reviewId',
    authenticate,
    reviewController.updateReview
);

/**
 * 리뷰 삭제 API
 * DELETE /api/reviews/:reviewId
 */
router.delete('/:reviewId',
    authenticate,
    reviewController.deleteReview
);

export default router;