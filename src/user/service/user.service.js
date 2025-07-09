import { UserRepository } from "../repository/user.repository.js";
import { OauthIdAlreadyExistError } from "../../common/errors/user.errors.js";

export const UserService = {
    
    // 사용자(게정) 추가 
    async addAccount(dto) {
        const {oauth_id, provider} = dto;

        // 1. 사용자(계정) 존재 여부 확인 
        const existingAccount = await UserRepository.findAccountByOauthId(provider, oauth_id);
        if(existingAccount) {
            throw new OauthIdAlreadyExistError({oauth_id})
        }

        // 2. 사용자(계정) 생성
        const account = await UserRepository.createAccount(provider, oauth_id,)

        return {
            accountId : account.id,
            provider,
            oauth_id,
            createdAt : account.createdAt,
        };
    } 
}