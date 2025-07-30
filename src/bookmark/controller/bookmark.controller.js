import { StatusCodes } from "http-status-codes";
import { BookmarkService } from '../service/bookmark.service.js';
import {
  CreateBookmarkDto,
  DeleteBookmarkDto,
  DeleteSelectedBookmarksDto,
  GetBookmarksDto
} from "../dto/bookmark.dto.js";
import { parseWithBigInt, stringifyWithBigInt } from "../../bigintJson.js";

// 북마크 추가
export const addBookmark = async (req, res, next) => {
 try {
   const userId = BigInt(req.user.userId);
   const dto = new CreateBookmarkDto({
     commissionId: BigInt(req.params.commissionId)
   });

   const bookmark = await BookmarkService.addBookmark(userId, dto);
   const responseData = parseWithBigInt(stringifyWithBigInt({
     bookmarkId: bookmark.bookmarkId,
     commissionId: bookmark.commissionId,
     message: "북마크가 추가되었습니다."
   }));

   res.status(StatusCodes.CREATED).success(responseData);
 } catch (err) {
   next(err);
 }
}

// 북마크 삭제
export async function deleteBookmark(req, res, next) {
  try {
    const userId = BigInt(req.user.userId);
    const dto = new DeleteBookmarkDto({
      commissionId: BigInt(req.params.commissionId),
      bookmarkId: BigInt(req.params.bookmarkId),
    });

    const result = await BookmarkService.deleteBookmark(userId, dto);
    const response = parseWithBigInt(stringifyWithBigInt({
      ...result,
      message: "북마크가 삭제되었습니다.",
    }));

    return res.success(response);
  } catch (err) {
    next(err);
  }
}

// 북마크 선택 삭제
export async function deleteSelectedBookmarks(req, res, next) {
  try {
    const userId = BigInt(req.user.userId);
    const dto = new DeleteSelectedBookmarksDto({
      bookmarkIds: req.body.bookmarkIds.map(id => BigInt(id)),
    });

    const result = await BookmarkService.deleteSelectedBookmarks(userId, dto);
    const response = parseWithBigInt(stringifyWithBigInt({
      ...result,
      message: "선택한 북마크가 삭제되었습니다.",
    }));

    return res.success(response);
  } catch (err) {
    next(err);
  }
}

// 북마크 목록 조회
export const getBookmarks = async (req, res, next) => {
  try {
    const userId = BigInt(req.user.userId);
    const dto = new GetBookmarksDto({
      sort: req.query.sort,
      page: req.query.page ? parseInt(req.query.page) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      excludeFullSlots: req.query.excludeFullSlots === 'true'
    });

    const bookmarks = await BookmarkService.getBookmarks(userId, dto);
    const json = stringifyWithBigInt({
      resultType: "SUCCESS",
      error: null,
      success: bookmarks
    });

    res.setHeader("Content-Type", "application/json");
    res.status(StatusCodes.OK).send(json);
  } catch (err) {
    next(err);
  }
};