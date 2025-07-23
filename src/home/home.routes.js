import { Router } from 'express';
import { 
    getHomeData,
    getFollowingCommissions
 } from "./controller/home.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// 홈화면 조회 API
router.get('/', authenticate, getHomeData);

// 팔로잉 작가 커미션 조회 API
router.get('/following', authenticate, getFollowingCommissions);

export default router;