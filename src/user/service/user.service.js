import { UserRepository } from "../repository/user.repository.js";
import { OauthIdAlreadyExistError, MissingCategoryError, MissingRequiredAgreementError, UserNotSignupedError } from "../../common/errors/user.errors.js";
import axios from "axios";
import { signJwt } from "../../jwt.config.js";
import { AccessUserCategories } from "../controller/user.controller.js";

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

        // 6. 회원가입 완료 -> 정식 로그인 토큰 발급 
        const loginToken = signJwt({
            userId: userProfile.id.toString(),
        })

        return {
            message : "회원가입이 성공적으로 완료되었습니다.",
            token:loginToken,
            user: {
                userId : userProfile.id,
                nickname : userProfile.nickname,
                provider,
                oauth_id,
                createdAt : account.createdAt
            }
        };
    },
    
    async userLogin(dto) {
        let oauth_id;

        console.log("👉 Google access token:", dto.accessToken); //token 확인

        if(dto.provider === "google") {
            const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo",{
                headers:{
                    Authorization : `Bearer ${dto.accessToken}`
                }
            });

            oauth_id = response.data.sub;
        }

        const account = await UserRepository.findAccountByOauthId(dto.provider, oauth_id);
        console.log("✅ account:", account);
        console.log("✅ account.users:", account.users);
        console.log("✅ account.users[0]:", account.users?.[0]);

        if(account) {
            // JWT 발급
            const token = signJwt({userId : account.users[0].id.toString()});
            return {token, nickname: account.users[0].nickname};
        } else{
            const signupToken = signJwt({provider : dto.provider, oauth_id});
            return {signupRequired : true, token : signupToken};
        }   
    },
    // 사용자 프로필 조회 
    async getUserProfile(userId) {
        const user = await UserRepository.findUserById(userId);
        if(!user) return null;
        return {
            message:"나의 프로필 조회에 성공하였습니다.",
            user:{
                userId: user.id.toString(),
                nickname: user.nickname,
                profileImage:user.profileImage,
                description: user.description
            }
        }
    },
    // 나의 프로필 수정 
    async updateMyprofile(userId, dto) {
        const user = await UserRepository.findUserById(userId);
        if(!user) return null;

        const updates = {};
        if(dto.nickname !== undefined) updates.nickname = dto.nickname;
        if(dto.description !=undefined) updates.description = dto.description;
        if(dto.profileImage != undefined) updates.profileImage = dto.profileImage;

        // 아무것도 수정할 게 없으면? 
        if(Object.keys(updates).length ===0){
            return{
                message:"수정할 항목이 없습니다.",
                user:{
                    userId: user.id.toString(),
                    nickname: user.nickname,
                    profileImage: user.profileImage,
                    description: user.description,
                }
            };
        }

        const updatedUser = await UserRepository.updateMyprofile(userId, updates);

        return {
            message:"프로필 수정이 완료되었습니다.",
            user:{
                userId: updatedUser.id.toString(),
                nickname: updatedUser.nickname,
                profileImage: updatedUser.profileImage,
                description: updatedUser.description,
            }
        };
    },

    // 사용자가 선택한 카테고리 조회 
    async accessUserCategories(userId) {
        const user = await UserRepository.AccessUserCategories(userId);
        if(!user) return null;

        const categoryName = user.userCategories.map(uc => uc.category.name);

        return {
            message:"사용자가 선택한 카테고리 조회에 성공했습니다.",
            user:{
                categories:categoryName,
            }
        }
    },
    
    // 사용자 닉네임 중복 확인 
    async isNicknameDuplicate(nickname) {
        const duplicate = await UserRepository.checkNicknameDuplicate(nickname);

        if(duplicate) return{
            message:"중복된 닉네임입니다.",
            nickname: nickname
        }
        return {
            message:"사용 가능한 닉네임입니다.",
            nickname : nickname
        }
    }
}