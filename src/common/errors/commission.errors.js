import { BaseError } from "./BaseError.js";

export class CommissionNotFoundError extends BaseError {
 constructor(data = null) {
   super({
     errorCode: "C001",
     reason: "존재하지 않는 커미션입니다.",
     statusCode: 404,
     data,
   });
 }
}

export class FileSizeExceededError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "C002",
      reason: "파일 크기가 너무 큽니다.",
      statusCode: 400,
      data,
    });
  }
}

export class UnsupportedImageFormatError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "C003",
      reason: "지원하지 않는 파일 형식입니다.",
      statusCode: 400,
      data,
    });
  }
}

export class ImageUploadFailedError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "C004",
      reason: "이미지 업로드에 실패했습니다.",
      statusCode: 400,
      data,
    });
  }
}