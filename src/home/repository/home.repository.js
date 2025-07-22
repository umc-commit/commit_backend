import { prisma } from "../../db.config.js"

export const HomeRepository = {

  /**
   * 사용자 선호 카테고리 조회
   */
  async findUserCategories(userId) {
    const result = await prisma.userCategory.findMany({
      where: { userId: BigInt(userId) },
      select: { categoryId: true }
  });
    return result.map(item => item.categoryId);
  },

  /**
   * 섹션1: 추천 커미션
   */
  async findRecommendedCommissions(userId, categoryIds, limit) {

    const commissions = await prisma.commission.findMany({
      where: {
        id: {
          gte: BigInt(1),
          lte: BigInt(15)
        },
        categoryId: { in: categoryIds.map(id => BigInt(id)) }
      },
      include: {
        category: {
          select: { name: true }
        },
        commissionTags: {
          include: {
            tag: {
              select: { name: true }
            }
          }
        },
        artist: {
          select: {
            id: true,
            nickname: true,
            profileImage: true
          }
        },
        bookmarks: {
          where: { userId: BigInt(userId) }
        }
      }
    });
    
    const shuffled = commissions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  },

  /**
   * 섹션2: 신규등록
   */
  async findNewCommissions(userId, categoryIds, limit) {
    const commissions = await prisma.commission.findMany({
      where: {
        id: {
          gte: BigInt(1),
          lte: BigInt(15)
        },
        categoryId: { in: categoryIds.map(id => BigInt(id)) }
      },
      include: {
        category: {
          select: { name: true }
        },
        commissionTags: {
          include: {
            tag: {
              select: { name: true }
            }
          }
        },
        artist: {
          select: {
            id: true,
            nickname: true,
            profileImage: true
          }
        },
        bookmarks: {
          where: { userId: BigInt(userId) }
        }
      }
    });
    
    const shuffled = commissions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  },

  /**
   * 섹션3: 신청폭주
   */
  async findPopularCommissions(userId, categoryIds, limit) {

    const commissions = await prisma.commission.findMany({
      where: {
        id: {
          gte: BigInt(16),
          lte: BigInt(23)
        },
        categoryId: { in: categoryIds.map(id => BigInt(id)) }
      },
      include: {
        category: {
          select: { name: true }
        },
        commissionTags: {
          include: {
            tag: {
              select: { name: true }
            }
          }
        },
        artist: {
          select: {
            id: true,
            nickname: true,
            profileImage: true
          }
        },
        bookmarks: {
          where: { userId: BigInt(userId) }
        }
      }
    });
    
    const shuffled = commissions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  },

  /**
   * 섹션4: 마감임박
   */
  async findDeadlineCommissions(userId, categoryIds, limit) {

    const commissions = await prisma.commission.findMany({
      where: {
        categoryId: { in: categoryIds.map(id => BigInt(id)) }
      },
      include: {
        category: {
          select: { name: true }
        },
        commissionTags: {
          include: {
            tag: {
              select: { name: true }
            }
          }
        },
        artist: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            slot: true
          }
        },
        requests: {
          where: { 
            status: { 
              in: ['APPROVED', 'IN_PROGRESS', 'SUBMITTED'] 
            } 
          },
          select: { id: true }
        },
        bookmarks: {
          where: { userId: BigInt(userId) }
        }
      }
    });

    // 남은 슬롯이 1개인 커미션 필터링
    const deadlineCommissions = commissions.filter(commission => {
      const remainingSlots = commission.artist.slot - commission.requests.length;
      return remainingSlots === 1;
    });

    const shuffled = deadlineCommissions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  },

  /**
   * 최신 리뷰 6개 조회
   */
  async findNewReviews(limit) {
    return await prisma.review.findMany({
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            profileImage: true
          }
        },
        request: {
          select: {
            commission: {
              select: {
                id: true,
                title: true
              }
            },
            inProgressAt: true,
            completedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  },

  /**
   * 신규 작가 6개 조회
   */
  async findNewArtists(limit) {
    return await prisma.artist.findMany({
      select: {
        id: true,
        nickname: true,
        profileImage: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  },

  /**
   * 커미션 ID들로 커미션 썸네일 이미지 조회
   */
  async findThumbnailImagesByCommissionIds(commissionIds) {
    if (commissionIds.length === 0) return [];
    
    return await prisma.image.findMany({
      where: {
        target: 'commission',
        targetId: { in: commissionIds },
        orderIndex: 0
      }
    });
  },

  /**
   * 리뷰 ID들로 리뷰 썸네일 이미지 조회
   */
  async findReviewImagesByReviewIds(reviewIds) {
    if (reviewIds.length === 0) return [];
    
    return await prisma.image.findMany({
      where: {
        target: 'review',
        targetId: { in: reviewIds },
        orderIndex: 0
      }
    });
  },
};