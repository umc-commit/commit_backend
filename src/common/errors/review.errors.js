import { BaseError } from './BaseError.js';

export class ReviewNotFoundError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "R001",
      reason: "리뷰를 찾을 수 없습니다",
      statusCode: 404, // Not Found
      data,
    });
  }
}

export class ReviewAlreadyExistsError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "R002",
      reason: "이미 리뷰를 작성했습니다",
      statusCode: 409, // Conflict
      data,
    });
  }
}

export class ReviewContentTooShortError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "R003",
      reason: "리뷰 내용이 10자 미만입니다",
      statusCode: 400, // Bad Request
      data,
    });
  }
}

export class ReviewContentTooLongError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "R011",
      reason: "리뷰 내용이 1000자를 초과합니다",
      statusCode: 400, // Bad Request
      data,
    });
  }
}

export class RequestNotFoundError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "R004",
      reason: "신청한 커미션을 찾을 수 없습니다",
      statusCode: 404, // Not Found
      data,
    });
  }
}

export class ReviewPermissionDeniedError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "R005",
      reason: "리뷰 작성 권한이 없습니다",
      statusCode: 403, // Forbidden
      data,
    });
  }
}

export class RequestNotCompletedError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "R006",
      reason: "아직 완료되지 않은 커미션에 대한 리뷰 작성은 불가능합니다",
      statusCode: 400, // Bad Request
      data,
    });
  }
}

export class ImageUploadFailedError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "R007",
      reason: "리뷰 이미지 업로드에 실패했습니다",
      statusCode: 500, // Internal Server Error
      data,
    });
  }
}

export class UnsupportedImageFormatError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "R008",
      reason: "지원하지 않는 파일 형식입니다",
      statusCode: 400, // Bad Request
      data,
    });
  }
}

export class FileSizeExceededError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "R009",
      reason: "이미지 파일 크기가 초과되었습니다",
      statusCode: 413, // Payload Too Large
      data,
    });
  }
}

export class ReviewRatingInvalidError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "R010",
      reason: "별점은 1-5 사이의 값이어야 합니다",
      statusCode: 400, // Bad Request
      data,
    });
  }
}