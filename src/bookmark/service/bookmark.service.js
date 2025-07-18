import { BookmarkRepository } from "../repository/bookmark.repository.js";
import { CommissionRepository } from "../../commission/repository/commission.repository.js";
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

    // 북마크 목록 조회
  async getBookmarks(userId, dto) {
    const { sort, limit, cursor, excludeFullSlots = false } = dto;

    const bookmarks = await BookmarkRepository.findBookmarksByUserId(userId, dto);
    
    const hasNext = bookmarks.length > limit;
    const items = hasNext ? bookmarks.slice(0, -1) : bookmarks;

    const totalCount = await BookmarkRepository.countBookmarksByUserId(userId);

    // nextCursor 생성
    let nextCursor = null;
    if (hasNext && items.length > 0) {
      const lastItem = items[items.length - 1];
      const cursorData = {
        id: Number(lastItem.id),
        created_at: lastItem.createdAt.toISOString()
      };
      
      if (sort === 'price_low' || sort === 'price_high') {
        cursorData.min_price = lastItem.commission.minPrice;
      }
      
      nextCursor = Buffer.from(JSON.stringify(cursorData)).toString('base64');
    }

    // 응답 데이터 가공
    const formattedItems = await Promise.all(
      items.map(async (bookmark) => {
        // 썸네일 이미지 조회
        const thumbnailImage = await BookmarkRepository.findThumbnailImageByCommissionId(bookmark.commission.id);
        
        // 남은 슬롯수 계산
        const remainingSlots = bookmark.commission.artist.slot - bookmark.commission.requests.length;

        return {
          id: Number(bookmark.commission.id),
          title: bookmark.commission.title,
          minPrice: bookmark.commission.minPrice,
          category: bookmark.commission.category,
          tags: bookmark.commission.commissionTags.map(ct => ct.tag),
          thumbnailImageUrl: thumbnailImage?.imageUrl || null,
          remainingSlots,
          artist: {
            id: Number(bookmark.commission.artist.id),
            nickname: bookmark.commission.artist.nickname,
            profileImageUrl: bookmark.commission.artist.profileImage
          }
        };
      })
    );

    // 마감 커미션 제외 토글 상태에 따라 필터링
    const filteredItems = excludeFullSlots 
    ? formattedItems.filter(item => item.remainingSlots > 0)
    : formattedItems;

    return {
      totalCount: filteredItems.length,
      hasNext,
      nextCursor,
      items: filteredItems
    };
  },
};