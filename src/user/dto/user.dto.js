// 회원가입 요청
export class UserSignupRequestDto {
    constructor({nickname,provider, oauth_id, categories, agreements}) {
        this.nickname = nickname;
        this.provider = provider; 
        this.oauth_id = oauth_id;
        this.categories = categories; // 배열
        this.agreements = agreements; // 배열
    }
}

// 로그인 요청 
export class UserLoginRequestDto{
    constructor({provider, oauth_id}) {
        this.provider = provider;
        this.oauth_id = oauth_id;
    }
}