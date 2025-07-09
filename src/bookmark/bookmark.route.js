import { Router } from 'express';
import {
  addBookmark,
  deleteBookmark,
  deleteSelectedBookmarks,
} from "./controller/bookmark.controller.js";

const router = Router();

// 북마크 추가 API
router.post('/commissions/:commissionId/bookmarks', addBookmark);

// 북마크 삭제 API
router.delete("/commissions/:commissionId/bookmarks/:bookmarkId", deleteBookmark);

// 북마크 선택 삭제 API
router.delete("/bookmarks", deleteSelectedBookmarks);

export default router;