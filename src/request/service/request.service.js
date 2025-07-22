import { InvalidRequestFilterError } from "../../common/errors/request.errors.js";
import { RequestRepository } from "../repository/request.repository.js";

export const RequestService = {

  /**
   * 신청 목록 조회
   */
  async getRequestList(userId, dto) {
    const { filter, offset, limit, page } = dto;

    // 필터 유효성 검증
    if (!['all', 'ongoing', 'completed'].includes(filter)) {
      throw new InvalidRequestFilterError({ filter });
    }

    // 신청 목록 조회
    const requests = await RequestRepository.findRequestsByUserId(userId, filter, offset, limit);
    
    // 총 개수 조회
    const totalCount = await RequestRepository.countRequestsByUserId(userId, filter);
    const totalPages = Math.ceil(totalCount / limit);

    // 커미션 ID로 썸네일 이미지 조회
    const commissionIds = requests.map(request => request.commission.id);
    const thumbnailImages = await RequestRepository.findThumbnailImagesByCommissionIds(commissionIds);
    
    // 썸네일 이미지 매핑
    const thumbnailMap = {};
    thumbnailImages.forEach(image => {
      thumbnailMap[image.targetId.toString()] = image.imageUrl;
    });

    // 진행률 계산 함수
    const getProgressPercent = (status) => {
      switch (status) {
        case 'PENDING': return 0;
        case 'APPROVED':
        case 'IN_PROGRESS':
        case 'SUBMITTED': return 50;
        case 'COMPLETED': return 100;
        case 'CANCELED':
        case 'REJECTED': return null;
        default: return null;
      }
    };

    // 응답 데이터
    const responseRequests = requests.map(request => ({
      requestId: request.id,
      status: request.status,
      title: request.commission.title,
      price: request.commission.minPrice,
      thumbnailImageUrl: thumbnailMap[request.commission.id.toString()] || null,
      progressPercent: getProgressPercent(request.status),
      createdAt: request.createdAt.toISOString(),
      artist: {
        id: request.commission.artist.id,
        nickname: request.commission.artist.nickname
      },
      commission: {
        id: request.commission.id
      }
    }));

    return {
      requests: responseRequests,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    };
  },
};
