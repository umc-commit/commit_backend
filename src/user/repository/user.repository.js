import { prisma } from "../../db.config.js"
import * as PrismaClient from "@prisma/client";

const { RequestStatus } = PrismaClient;

export const UserRepository = {
  /**
   * 사용자 ID로 사용자 조회 
   */
  async findUserById(accountId) {
    return await prisma.account.findUnique({
      where: {
        id: accountId
      },
      select:{
        users:  { select: { id: true, nickname: true, description: true, profileImage: true } }
      }
    });
  },

  /**
   * 작가 ID로 작가 조회 
   */
  async findArtistById(accountId) {
    return await prisma.account.findUnique({
      where: {
        id: accountId,
      },
      select:{
        artists:{ select: { id: true, nickname: true, description: true, profileImage: true } }
      }
    });
  },

  /**
   * oauth_id로 계정 존재 여부 확인 
   */
  async findAccountByOauthId(provider, oauth_id) {
    return await prisma.account.findUnique({
      where : {
        provider_oauthId : {
          provider, 
          oauthId:oauth_id,
        }
      },
      include : {
        users:true,
      },
    });
  },

  /**
   * 계정 생성 
   */
  async createAccount(provider, oauth_id) {
    return await prisma.account.create({
      data:{
        provider, 
        oauthId : oauth_id.toString(),
      },
    });
  },

  /**
   * 사용자 프로필 생성
   */
  async createUserProfile (accountId, nickname, description){
    return await prisma.user.create({
      data: {
        accountId,
        nickname,
        description,
      }
    })
  },
   /**
   * Artist 프로필 생성
   */
  async createArtistProfile (accountId, nickname, description){
    return await prisma.artist.create({
      data: {
        accountId,
        nickname,
        description,
      }
    })
  },

  /**
   * 사용자 카테고리 연결 생성 
   */
  async createUserCategories (accountId, categoryIds) {
    const data = categoryIds.map(categoryId => ({
      accountId, 
      categoryId,
    }));
    return await prisma.userCategory.createMany({
      data,
    })
  },
  /**
   * 사용자 약관 동의 생성 
   */
  async createUserAgreements (accountId, agreementIds) {
    const data = agreementIds.map(agreementId => ({
      accountId,
      agreementId,
    }));
    return await prisma.userAgreement.createMany({
      data,
    })
  },
  /**
   * 나의 프로필 조회 
   */
  async getMyProfile(accountId) {
    return await prisma.account.findUnique({
      where:{
        id:accountId
      },
      select:{
        users:  { select: { id: true, nickname: true, description: true, profileImage: true } },
        artists:{ select: { id: true, nickname: true, description: true, profileImage: true } },
        userBadges:{
          select: {
            id:true, earnedAt:true, 
            badge:{
              select:{
                id:true, type:true, threshold:true, name:true, badgeImage:true
              }
            }
          }
        }
      }
    });
  },

  /**
   * 나의 프로필 수정
   */
  async updateMyprofile(accountId, updates) {
    return await prisma.user.update({
      where:{accountId},
      data:updates,
    })
  },
  /**
   * 작가 프로필 수정
   */
  async updateArtistProfile(accountId, updates) {
    return await prisma.artist.update({
      where:{accountId},
      data:updates,
    })
  },
  // 사용자가 선택한 카테고리 조회 
  async AccessUserCategories(accountId){
    return await prisma.userCategory.findMany({
      where :{
        accountId
      },
      select:{
        category:{
          select:{
            name:true
          }
        }
      }
    })
  },
  // 닉네임 중복 확인 
  async checkNicknameDuplicate(nickname) {
    return await prisma.user.findFirst({
      where :{nickname}
    });
  },

  // 작가 팔로우하기 
  async FollowArtist(accountId, artistId) {
    return await prisma.follow.create({
      data:{
        accountId,
        artistId
      }
    })
  },

  // 사용자가 팔로우중인지 확인
  async AlreadyFollow(accountId, artistId) {
    return await prisma.follow.findFirst({
      where:{accountId, artistId}
    })
  },

  // 작가 팔로우 취소하기 
  async CancelArtistFollow(accountId, artistId) {
    return await prisma.follow.delete({
      where:{
        accountId_artistId:{
          accountId,
          artistId
        }
      }
    });
  },

  // 사용자가 팔로우한 작가 조회하기 
  async LookUserFollow(accountId){
    return await prisma.follow.findMany({
      where:{
        accountId:accountId
      },
      select:{
        artist:{
          select:{
            id:true,
            nickname:true, 
            profileImage:true
          }
        }
      }
    })
  },

  // 사용자의 커미션 신청 횟수 조회 
  async countClientCommissionApplication(userId){
    return await prisma.request.count({
      where:{userId, status:RequestStatus.PENDING}
    })
  },

  // 사용자의 리뷰작성 횟수 조회 
  async countClientReview(userId) {
    return await prisma.review.count({
      where:{userId}
    })
  },
  // 작가 프로필 조회하기 
  async AccessArtistProfile(artistId) {
    return await prisma.artist.findUnique({
      where:{
        id: artistId
      },
      select:{
        nickname: true,
        description: true,
        profileImage: true,
        slot:true
      }
    });
  },

  // 작가에게 달린 리뷰 조회하기 
  async ArtistReviews(artistId) {
    return await prisma.review.findMany({
      where:{
        request:{
          commission:{
            artistId:artistId
          }
        }
      },
      orderBy:{createdAt:'desc'},
      take:4,
      select:{
        id:true, 
        rate:true,
        content:true,
        createdAt:true,
        user:{
          select:{
            nickname:true,
          }
        },
        request:{
          select:{
            inProgressAt:true,
            completedAt:true,
            commission:{
              select:{
                title:true
              }
            }
          }
        }
      }
    })
  },
  // 작가가 등록한 커미션 목록 불러오기
  async FetchArtistCommissions(artistId, userId) {
      return await prisma.commission.findMany({
          where: { artistId: artistId },
          select: {
              id: true,
              title: true,
              summary: true,
              minPrice: true,
              category: {
                  select: { name: true }
              },
              commissionTags: {
                  select: {
                      tag: { select: { name: true } }
                  }
              },
              bookmarks:{
                where:{userId}, 
                select:{id:true}
              }
          }
      });
  },

};

