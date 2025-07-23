import { prisma } from "../../db.config.js"

export const CommissionRepository = {

  /**
   * 커미션 ID가 존재하는지 조회
   */
  async findCommissionById(id) {
    return prisma.commission.findUnique({
      where: { id: BigInt(id) },
    });
  },

  /**
   * 커미션 ID로 상세 정보 조회
   */
  async findCommissionWithDetailsById(commissionId, userId) {
    return await prisma.commission.findUnique({
      where: {
        id: BigInt(commissionId)
      },
      include: {
        artist: {
          select: {
            id: true,
            slot: true,
          }
        },
        category: {
          select: {
            name: true,
          }
        },
        commissionTags: {
          include: {
            tag: {
              select: {
                name: true,
              }
            }
          }
        },
        bookmarks: userId ? {
          where: { userId: BigInt(userId) }
        } : false,
        requests: {
          where: { 
            status: { 
              in: ['APPROVED', 'IN_PROGRESS', 'SUBMITTED'] 
            } 
          },
          select: { id: true }
        }
      }
    });
  },

  /**
   * 커미션 ID로 이미지 조회 (순서대로)
   */
  async findImagesByCommissionId(commissionId) {
    return await prisma.image.findMany({
      where: {
        target: 'commission',
        targetId: BigInt(commissionId)
      },
      orderBy: { orderIndex: 'asc' }
    });
  },

  /**
   * 커미션 ID로 신청폼 조회 (작가 정보 포함)
   */
  async findCommissionFormById(commissionId) {
    return await prisma.commission.findUnique({
      where: {
        id: BigInt(commissionId)
      },
      include: {
        artist: {
          select: {
            id: true,
            nickname: true,
          }
        }
      }
    });
  },

  /**
   * 커미션 썸네일 이미지 조회
   */
  async findThumbnailImageByCommissionId(commissionId) {
    return await prisma.image.findFirst({
      where: {
        target: 'commission',
        targetId: BigInt(commissionId),
        orderIndex: 0
      },
      select: {
        imageUrl: true
      }
    });
  },
};