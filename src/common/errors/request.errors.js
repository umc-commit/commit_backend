import { BaseError } from "./BaseError.js";

// 에러코드는 현재 임시로 지정
export class RequestNotFoundError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "R001",
      reason: "Request id를 찾을 수 없습니다.",
      statusCode: 404,
      data,
    });
  }
}

export class InvalidRequestFilterError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "R002",
      reason: "유효하지 않은 필터 조건입니다. (all, ongoing, completed 중 하나여야 합니다)",
      statusCode: 400,
      data,
    });
  }
}