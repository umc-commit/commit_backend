import { Router } from 'express';
import {
  addBookmark,
  deleteBookmark,
  deleteSelectedBookmarks,
} from "./controller/bookmark.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// 북마크 추가 API
router.post('/commissions/:commissionId/bookmarks', authenticate, addBookmark);

// 북마크 삭제 API
router.delete("/commissions/:commissionId/bookmarks/:bookmarkId", authenticate, deleteBookmark);

// 북마크 선택 삭제 API
router.delete("/bookmarks", authenticate, deleteSelectedBookmarks);

export default router;