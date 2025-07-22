import { prisma } from "../../db.config.js"

export const RequestRepository = {
  
  /**
   * 리퀘스트 Id 조회
   */
  async findRequestById(requestId) {
    return await prisma.request.findUnique({
      where: {
        id: requestId,
      },
    });
  },

  /**
   * 사용자의 신청 목록 조회 (필터링 포함)
   */
  async findRequestsByUserId(userId, filter, offset, limit) {
    // 필터에 따른 상태 조건 설정
    let statusCondition = {};
    
    if (filter === 'ongoing') { //상태: 진행중
      statusCondition = {
        status: { 
          in: ['PENDING', 'APPROVED', 'IN_PROGRESS', 'SUBMITTED'] 
        }
      };
    } else if (filter === 'completed') { //상태: 진행완료
      statusCondition = {
        status: 'COMPLETED'
      };
    }

    return await prisma.request.findMany({
      where: {
        userId: BigInt(userId),
        ...statusCondition
      },
      include: {
        commission: {
          select: {
            id: true,
            title: true,
            minPrice: true,
            artist: {
              select: {
                id: true,
                nickname: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });
  },

  /**
   * 사용자의 신청 총 개수 조회 (필터링 포함)
   */
  async countRequestsByUserId(userId, filter) {
    let statusCondition = {};
    
    if (filter === 'ongoing') {
      statusCondition = {
        status: { 
          in: ['PENDING', 'APPROVED', 'IN_PROGRESS', 'SUBMITTED'] 
        }
      };
    } else if (filter === 'completed') {
      statusCondition = {
        status: 'COMPLETED'
      };
    }

    return await prisma.request.count({
      where: {
        userId: BigInt(userId),
        ...statusCondition
      }
    });
  },

  /**
   * 커미션 ID들로 썸네일 이미지 조회
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
   * Request ID로 상세 조회 (Commission 정보 포함)
   */
  async findRequestWithCommissionById(requestId) {
    return await prisma.request.findUnique({
      where: {
        id: BigInt(requestId)
      },
      include: {
        commission: {
          select: {
            artistId: true
          }
        }
      }
    });
  },

  /**
   * Request 상태 업데이트
   */
  async updateRequestStatus(requestId, status) {
    const updateData = {
      status: status
    };

    // 상태에 따른 타임스탬프 업데이트
    switch (status) {
      case 'APPROVED':
        updateData.approvedAt = new Date();
        break;
      case 'IN_PROGRESS':
        updateData.inProgressAt = new Date();
        break;
      case 'SUBMITTED':
        updateData.submittedAt = new Date();
        break;
      case 'COMPLETED':
        updateData.completedAt = new Date();
        break;
    }

    return await prisma.request.update({
      where: {
        id: BigInt(requestId)
      },
      data: updateData
    });
  },
};