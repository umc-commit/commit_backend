import { RequestRepository } from "../repository/request.repository.js";
import {
  InvalidRequestFilterError,
  RequestNotFoundError,
  UnauthorizedRequestStatusChangeError,
  InvalidStatusTransitionError,
  StatusAlreadyChangedError
} from "../../common/errors/request.errors.js";

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

  /**
   * Request 상태 변경
   */
  async updateRequestStatus(userId, dto) {
    const { requestId, status } = dto;

    // Request 존재 여부 확인 및 조회
    const request = await RequestRepository.findRequestWithCommissionById(requestId);
    if (!request) {
      throw new RequestNotFoundError({ requestId });
    }

    // 이미 동일한 상태인지 확인
    if (request.status === status) {
      throw new StatusAlreadyChangedError({ currentStatus: request.status, requestedStatus: status });
    }

    // 권한 확인 (USER만)
    const isRequestOwner = request.userId === BigInt(userId);
    const isArtist = false; // 임시로 false 처리

    if (!isRequestOwner) {
      throw new UnauthorizedRequestStatusChangeError({ userId, requestId });
    }

    // 상태 전환 유효성 검증
    const validationResult = this.validateStatusTransition(request.status, status, isRequestOwner, isArtist);
    
    if (!validationResult.isValid) {
      if (validationResult.errorType === 'UNAUTHORIZED') {
        throw new UnauthorizedRequestStatusChangeError({ 
          userId, 
          requestId,
          currentStatus: request.status, 
          requestedStatus: status
        });
      } else {
        throw new InvalidStatusTransitionError({ 
          currentStatus: request.status, 
          requestedStatus: status,
          userType: isRequestOwner ? 'requestOwner' : 'artist'
        });
      }
    }

    // 상태 업데이트
    const updatedRequest = await RequestRepository.updateRequestStatus(requestId, status);

    return {
      requestId: updatedRequest.id,
      newStatus: updatedRequest.status,
      message: "상태가 성공적으로 변경되었습니다."
    };
  },

  /**
   * 상태 전환 유효성 검증
   */
  validateStatusTransition(currentStatus, newStatus, isRequestOwner, isArtist) {
    // 상태 전환 규칙 매핑
    const allowedTransitions = {
      'PENDING': ['CANCELED', 'APPROVED', 'REJECTED'],
      'APPROVED': ['IN_PROGRESS'],
      'IN_PROGRESS': ['SUBMITTED'],
      'SUBMITTED': ['COMPLETED']
    };

    // 권한별 허용되는 상태 전환
    const userAllowedTransitions = {
      'PENDING': ['CANCELED'],
      'SUBMITTED': ['COMPLETED'], 
      'APPROVED': ['IN_PROGRESS'] 
    };

    const artistAllowedTransitions = {
      'PENDING': ['APPROVED', 'REJECTED'],
      'IN_PROGRESS': ['SUBMITTED']
    };

    // 기본 전환 규칙 확인
    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      return { isValid: false, errorType: 'INVALID_TRANSITION' };
    }

    // 권한별 전환 규칙 확인
    if (isRequestOwner) {
      const isAllowed = userAllowedTransitions[currentStatus]?.includes(newStatus) || false;
      if (!isAllowed) {
        // 작가만 할 수 없는 변경 => 권한 없음
        return { isValid: false, errorType: 'UNAUTHORIZED' };
      }
      return { isValid: true };
    }
    
    if (isArtist) {
      const isAllowed = artistAllowedTransitions[currentStatus]?.includes(newStatus) || false;
      if (!isAllowed) {
        return { isValid: false, errorType: 'UNAUTHORIZED' };
      }
      return { isValid: true };
    }

    // 권한이 아예 없는 경우
    return { isValid: false, errorType: 'UNAUTHORIZED' };
  },

  /**
  * 신청함 상세 조회
  */
  async getRequestDetail(userId, requestId) {
    // Request 존재 여부 및 권한 확인
    const request = await RequestRepository.findRequestDetailById(requestId);
    if (!request || request.userId !== BigInt(userId)) {
     throw new RequestNotFoundError({ requestId });
   }

    // 썸네일 이미지 조회
    const thumbnailImages = await RequestRepository.findThumbnailImagesByCommissionIds([request.commission.id]);
    const thumbnailImageUrl = thumbnailImages.length > 0 ? thumbnailImages[0].imageUrl : null;

    // PointTransaction 조회 (결제 정보)
    let payment = null;
    let paidAt = null;
  
    if (['APPROVED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED'].includes(request.status)) {
      const pointTransaction = await RequestRepository.findLatestPointTransactionByRequestId(requestId);
      if (pointTransaction) {
        paidAt = pointTransaction.createdAt.toISOString();
      }
    
      const additionalPrice = request.totalPrice - request.commission.minPrice;
      payment = {
        minPrice: request.commission.minPrice,
        additionalPrice: additionalPrice,
        totalPrice: request.totalPrice,
        paidAt: paidAt
      };
    }

    // 타임라인 구성
    const timeline = [];
    if (request.approvedAt) {
      timeline.push({
        status: 'APPROVED',
        timestamp: request.approvedAt.toISOString()
     });
    }
    if (paidAt) {
      timeline.push({
       status: 'PAID', 
       timestamp: paidAt
     });
    }
    if (request.inProgressAt) {
     timeline.push({
       status: 'IN_PROGRESS',
       timestamp: request.inProgressAt.toISOString()
     });
    }
    if (request.submittedAt) {
     timeline.push({
       status: 'SUBMITTED',
       timestamp: request.submittedAt.toISOString()
     });
    }
    if (request.completedAt) {
      timeline.push({
       status: 'COMPLETED',
       timestamp: request.completedAt.toISOString()
      });
    }

    // 폼데이터 구성
  	const formData = [];
  	if (['APPROVED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED'].includes(request.status)) {
	  	// 커스텀 필드와 기본 필드 합성
	  	const customFields = request.commission.formSchema?.fields || [];
		  const defaultFields = [
		  	{
			  	id: (customFields.length + 1).toString(),
			  	type: "textarea",
			  	label: "신청 내용"
		  	},
		  	{
		  		id: (customFields.length + 2).toString(),
		  		type: "file",
		  		label: "참고 이미지"
		  	}
		  ];
		  const allFields = [...customFields, ...defaultFields];
		
  		for (const field of allFields) {
	  		const fieldId = field.id;
		  	const answer = request.formAnswer[fieldId];
		
		  	let value = null;
			  if (field.type === 'radio' && field.options) {
			  	// 선택된 옵션의 label 찾기
			  	const selectedOption = field.options.find(option => option.value === answer);
				  value = selectedOption ? selectedOption.label : null;
	  		} else if (field.type === 'textarea' || field.type === 'file') {
		  		// textarea나 file은 그대로 사용
			  	value = answer || null;
		  	}
		
		  	formData.push({
			  	id: fieldId,
  				label: field.label,
	  			value: value,
		  		type: field.type
		  	});
		  }
	  }

    return {
      request: {
        id: request.id,
        status: request.status,
        totalPrice: request.totalPrice,
        createdAt: request.createdAt.toISOString()
      },
      commission: {
        id: request.commission.id,
        title: request.commission.title,
        thumbnailImageUrl: thumbnailImageUrl,
        artist: {
          id: request.commission.artist.id,
          nickname: request.commission.artist.nickname
        }
      },
      payment: payment,
      timeline: timeline,
      formData: formData
    };
  }
};