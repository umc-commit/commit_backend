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