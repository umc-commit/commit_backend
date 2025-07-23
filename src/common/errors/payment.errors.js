import { BaseError } from "./BaseError.js";

export class ProductNotFoundError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "P001",
      reason: "Product id를 찾을 수 없습니다.",
      statusCode: 404,
      data,
    });
  }
}

export class PaymentAmountMismatchError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "P002",
      reason: "결제 금액이 일치하지 않습니다.",
      statusCode: 400,
      data,
    });
  }
}

export class DuplicatePaymentError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "P003",
      reason: "이미 결제된 거래입니다.",
      statusCode: 400,
      data,
    });
  }
}