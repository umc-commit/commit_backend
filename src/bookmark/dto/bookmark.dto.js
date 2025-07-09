export class CreateBookmarkDto {
  constructor({ commissionId }) {
    this.commissionId = commissionId;
  }
}

export class DeleteBookmarkDto {
  constructor({ commissionId, bookmarkId }) {
    this.commissionId = commissionId;
    this.bookmarkId = bookmarkId;
  }
}

export class DeleteSelectedBookmarksDto {
  constructor({ bookmarkIds }) {
    this.bookmarkIds = bookmarkIds;
  }
}