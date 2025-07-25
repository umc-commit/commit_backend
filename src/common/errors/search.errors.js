import { BaseError } from "./BaseError.js";

export class InvalidSearchKeywordError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "S001",
      reason: "검색어는 1글자 이상이어야 합니다.",
      statusCode: 400,
      data,
    });
  }
}

export class SearchKeywordTooLongError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "S002", 
      reason: "검색어는 100글자 이하여야 합니다.",
      statusCode: 400,
      data,
    });
  }
}

export class InvalidCategoryIdError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "S003",
      reason: "유효하지 않은 카테고리 ID입니다.",
      statusCode: 400,
      data,
    });
  }
}

export class InvalidSortTypeError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "S004",
      reason: "정렬 방식은 latest, price_low, price_high 중 하나여야 합니다.",
      statusCode: 400,
      data,
    });
  }
}

export class InvalidDeadlineError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "S005",
      reason: "마감 기한은 all, 1, 7, 14, 30 중 하나여야 합니다.",
      statusCode: 400,
      data,
    });
  }
}

export class InvalidPageError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "S006",
      reason: "페이지 번호는 1 이상이어야 합니다.",
      statusCode: 400,
      data,
    });
  }
}

export class InvalidLimitError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "S007",
      reason: "페이지당 결과 수는 1~50 사이여야 합니다.",
      statusCode: 400,
      data,
    });
  }
}

export class CategoryNotFoundError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "S008",
      reason: "존재하지 않는 카테고리입니다.", 
      statusCode: 404,
      data,
    });
  }
}

export class InvalidPriceRangeError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "S009",
      reason: "최대 가격은 최소 가격보다 커야 합니다.",
      statusCode: 400,
      data,
    });
  }
}