import { prisma } from "../../db.config.js"

export const UserRepository = {
  async findUserById(userId) {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
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
};