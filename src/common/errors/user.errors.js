import { BaseError } from "./BaseError.js";

// 에러코드는 현재 임시로 지정
export class UserNotFoundError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "U001",
      reason: "user id를 찾을 수 없습니다.",
      statusCode: 404,
      data,
    });
  }
}

export class ArtistNotFoundError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "U002",
      reason: "artist id를 찾을 수 없습니다.",
      statusCode: 404,
      data,
    });
  }
}