import { BaseError } from "./BaseError.js";

export class ChatroomNotFoundError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "M001",
      reason: "Chatroom id를 찾을 수 없습니다.",
      statusCode: 404,
      data,
    });
  }
}

export class ForbiddenError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "M002",
      reason: "권한이 없습니다.",
      statusCode: 403,
      data,
    });
  }
}