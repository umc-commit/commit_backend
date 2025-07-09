import { BookmarkRepository } from "../repository/bookmark.repository.js";
import * as CommissionRepository from "../../commission/repository/commission.repository.js";
import {
  CommissionNotFoundError,
  AlreadyBookmarkedError,
  NotBookmarkedError,
  InvalidBookmarkIdsError,
  ForbiddenBookmarkAccessError,
  SomeBookmarksNotFoundError,
} from "../../common/errors/bookmark.errors.js";

export const BookmarkService = {
 
 //북마크 추가
 async addBookmark(userId, dto) {
   const { commissionId } = dto;

   // 1. 커미션 존재 여부 확인
   const commission = await CommissionRepository.findCommissionById(commissionId);
   if (!commission) {
     throw new CommissionNotFoundError({ commissionId });
   }

   // 2. 이미 북마크되어 있는지 확인
   const existingBookmark = await BookmarkRepository.findBookmarkByUserAndCommission(userId, commissionId);
   if (existingBookmark) {
     throw new AlreadyBookmarkedError({ 
       userId, 
       commissionId,
       bookmarkId: existingBookmark.id 
     });
   }

   // 3. 북마크 생성
   const bookmark = await BookmarkRepository.createBookmark({
     userId,
     commissionId
   });

   return {
     bookmarkId: bookmark.id,
     commissionId: bookmark.commissionId
   };
 },

 // 북마크 삭제
  async deleteBookmark(userId, dto) {
    const { commissionId, bookmarkId } = dto;

    const commission = await CommissionRepository.findCommissionById(commissionId);
    if (!commission) throw new CommissionNotFoundError({ commissionId });

    const bookmark = await BookmarkRepository.findBookmarkById(bookmarkId);
    if (!bookmark) throw new NotBookmarkedError({ bookmarkId });

    if (bookmark.userId !== userId || bookmark.commissionId !== commissionId) {
      throw new ForbiddenBookmarkAccessError({ bookmarkId });
    }

    await BookmarkRepository.deleteBookmark(bookmarkId);

    return {
      bookmarkId,
      commissionId,
    };
  },

   // 북마크 다중 삭제
  async deleteSelectedBookmarks(userId, dto) {
    const { bookmarkIds } = dto;

    if (!Array.isArray(bookmarkIds) || bookmarkIds.length === 0) {
      throw new InvalidBookmarkIdsError();
    }

    const bookmarks = await BookmarkRepository.findBookmarksByIds(bookmarkIds);

    const invalidIds = bookmarks.filter(b => b.userId !== userId).map(b => b.id);
    const validIds = bookmarks.filter(b => b.userId === userId).map(b => b.id);

    if (validIds.length > 0) {
      await BookmarkRepository.deleteBookmarksByIds(validIds);
    }

    if (invalidIds.length > 0 || validIds.length !== bookmarkIds.length) {
      throw new SomeBookmarksNotFoundError({
        notDeleted: bookmarkIds.filter(id => !validIds.includes(id)),
        deleted: validIds,
      });
    }

    return {
      bookmarkIds: validIds,
    };
  },
};