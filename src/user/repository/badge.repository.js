import { prisma } from "../../db.config.js"

export const BadgeRepository = {
  // type과 progress를 기준으로 발급 가능한 뱃지를 조회하기
  async findEligibleBadgesByProgress(type, progress) {
    return await prisma.badge.findMany({
      where: {
        type,
        threshold:{
            lte:progress,
        },
      },
      orderBy:{
        threshold:"asc"
      }
    });
  },
  // 여러개의 뱃지를 사용자에게 한 번에 발급하기 
  async createManyUserBadges(accountId, badgeIds){
    if(!badgeIds.length) return;

    const data=badgeIds.map((badgeId)=> ({
        accountId, 
        badgeId, 
        earnedAt: new Date(),
    }));

    return await prisma.userBadge.createMany({
        data, 
        skipDuplicates:true, // 같은 뱃지 중복 발급 방지
    })
  }

};

