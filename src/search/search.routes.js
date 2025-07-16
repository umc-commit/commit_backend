import { Router } from 'express';
import { getRecommendedTags } from './controller/search.controller.js';
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * GET /api/search/tags
 * 추천 태그 5개 조회
 */
router.get('/tags', authenticate, getRecommendedTags);

export default router;