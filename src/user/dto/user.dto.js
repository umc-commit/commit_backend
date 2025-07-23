// 000으로 시작하기 버튼 클릭 시 
export class UserLoginRequestDto {
    constructor({provider, accessToken}) {
        this.provider = provider;
        this.accessToken = accessToken;
    }
}

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

// 나의 프로필 수정 요청 
export class UpdateMyprofileDto{
    constructor({nickname, description, profileImage}) {
        this.nickname = nickname;
        this.description= description;
        this.profileImage = profileImage;
    }
}

