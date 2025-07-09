export class UserSignupRequestDto {
    constructor({nickname,provider, oauth_id, categories, agreements}) {
        this.nickname = nickname;
        this.provider = provider; 
        this.oauth_id = oauth_id;
        this.categories = categories; // 배열
        this.agreements = agreements; // 배열
    }
}