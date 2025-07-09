import { BaseError } from "./BaseError.js";

export class CommissionNotFoundError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "B001",
      reason: "존재하지 않는 커미션입니다.",
      statusCode: 404,
      data,
    });
  }
}

export class AlreadyBookmarkedError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "B002",
      reason: "이미 북마크된 커미션입니다.",
      statusCode: 400,
      data,
    });
  }
}

export class NotBookmarkedError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "B003",
      reason: "북마크되지 않은 커미션입니다.",
      statusCode: 400,
      data,
    });
  }
}

export class InvalidBookmarkIdsError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "B004",
      reason: "bookmarkIds는 최소 1개 이상의 배열 형태여야 합니다.",
      statusCode: 400,
      data,
    });
  }
}

export class ForbiddenBookmarkAccessError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "B005",
      reason: "해당 북마크에 접근 권한이 없습니다.",
      statusCode: 403,
      data,
    });
  }
}

export class SomeBookmarksNotFoundError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "B006",
      reason: "일부 북마크 ID가 존재하지 않거나 삭제할 수 없습니다.",
      statusCode: 207,
      data,
    });
  }
}