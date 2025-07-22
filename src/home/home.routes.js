import { Router } from 'express';
import { getHomeData } from "./controller/home.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// 홈화면 조회 API
router.get('/', authenticate, getHomeData);

export default router;