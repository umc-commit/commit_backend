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
  },
  // 사용자의 뱃지 조회하기 
  async ViewUserBadges(accountId){
    return await prisma.userBadge.findMany({
        where:{
            accountId,
        },
        include:{
            badge:true,
        },
        orderBy:{
            earnedAt:'desc',
        }
    });
  },
  // 작가 뱃지 조회하기 
  async ViewArtistBadges(accountId){
    return await prisma.userBadge.findMany({
        where:{
            accountId,
        },
        include:{
            badge:true,
        },
        orderBy:{
            earnedAt:'desc',
        }
    });
  }
  , 
  // 팔로워 뱃지 부여하기 
  async GiveFollowerBadges(artistId, accountId){
    const followerCount = await prisma.follow.count({
      where:{artistId}
    })
    
    if(followerCount >= 5){
      const existingBadge = await prisma.userBadge.findFirst({
        where:{
          accountId,
          badgeId:1
        }
      });

      if(!existingBadge){
        await prisma.userBadge.create({
          data:{
            accountId, 
            badgeId:1, 
            earnedAt:new Date(),
          }
        })
      }
    }

    if(followerCount >= 10){
      const existingBadge = await prisma.userBadge.findFirst({
        where:{
          accountId,
          badgeId:2
        }
      });

      if(!existingBadge){
        await prisma.userBadge.create({
          data:{
            accountId, 
            badgeId:2, 
            earnedAt:new Date(),
          }
        })
      }
    }
    if(followerCount >= 20){
      const existingBadge = await prisma.userBadge.findFirst({
        where:{
          accountId,
          badgeId:3
        }
      });

      if(!existingBadge){
        await prisma.userBadge.create({
          data:{
            accountId, 
            badgeId:3, 
            earnedAt:new Date(),
          }
        })
      }
    }
    if(followerCount >= 100){
      const existingBadge = await prisma.userBadge.findFirst({
        where:{
          accountId,
          badgeId:4
        }
      });

      if(!existingBadge){
        await prisma.userBadge.create({
          data:{
            accountId, 
            badgeId:4, 
            earnedAt:new Date(),
          }
        })
      }
    }
  },
  // 커미션 신청 뱃지 부여 
  async GiveCommissionApplyBadges(userId, accountId){
    const ApplyCommissionCount = await prisma.request.count({
      where:{
        userId
      }
    })
    
    if(ApplyCommissionCount >= 1){
      const existingBadge = await prisma.userBadge.findFirst({
        where:{
          accountId,
          badgeId:5
        }
      });

      if(!existingBadge){
        await prisma.userBadge.create({
          data:{
            accountId, 
            badgeId:5, 
            earnedAt:new Date(),
          }
        })
      }
    }

    if(ApplyCommissionCount >= 5){
      const existingBadge = await prisma.userBadge.findFirst({
        where:{
          accountId,
          badgeId:6
        }
      });

      if(!existingBadge){
        await prisma.userBadge.create({
          data:{
            accountId, 
            badgeId:6, 
            earnedAt:new Date(),
          }
        })
      }
    }
    if(ApplyCommissionCount >= 15){
      const existingBadge = await prisma.userBadge.findFirst({
        where:{
          accountId,
          badgeId:7
        }
      });

      if(!existingBadge){
        await prisma.userBadge.create({
          data:{
            accountId, 
            badgeId:7, 
            earnedAt:new Date(),
          }
        })
      }
    }
    if(ApplyCommissionCount >= 50){
      const existingBadge = await prisma.userBadge.findFirst({
        where:{
          accountId,
          badgeId:8
        }
      });

      if(!existingBadge){
        await prisma.userBadge.create({
          data:{
            accountId, 
            badgeId:8, 
            earnedAt:new Date(),
          }
        })
      }
    }
  },
  // 후기 작성 뱃지 부여 
  async GiveReviewBadges(userId, accountId){
    const ReviewCount = await prisma.review.count({
      where:{
        userId
      }
    })
    
    if(ReviewCount >= 1){
      const existingBadge = await prisma.userBadge.findFirst({
        where:{
          accountId,
          badgeId:9
        }
      });

      if(!existingBadge){
        await prisma.userBadge.create({
          data:{
            accountId, 
            badgeId:9, 
            earnedAt:new Date(),
          }
        })
      }
    }

    if(ReviewCount >= 5){
      const existingBadge = await prisma.userBadge.findFirst({
        where:{
          accountId,
          badgeId:10
        }
      });

      if(!existingBadge){
        await prisma.userBadge.create({
          data:{
            accountId, 
            badgeId:10, 
            earnedAt:new Date(),
          }
        })
      }
    }
    if(ReviewCount >= 15){
      const existingBadge = await prisma.userBadge.findFirst({
        where:{
          accountId,
          badgeId:11
        }
      });

      if(!existingBadge){
        await prisma.userBadge.create({
          data:{
            accountId, 
            badgeId:11, 
            earnedAt:new Date(),
          }
        })
      }
    }
    if(ReviewCount >= 50){
      const existingBadge = await prisma.userBadge.findFirst({
        where:{
          accountId,
          badgeId:12
        }
      });

      if(!existingBadge){
        await prisma.userBadge.create({
          data:{
            accountId, 
            badgeId:12, 
            earnedAt:new Date(),
          }
        })
      }
    }
  }


};

