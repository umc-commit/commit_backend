// 북마크 추가 dto
export class CreateBookmarkDto {
  constructor({ commissionId }) {
    this.commissionId = commissionId;
  }
}

// 북마크 삭제 dto
export class DeleteBookmarkDto {
  constructor({ commissionId, bookmarkId }) {
    this.commissionId = commissionId;
    this.bookmarkId = bookmarkId;
  }
}

// 북마크 선택 삭제 dto
export class DeleteSelectedBookmarksDto {
  constructor({ bookmarkIds }) {
    this.bookmarkIds = bookmarkIds;
  }
}

// 사용자 북마크 조회 dto
export class GetBookmarksDto {
  constructor({ sort, limit, cursor, excludeFullSlots }) {
    this.sort = sort || 'latest';
    this.limit = limit || 12;
    this.cursor = cursor || null;
    this.excludeFullSlots = excludeFullSlots || false;
  }
}