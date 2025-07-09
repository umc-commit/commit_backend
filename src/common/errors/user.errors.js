import { BaseError } from "./BaseError.js";


export class OauthIdAlreadyExistError extends BaseError {
  constructor(data=null){
    super({
      errorCode:"U001",
      reason : '이미 소셜로그인 계정이 존재합니다.',
      statusCode: 404,
      data,
    })
  }
};