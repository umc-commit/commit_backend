import { BaseError } from "./BaseError.js";

export class ArtistNotFoundError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "A001",
      reason: "artist id를 찾을 수 없습니다.",
      statusCode: 404,
      data,
    });
  }
}