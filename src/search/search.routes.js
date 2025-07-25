import { Router } from 'express';
import { 
    searchCommissions,
    getRecommendedTags 
} from './controller/search.controller.js';
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// 검색 조회 API
router.get('/', authenticate, searchCommissions);

// 추천 태그 조회 API
router.get('/tags', authenticate, getRecommendedTags);

export default router;