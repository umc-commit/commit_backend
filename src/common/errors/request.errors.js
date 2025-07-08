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