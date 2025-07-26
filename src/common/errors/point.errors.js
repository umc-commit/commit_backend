import { BaseError } from "./BaseError.js";

export class InsufficientPointError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "P004",
      reason: "포인트 잔액이 부족합니다.",
      statusCode: 400,
      data,
    });
  }
}