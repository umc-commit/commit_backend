import { BaseError } from "./BaseError.js";


export class OauthIdAlreadyExistError extends BaseError {
  constructor(data=null){
    super({
      errorCode:"U001",
      reason : '이미 등록된 소셜 로그인 계정입니다.',
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

export class UserNotFoundError extends BaseError {
  constructor(data=null){
    super({
      errorCode:"U004",
      reason : '사용자를 찾을 수 없습니다.',
      statusCode: 409,
      data,
    })
  }
};

export class UserNotSignupedError extends BaseError {
  constructor(data=null){
    super({
      errorCode:"U005",
      reason : '회원가입이 필요합니다.',
      statusCode: 404,
      data,
    })
  }
};
