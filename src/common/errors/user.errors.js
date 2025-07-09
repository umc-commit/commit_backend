import { BaseError } from "./BaseError.js";


export class OauthIdAlreadyExistError extends BaseError {
  constructor(data=null){
    super({
      errorCode:"U001",
      reason : '이미 소셜로그인 계정이 존재합니다.',
      statusCode: 409,
      data,
    })
  }
};

export class MissingRequiredAgreementError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "U002",
      reason: "필수 약관에 모두 동의해야 합니다.",
      statusCode: 400,
      data,
    });
  }
}

export class MissingCategoryError extends BaseError {
  constructor(data = null) {
    super({
      errorCode: "U003",
      reason: "카테고리는 최소 1개 이상 선택해야 합니다.",
      statusCode: 400,
      data,
    });
  }
}
