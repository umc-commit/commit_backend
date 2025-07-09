import { UserRepository } from "../repository/user.repository.js";
import { OauthIdAlreadyExistError, MissingCategoryError, MissingRequiredAgreementError } from "../../common/errors/user.errors.js";

export const UserService = {
    
    // 사용자(계정) 추가 
    async addAccount(dto) {
        const {oauth_id, provider, nickname, agreements, categories} = dto;

        const requiredAgreements = [1, 2];
        const hasAllRequired = requiredAgreements.every(id => agreements.includes(id));
        if (!hasAllRequired) {
        throw new MissingRequiredAgreementError(); // 커스텀 에러로 따로 정의해두면 좋음
        }

        if (!categories || categories.length === 0) {
        throw new MissingCategoryError(); // 커스텀 에러 정의 필요
        }

        // 1. 사용자(계정) 존재 여부 확인 
        const existingAccount = await UserRepository.findAccountByOauthId(provider, oauth_id);
        if(existingAccount) {
            throw new OauthIdAlreadyExistError({oauth_id});
        }

        // 2. 사용자(계정) 생성
        const account = await UserRepository.createAccount(provider, oauth_id);

        // 3. 사용자 프로필 생성 
        const userProfile = await UserRepository.createUserProfile(account.id, nickname, ".");

        // 4. 사용자 약관 동의 처리 (agreements -> 사용자가 동의한 agreement id 배열)
        const userAgreement = await UserRepository.createUserAgreements(userProfile.id, agreements);

        // 5. 사용자가 선한 카테고리 처리 (categories -> 사용자가 선택한 category id 배열 )
        const userCategory = await UserRepository.createUserCategories(userProfile.id, categories);

        return {
            message : "회원가입이 성공적으로 완료되었습니다.",
            user: {
                userId : userProfile.id,
                nickname : userProfile.nickname,
                provider,
                oauth_id,
                createdAt : account.createdAt
            }
        };
    } 
}