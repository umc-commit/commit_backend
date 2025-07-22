import { prisma } from "../../db.config.js"
import { AccessUserCategories } from "../controller/user.controller.js";

/**
 * 사용자 ID로 사용자 조회 
 */ 
export const UserRepository = {
  async findUserById(userId) {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include : {
        account:true,
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
   * 사용자 카테고리 연결 생성 
   */
  async createUserCategories (userId, categoryIds) {
    const data = categoryIds.map(categoryId => ({
      userId, 
      categoryId,
    }));
    return await prisma.userCategory.createMany({
      data,
    })
  },
  /**
   * 사용자 약관 동의 생성 
   */
  async createUserAgreements (userId, agreementIds) {
    const data = agreementIds.map(agreementId => ({
      userId,
      agreementId,
    }));
    return await prisma.userAgreement.createMany({
      data,
    })
  },
  /**
   * 나의 프로필 조회 
   */
  async getMyProfile(userId) {
    return await prisma.user.findUnique({
      where:{
        id:userId
      },
      select:{
        nickname:true,
        description:true,
        profileImage: true,
      }
    })
  },

  /**
   * 나의 프로필 수정
   */
  async updateMyprofile(userId, updates) {
    return await prisma.user.update({
      where:{id: userId},
      data:updates,
    })
  },
  // 사용자가 선택한 카테고리 조회 
  async AccessUserCategories(userId){
    return await prisma.user.findUnique({
      where :{id:userId}, 
      include:{
        userCategories:{
          include:{
            category:true,
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
  }
};