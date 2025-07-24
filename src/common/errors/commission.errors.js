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

export class RequiredFieldMissingError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "C005",
      reason: "필수 필드가 누락되었습니다.",
      statusCode: 400,
      data,
    });
  }
}

export class InvalidOptionValueError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "C006",
      reason: "잘못된 옵션 값입니다.",
      statusCode: 400,
      data,
    });
  }
}

export class FileCountExceededError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "C007",
      reason: "파일 개수가 초과되었습니다.",
      statusCode: 400,
      data,
    });
  }
}

export class TextLengthExceededError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "C008",
      reason: "텍스트 길이가 초과되었습니다.",
      statusCode: 400,
      data,
    });
  }
}

export class InvalidFormSchemaError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "C009",
      reason: "폼 형식과 맞지 않습니다.",
      statusCode: 400,
      data,
    });
  }
}

export class DuplicateRequestError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "C010",
      reason: "이미 신청한 커미션입니다.",
      statusCode: 400,
      data,
    });
  }
}