import { UserRepository } from "../repository/user.repository.js";
import { OauthIdAlreadyExistError, MissingCategoryError, MissingRequiredAgreementError, UserRoleError, UserAlreadyFollowArtist, ArtistNotFound, NotFollowingArtist } from "../../common/errors/user.errors.js";
import axios from "axios";
import { signJwt } from "../../jwt.config.js";
import { BadgeRepository } from "../repository/badge.repository.js";
import { CommissionRepository } from "../../commission/repository/commission.repository.js";
import reviewRepository from "../../review/repository/review.repository.js";


export const UserService = {
    
    // 사용자(계정) 추가 
    async addAccount(dto) {
        const {oauth_id, provider, nickname, agreements, categories, role} = dto;

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

        let profile;

        if(role === "client") {
            // 3. 사용자 프로필 생성 
            profile = await UserRepository.createUserProfile(account.id, nickname, ".");

            console.log("user profile -> ", profile);

            // 4. 사용자 약관 동의 처리 (agreements -> 사용자가 동의한 agreement id 배열)
            await UserRepository.createUserAgreements(profile.accountId, agreements);

            // 5. 사용자가 선한 카테고리 처리 (categories -> 사용자가 선택한 category id 배열 )
            await UserRepository.createUserCategories(profile.accountId, categories);
        } 
        else if (role === "artist") {
            // 3. 사용자 프로필 생성 
            profile = await UserRepository.createArtistProfile(account.id, nickname, ".");

            console.log("artist profile -> ", profile);

            // 4. 사용자 약관 동의 처리 (agreements -> 사용자가 동의한 agreement id 배열)
            await UserRepository.createUserAgreements(profile.accountId, agreements);

            // 5. 사용자가 선한 카테고리 처리 (categories -> 사용자가 선택한 category id 배열 )
            await UserRepository.createUserCategories(profile.accountId, categories);
        }
        else {
            throw new UserRoleError();
        }


        // 6. 회원가입 완료 -> 정식 로그인 토큰 발급 
        const loginToken = signJwt({
            userId: profile.id.toString(),
        })

        return {
            message : "회원가입이 성공적으로 완료되었습니다.",
            token:loginToken,
            user: {
                userId : profile.id,
                nickname : profile.nickname,
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
    async getUserProfile(accountId, userId, role) {

        let result;

        if(role === 'client') {
            result = await UserRepository.getMyProfile(accountId);
            console.log(result);
            const user = result.users[0];

            console.log("userBadges 확인:", result.userBadges);


            const badges = result.userBadges.map(userBadge => ({
                id: userBadge.id,
                earnedAt: userBadge.earnedAt,
                badge: userBadge.badge
            }));

            const reviews = (await UserRepository.UserReviewList(userId)) ?? [];

            const reviewsThumbnailImage = await Promise.all(
                reviews.map(async (r) => {
                    const images = await reviewRepository.getImagesByTarget("review", r.id);
                    const title = await CommissionRepository.findCommissionTitle(r.requestId);
                    const reviewThumbnail = images?.[0]?.imageUrl ?? null;

                    return {...r, reviewThumbnail, title}
                })
            )



            return {
                message:"나의 프로필 조회에 성공하였습니다.",
                user:{
                    userId: user.id,
                    nickname: user.nickname,
                    profileImage:user.profileImage,
                    description: user.description,
                    badges,
                    reviews : reviewsThumbnailImage
                }
            }
        }

        if(role === 'artist') {
            result = await UserRepository.getMyProfile(accountId);
            console.log(result);
            const artist = result.artists[0];

            console.log("userBadges 확인:", result.userBadges);

            const badges = result.userBadges.map((userBadge) => ({
            id: userBadge.id,
            earnedAt: userBadge.earnedAt,
            badge: userBadge.badge? [userBadge.badge] : []
            }));

            return {
                message:"나의 프로필 조회에 성공하였습니다.",
                user:{
                    artistId: artist.id,
                    nickname: artist.nickname,
                    profileImage:artist.profileImage,
                    description: artist.description,
                    badges
                },
            }
        }
    },
    // 나의 프로필 수정 
    async updateMyprofile(accountId, dto, role) {
        let user;
        if(role === "client") {
            user = await UserRepository.findUserById(accountId);
        }

        if(role === "artist") {
            user = await UserRepository.findArtistById(accountId);
        }

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

        let updatedUser;

        if(role === "client"){
            updatedUser = await UserRepository.updateMyprofile(accountId, updates);

            return {
            message:"프로필 수정이 완료되었습니다.",
            user:{
                userId: updatedUser.id.toString(),
                nickname: updatedUser.nickname,
                profileImage: updatedUser.profileImage,
                description: updatedUser.description,
                }
            };
        }

        if(role === "artist"){
            updatedUser = await UserRepository.updateArtistProfile(accountId, updates);

            return {
            message:"프로필 수정이 완료되었습니다.",
            user:{
                userId: updatedUser.id.toString(),
                nickname: updatedUser.nickname,
                profileImage: updatedUser.profileImage,
                description: updatedUser.description,
                }
            };
        }
    },

    // 사용자가 선택한 카테고리 조회 
    async accessUserCategories(accountId) {
        const user = await UserRepository.AccessUserCategories(accountId);
        console.log(user);
        if(!user) return null;

        const categoryName = user.map(item => item.category.name);

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
    },

    // 작가 팔로우하기 
    async FollowArtist(accountId, artistId) {
        const artist = await UserRepository.findArtistById(accountId);

        if(!artist) 
            throw new ArtistNotFound();

        const alreadyFollowing = await UserRepository.AlreadyFollow(accountId, artistId);

        if(alreadyFollowing) 
            throw new UserAlreadyFollowArtist();
        
        const result = await UserRepository.FollowArtist(accountId, artistId);
        
        await BadgeRepository.GiveFollowerBadges(artistId, accountId);

        return {
            message:"해당 작가 팔로우를 성공했습니다.",
            artistId:result.artistId
        }
    },

    // 작가 팔로우 취소하기 
    async CancelArtistFollow(accountId, artistId) {
        const artist = await UserRepository.findArtistById(accountId);

        if(!artist)
            throw new ArtistNotFound();

        const FollowState = await UserRepository.AlreadyFollow(accountId, artistId);

        if(!FollowState)
            throw new NotFollowingArtist();

        const result = await UserRepository.CancelArtistFollow(accountId, artistId);

        return {
            message: "해당 작가 팔로우를 취소했습니다.",
            artistId: result.artistId
        }
    },
    
    // 사용자가 팔로우한 작가 조회하기 
    async LookUserFollow(accountId) {
        const artistList = await UserRepository.LookUserFollow(accountId);

        if(artistList.length === 0) return {
            message:"팔로우하는 작가가 없습니다.",
            artistList:[]
        };

        return{
            message:"사용자가 팔로우하는 작가 목록입니다.",
            artistList
        };
    },

    // 사용자가 작성한 리뷰 횟수 조회하기 
    async CountUserReview(userId){
        return await UserRepository.CountUserReview(userId);
    },

    // 사용자가 신청한 커미션 횟수 조회하기 
    async CountUserCommissionRequest(userId){
        return await UserRepository.countClientCommissionApplication(userId);
    },

    // 특정 progress에 도달했을 때 발급 가능한 뱃지 조회 
    async FindBadgesByProgress(type, progress){
        return await BadgeRepository.findEligibleBadgesByProgress(type, progress);
    },

    // 뱃지 발급 처리 로직 통합
    async GrantBadgesByProgress(accountId, type, progress){
        const eligibleBadges = await BadgeRepository.findEligibleBadgesByProgress(type, progress);
        const badgeIds = eligibleBadges.map((badge)=> badge.id);
        if(!badgeIds.length) return;

        await BadgeRepository.createManyUserBadges(accountId, badgeIds);
    },

    // 사용자의 뱃지 조회하기 
    async ViewUserBadge(accountId){
        return await BadgeRepository.ViewUserBadges(accountId);
    },
    // 작가 프로필 조회하기 
    async AccessArtistProfile(artistId, accountId, userId) {
        const profile = await UserRepository.AccessArtistProfile(artistId);

        if(!profile)
            throw new ArtistNotFound();
        
        const rawReviews = await UserRepository.ArtistReviews(artistId);
        

        const reviews = await Promise.all(
            rawReviews.map(async (r) => {
        
            const start = r.request.inProgressAt ? new Date(r.request.inProgressAt) : null;
            const end = r.request.completedAt ? new Date(r.request.completedAt) : null;


            let workingTime = null;
            if (start && end) {
                const diffMs = end - start;
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                workingTime = hours < 24 ? `${hours}시간` : `${Math.floor(hours / 24)}일`;
            }

            const images = await reviewRepository.getImagesByTarget('review', r.id);

            return {
                id: r.id,
                rate: r.rate,
                content: r.content,
                createdAt: r.createdAt,
                commissionTitle: r.request.commission.title,
                workingTime: workingTime,
                review_thumbnail: images.length > 0 ? images[0] : null,
                writer: {
                    nickname: r.user.nickname
                }, 
            };
          })
        );

        // 작가가 등록한 커미션 목록
        const commissions = await UserRepository.FetchArtistCommissions(artistId, userId);
        const commissionList = await Promise.all(
        commissions.map(async (c) => {
            const images = await CommissionRepository.findThumbnailImageByCommissionId(c.id); // c.id == targetId

            return {
            id: c.id,
            title: c.title,
            summary: c.summary,
            minPrice: c.minPrice,
            category: c.category.name,
            tags: c.commissionTags.map(t => t.tag.name),
            thumbnail: c.thumbnailImage,
            bookmark: c.bookmarks.length > 0,
            commission_img: images?.imageUrl ?? null
            };
        })
);



        const result = await UserRepository.getMyProfile(accountId);

        const badges = result.userBadges.map((userBadge) => ({
            id: userBadge.id,
            earnedAt: userBadge.earnedAt,
            badge: userBadge.badge? [userBadge.badge] : []
        }));


        return {
            ...profile,
            reviews,
            commissions:commissionList,
            badges
        }

    }
    
}