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

export class OauthIdAlreadyExistError extends BaseError {
  constructor(data=null){
    super({
      errorCode:"U002",
      reason : '이미 소셜로그인 계정이 존재합니다.',
      statusCode: 404,
      data,
    })
  }
}