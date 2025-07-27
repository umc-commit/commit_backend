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

  /**
   * 커미션 신청 생성
   */
  async createRequest(requestData) {
    return await prisma.request.create({
      data: {
        userId: requestData.userId,
        commissionId: requestData.commissionId,
        formAnswer: requestData.formAnswer,
        totalPrice: requestData.totalPrice,
        waitlist: requestData.waitlist,
        status: 'PENDING'
      }
    });
  },

  /**
   * 사용자의 중복 신청 여부 확인
   */
  async findExistingRequest(userId, commissionId) {
    return await prisma.request.findFirst({
      where: {
        userId: BigInt(userId),
        commissionId: BigInt(commissionId),
        status: {
          notIn: ['CANCELED', 'REJECTED', 'COMPLETED']  // 취소/거절/완료된 것은 제외 (재신청 가능)
        }
      }
    });
  },

  /**
   * 대기 중인 신청서 계산
   */
  async countAllRequestsByCommissionId(commissionId) {
    return await prisma.request.count({
      where: {
        commissionId: BigInt(commissionId)
      }
    });
  }
}