import { BaseError } from "./BaseError.js";

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

export class UnauthorizedRequestStatusChangeError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "R003", 
      reason: "변경 권한이 없는 사용자입니다.",
      statusCode: 403,
      data,
    });
  }
}

export class InvalidStatusTransitionError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "R004",
      reason: "유효하지 않은 상태 변경입니다.",
      statusCode: 400,
      data,
    });
  }
}

export class StatusAlreadyChangedError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "R005",
      reason: "이미 상태가 변경되었습니다.",
      statusCode: 400,
      data,
    });
  }
}