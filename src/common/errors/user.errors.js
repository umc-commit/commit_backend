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

export class UserRoleError extends BaseError {
  constructor(data=null){
    super({
      errorCode:"U006",
      reason : 'role을 정확히 전달해주세요.',
      statusCode: 404,
      data,
    })
  }
};

export class UserAlreadyFollowArtist extends BaseError {
  constructor(data=null){
    super({
      errorCode:"U007",
      reason : '이미 해당 작가를 팔로우하고 있습니다.',
      statusCode: 409,
      data,
    })
  }
};

export class ArtistNotFound extends BaseError {
  constructor(data=null){
    super({
      errorCode:"U008",
      reason : '해당 작가가 존재하지 않습니다.',
      statusCode: 404,
      data,
    })
  }
};

export class NotFollowingArtist extends BaseError {
  constructor(data=null){
    super({
      errorCode:"U009",
      reason : '해당 작가를 팔로우하고 있지 않습니다.',
      statusCode: 409,
      data,
    })
  }
};
