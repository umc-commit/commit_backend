import multer from 'multer';
import path from 'path';
import { uploadToS3, deleteFromS3 } from '../../s3.upload.js';
import { CommissionRepository } from "../repository/commission.repository.js";
import { RequestRepository } from "../../request/repository/request.repository.js";
import {
 CommissionNotFoundError,
  FileSizeExceededError,
  UnsupportedImageFormatError,
  ImageUploadFailedError,
  RequiredFieldMissingError,
  InvalidOptionValueError,
  FileCountExceededError,
  TextLengthExceededError,
  InvalidFormSchemaError,
  DuplicateRequestError
} from "../../common/errors/commission.errors.js";

export const CommissionService = {

  /**
   * S3 업로드를 위한 multer 설정
   */
  storage: multer.memoryStorage(),

  /**
   * 파일 필터
   */
  fileFilter(req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new UnsupportedImageFormatError({ 
        fileType: file.mimetype,
        allowedTypes 
      }), false);
    }
  },

  /**
   * multer 인스턴스 생성
   */
  getUploadMiddleware() {
    return multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024
      }
    }).single('image');
  },

  /**
   * S3 이미지 업로드 처리
   */
  async uploadRequestImage(file) {
    try {
      // 1. 파일 존재 여부 확인
      if (!file) {
        throw new ImageUploadFailedError({ reason: '파일이 업로드되지 않았습니다' });
      }

      // 2. 파일 크기 검증
      if (file.size > 10 * 1024 * 1024) {
        throw new FileSizeExceededError({ fileSize: file.size });
      }

      // 3. 파일 확장자 검증
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      if (!['jpeg', 'jpg', 'png'].includes(ext)) {
        throw new UnsupportedImageFormatError({ fileType: file.mimetype });
      }

      // 4. S3 업로드 (requests 폴더에 저장)
      const imageUrl = await uploadToS3(file.buffer, 'requests', ext);

      return {
        image_url: imageUrl,
        file_size: file.size,
        file_type: file.mimetype
      };

    } catch (error) {
      throw error;
    }
  },

  /**
   * S3 이미지 삭제
   */
  async deleteS3Image(imageUrl) {
    try {
      if (imageUrl && imageUrl.includes('amazonaws.com')) {
        await deleteFromS3(imageUrl);
        console.log(`S3 이미지 삭제 완료: ${imageUrl}`);
      }
    } catch (error) {
      console.error('S3 이미지 삭제 실패:', error);
    }
  },

 /**
  * 커미션 게시글 상세글 조회
  */
 async getCommissionDetail(userId, dto) {
   const { commissionId } = dto;

   // 1. 커미션 존재 여부 확인 및 상세 조회
   const commission = await CommissionRepository.findCommissionWithDetailsById(commissionId, userId);
   if (!commission) {
     throw new CommissionNotFoundError({ commissionId });
   }

   // 2. 이미지 조회
   const images = await CommissionRepository.findImagesByCommissionId(commissionId);

   // 3. 비즈니스 로직 처리
   const thumbnailImageUrl = images.find(img => img.orderIndex === 0)?.imageUrl || null;
   const remainingSlots = commission.artist.slot - commission.requests.length;
   const tags = commission.commissionTags.map(ct => ct.tag.name);

   return {
     id: commission.id,
     title: commission.title,
     summary: commission.summary,
     content: commission.content,
     minPrice: commission.minPrice,
     category: commission.category.name,
     tags,
     images: images.map(img => ({
       id: img.id,
       imageUrl: img.imageUrl,
       orderIndex: img.orderIndex
     })),
     thumbnailImageUrl,
     remainingSlots,
     isBookmarked: commission.bookmarks?.length > 0 || false,
     artistId: commission.artist.id,
     createdAt: commission.createdAt.toISOString()
   };
 },

   /**
   * 커미션 신청폼 조회
   */
  async getCommissionForm(userId, dto) {
    const { commissionId } = dto;

    // 커미션 존재 여부 확인 및 조회
    const commission = await CommissionRepository.findCommissionFormById(commissionId);
    if (!commission) {
      throw new CommissionNotFoundError({ commissionId });
    }

    // 썸네일 이미지 조회
    const thumbnailImage = await CommissionRepository.findThumbnailImageByCommissionId(commissionId);

    // formSchema 처리
    const customFields = commission.formSchema?.fields || [];
    
    // 기본 필드들 (항상 마지막에 추가)
    const defaultFields = [
      {
        id: (customFields.length + 1).toString(),
        type: "textarea",
        label: "신청 내용",
        required: false,
        maxLength: 5000
      },
      {
        id: (customFields.length + 2).toString(),
        type: "file",
        label: "참고 이미지",
        required: false,
        maxFiles: 10,
        acceptedTypes: ["image/jpeg", "image/png"]
      }
    ];

    // 4. 응답 데이터 구성
    return {
      commission: {
        id: commission.id,
        title: commission.title,
        thumbnailImageUrl: thumbnailImage?.imageUrl || null,
        artist: {
          id: commission.artist.id,
          nickname: commission.artist.nickname
        }
      },
      formSchema: {
        fields: [...customFields, ...defaultFields]
      }
    };
  },

  /**
   * 커미션 신청 제출
   */
  async submitCommissionRequest(userId, dto) {
    const { commissionId, formAnswer } = dto;

    // 커미션 존재 여부 확인
    const commission = await CommissionRepository.findCommissionFormById(commissionId);
    if (!commission) {
      throw new CommissionNotFoundError({ commissionId });
    }

    // 중복 신청 확인
    const existingRequest = await CommissionRepository.findExistingRequest(userId, commissionId);
    if (existingRequest) {
      throw new DuplicateRequestError({ 
        userId, 
        commissionId,
        existingRequestId: existingRequest.id
      });
    }

    // formSchema 가져오기
    const customFields = commission.formSchema?.fields || [];
    const defaultFields = [
      {
        id: (customFields.length + 1).toString(),
        type: "textarea",
        label: "신청 내용",
        required: false,
        maxLength: 5000
      },
      {
        id: (customFields.length + 2).toString(),
        type: "file",
        label: "참고 이미지",
        required: false,
        maxFiles: 10,
        acceptedTypes: ["image/jpeg", "image/png"]
      }
    ];
    const allFields = [...customFields, ...defaultFields];

    // formAnswer 검증
    const { additionalPrice, processedFormData } = this.validateFormAnswer(formAnswer, allFields);
    const totalPrice = commission.minPrice + additionalPrice;

    // waitlist 계산
    const totalRequestCount = await CommissionRepository.countAllRequestsByCommissionId(commissionId);
    const waitlist = totalRequestCount + 1;

    // Request 생성
    const newRequest = await CommissionRepository.createRequest({
      userId: BigInt(userId),
      commissionId: BigInt(commissionId),
      formAnswer: formAnswer,
      totalPrice: totalPrice,
      waitlist: waitlist
    });

    // 참고 이미지들을 Image 테이블에 저장
    const fileFieldId = (customFields.length + 2).toString();
    const imageUrls = formAnswer[fileFieldId] || [];

    if (imageUrls.length > 0) {
      for (let i = 0; i < imageUrls.length; i++) {
        await RequestRepository.createRequestImage({
          target: 'request',
          targetId: newRequest.id,
          imageUrl: imageUrls[i],
          orderIndex: i
        });
      }
    }

    // 응답 데이터 구성
    return {
      requestId: newRequest.id,
      userId: userId,
      message: "커미션 신청이 완료되었습니다.",
      submitted: {
        totalPrice: totalPrice,
        formData: processedFormData,
        waitlist: waitlist
      }
    };
  },

  /**
   * formAnswer 검증 및 가격 계산
   */
  validateFormAnswer(formAnswer, fields) {
    let additionalPrice = 0;
    const processedFormData = {};

    // 필수 필드 검증
    const requiredFields = fields.filter(f => f.required);
    const missingFields = [];

    for (const field of requiredFields) {
      if (!formAnswer[field.id] || formAnswer[field.id] === '') {
        missingFields.push(field.id);
      }
    }

    if (missingFields.length > 0) {
      throw new RequiredFieldMissingError({
        missingFields,
        requiredFields: requiredFields.map(f => f.id)
      });
    }

    // 각 필드별 검증
    for (const [fieldId, value] of Object.entries(formAnswer)) {
      const field = fields.find(f => f.id === fieldId);
      
      if (!field) {
        throw new InvalidFormSchemaError({
          invalidField: fieldId,
          reason: "존재하지 않는 필드입니다"
        });
      }

      // 필드 타입별 검증
      switch (field.type) {
        case 'radio': {
          this.validateRadioField(field, value, fieldId);
          // 가격 계산
          const selectedOption = field.options.find(opt => opt.value === value);
          additionalPrice += selectedOption.additionalPrice;
          // 형태 변환
          processedFormData[field.label] = selectedOption.label;
          break;
        }
        case 'textarea':
          this.validateTextareaField(field, value, fieldId);
          processedFormData[field.label] = value;
          break;

        case 'file':
          this.validateFileField(field, value, fieldId);
          processedFormData[field.label] = value;
          break;

        default:
          throw new InvalidFormSchemaError({
            fieldId,
            reason: `지원하지 않는 필드 타입: ${field.type}`
          });
      }
    }

    return { additionalPrice, processedFormData };
  },

  /**
   * Radio 필드 검증
   */
  validateRadioField(field, value, fieldId) {
    if (typeof value !== 'string') {
      throw new InvalidFormSchemaError({
        fieldId,
        expectedType: 'string',
        receivedType: typeof value
      });
    }

    const validOptions = field.options.map(opt => opt.value);
    if (!validOptions.includes(value)) {
      throw new InvalidOptionValueError({
        fieldId,
        invalidValue: value,
        validOptions
      });
    }
  },

  /**
   * Textarea 필드 검증
   */
  validateTextareaField(field, value, fieldId) {
    if (typeof value !== 'string') {
      throw new InvalidFormSchemaError({
        fieldId,
        expectedType: 'string',
        receivedType: typeof value
      });
    }

    if (field.maxLength && value.length > field.maxLength) {
      throw new TextLengthExceededError({
        fieldId,
        maxLength: field.maxLength,
        actualLength: value.length
      });
    }
  },

  /**
   * File 필드 검증
   */
  validateFileField(field, value, fieldId) {
    if (!Array.isArray(value)) {
      throw new InvalidFormSchemaError({
        fieldId,
        expectedType: 'array',
        receivedType: typeof value
      });
    }

    if (field.maxFiles && value.length > field.maxFiles) {
      throw new FileCountExceededError({
        fieldId,
        maxFiles: field.maxFiles,
        actualCount: value.length
      });
    }

    // URL 형식 간단 검증
    for (const url of value) {
      if (typeof url !== 'string' || !url.startsWith('http')) {
        throw new InvalidFormSchemaError({
          fieldId,
          reason: "잘못된 이미지 URL 형식",
          invalidUrl: url
        });
      }
    }
  },

  /**
   * 커미션 게시글 작가 정보 조회
   */
  async getCommissionArtistInfo(userId, dto) {
    const { commissionId, page, limit } = dto;

    // 1. 커미션 존재 여부 확인 및 작가 정보 조회
    const commission = await CommissionRepository.findArtistInfoByCommissionId(commissionId, userId);
    if (!commission) {
      throw new CommissionNotFoundError({ commissionId });
    }

    const artistId = commission.artist.id;

    // 2. 작가 통계 정보 조회 (병렬 처리)
    const [followerCount, completedWorksCount, reviewStats, reviews, totalReviews] = await Promise.all([
      CommissionRepository.countFollowersByArtistId(artistId),
      CommissionRepository.countCompletedWorksByArtistId(artistId), 
      CommissionRepository.getReviewStatsByArtistId(artistId),
      CommissionRepository.findReviewsByArtistId(artistId, page, limit),
      CommissionRepository.countReviewsByArtistId(artistId)
    ]);

    // 3. 리뷰 통계 계산
    const { averageRate, recommendationRate } = this.calculateReviewStatistics(reviewStats);

    // 4. 리뷰 데이터 처리 (이미지 포함)
    const processedReviews = await this.processReviews(reviews);

    // 5. 페이지네이션 정보 계산
    const totalPages = Math.ceil(totalReviews / limit);

    return {
      artist: {
        artistId: commission.artist.id,
        nickname: commission.artist.nickname,
        profileImageUrl: commission.artist.profileImage,
        follower: followerCount,
        completedworks: completedWorksCount
      },
      isFollowing: commission.artist.follows?.length > 0 || false,
      reviewStatistics: {
        averageRate: averageRate,
        totalReviews: totalReviews,
        recommendationRate: recommendationRate
      },
      recentReviews: processedReviews,
      pagination: {
        page: page,
        limit: limit,
        total: totalReviews,
        totalPages: totalPages
      }
    };
  },

  /**
   * 리뷰 통계 계산
   */
  calculateReviewStatistics(reviewStats) {
    if (reviewStats.length === 0) {
      return {
        averageRate: 0.0,
        recommendationRate: 0
      };
    }

    // 평균 별점 계산 (소수점 1자리)
    const totalRate = reviewStats.reduce((sum, review) => sum + review.rate, 0);
    const averageRate = Math.round((totalRate / reviewStats.length) * 10) / 10;

    // 추천율 계산 (평균별점 * 20)
    const recommendationRate = Math.round(averageRate * 20);

    return {
      averageRate,
      recommendationRate
    };
  },

  /**
   * 리뷰 데이터 처리 (이미지, 작업기간, 상대시간 포함)
   */
  async processReviews(reviews) {
    const processedReviews = [];

    for (const review of reviews) {
      // 리뷰 이미지 조회
      const images = await CommissionRepository.findImagesByReviewId(review.id);

      // 작업 기간 계산
      const workperiod = this.calculateWorkPeriod(
        review.request.inProgressAt,
        review.request.completedAt
      );

      // 상대 시간 계산
      const timeAgo = this.calculateTimeAgo(review.createdAt);

      processedReviews.push({
        id: review.id,
        rate: review.rate,
        content: review.content,
        userNickname: review.user.nickname,
        commissionTitle: review.request.commission.title,
        workperiod: workperiod,
        createdAt: review.createdAt.toISOString(),
        timeAgo: timeAgo,
        images: images.map(img => ({
          id: img.id,
          imageUrl: img.imageUrl,
          orderIndex: img.orderIndex
        }))
      });
    }

    return processedReviews;
  },

  /**
   * 작업 기간 계산
   */
  calculateWorkPeriod(inProgressAt, completedAt) {
    if (!inProgressAt || !completedAt) {
      return null;
    }

    const diffMs = new Date(completedAt) - new Date(inProgressAt);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays >= 30) {
      const months = Math.floor(diffDays / 30);
      return `${months}달`;
    } else if (diffDays >= 1) {
      return `${diffDays}일`;
    } else if (diffHours >= 1) {
      return `${diffHours}시간`;
    } else {
      return `${diffMinutes}분`;
    }
  },

  /**
   * 상대 시간 계산 (n일 전, n달 전)
   */
  calculateTimeAgo(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays >= 30) {
      const months = Math.floor(diffDays / 30);
      return `${months}달 전`;
    } else if (diffDays >= 1) {
      return `${diffDays}일 전`;
    } else if (diffHours >= 1) {
      return `${diffHours}시간 전`;
    } else {
      return `${diffMinutes}분 전`;
    }
  },

  // 캐릭터 데이터
	CHARACTER_DATA: [
		{
			image: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.dualstack.${process.env.AWS_REGION}.amazonaws.com/reports/reportType1.png`,
			quote: {
				title: "커미션계의 VIP",
				description: "\"커미션계의 큰 손 등장!\" 덕분에 작가님들의 창작 활동이 풍요로워졌어요."
			},
			condition: "월 사용 포인트 15만포인트 이상"
		},
		{
			image: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.dualstack.${process.env.AWS_REGION}.amazonaws.com/reports/reportType2.png`,
			quote: {
				title: "작가 덕후 신청자",
				description: "\"이 작가님만큼은 믿고 맡긴다!\" 단골의 미덕을 지닌 당신, 작가님도 감동했을 거예요."
			},
			condition: "같은 작가에게 3회 이상 신청"
		},
		{
			image: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.dualstack.${process.env.AWS_REGION}.amazonaws.com/reports/reportType3.png`,
			quote: {
				title: "호기심 대장 신청자",
				description: "호기심이 가득해서, 언제나 새로운 작가를 탐색해요."
			},
			condition: "서로 다른 작가 5명 이상에게 커미션을 신청"
		},
		{
			image: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.dualstack.${process.env.AWS_REGION}.amazonaws.com/reports/reportType4.png`,
			quote: {
				title: "숨겨진 보석 발굴가",
				description: "\"빛나는 원석을 내가 발견했다!\" 성장하는 작가님들의 첫걸음을 함께한 당신, 멋져요."
			},
			condition: "팔로워 수가 0명인 작가에게 신청 2회 이상"
		},
		{
			image: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.dualstack.${process.env.AWS_REGION}.amazonaws.com/reports/reportType5.png`,
			quote: {
				title: "빠른 피드백러",
				description: "\"작가님, 이번 커미션 최고였어요!\" 정성 가득한 피드백으로 건강한 커미션 문화를 만들어가요."
			},
			condition: "커미션 완료 후 후기 작성률 100% 달성"
		}
	],

	/**
	 * 커미션 리포트 조회
	 */
	async getReport(userId) {
		// 현재 날짜 기준으로 이전 달 계산
		const now = new Date();
		const currentMonth = now.getMonth() + 1; // getMonth()는 0부터 시작
		const currentYear = now.getFullYear();
		
		// 이전 달 계산 (1월이면 작년 12월)
		const reportYear = currentMonth === 1 ? currentYear - 1 : currentYear;
		const reportMonth = currentMonth === 1 ? 12 : currentMonth - 1;

		// 사용자 닉네임 조회
		const userNickname = await CommissionRepository.findUserNicknameById(userId);

		// 해당 월 승인받은 리퀘스트들 조회
		const requests = await CommissionRepository.findApprovedRequestsByUserAndMonth(
			userId, 
			reportYear, 
			reportMonth
		);

		// 통계 계산
		const statistics = this.calculateReportStatistics(requests);

		// 랜덤 캐릭터 선택
    const randomCharacter = this.CHARACTER_DATA[Math.floor(Math.random() * this.CHARACTER_DATA.length)];

		return {
			reportInfo: {
				userNickname: userNickname,
				month: reportMonth
			},
			characterImage: randomCharacter.image,
			quote: randomCharacter.quote,
			condition: randomCharacter.condition,
			statistics: statistics
		};
	},

	/**
	 * 리포트 통계 계산
	 */
	calculateReportStatistics(requests) {
		if (requests.length === 0) {
			// 데이터가 없어도 랜덤 캐릭터는 나오게
			return {
				mainCategory: { name: "없음", count: 0 },
				favoriteArtist: { id: null, nickname: "없음", profileImage: null },
				pointsUsed: 0,
				reviewRate: 0.0
			};
		}

		// 카테고리별 집계 (횟수 → 포인트 순)
		const categoryStats = this.aggregateByCategory(requests);
		const mainCategory = categoryStats[0] ? { 
			name: categoryStats[0].name, 
			count: categoryStats[0].count 
		} : { name: "없음", count: 0 };

		// 작가별 집계 (횟수 → 포인트 순) 
		const artistStats = this.aggregateByArtist(requests);
		const favoriteArtist = artistStats[0] ? {
			id: artistStats[0].id,
			nickname: artistStats[0].nickname,
			profileImage: artistStats[0].profileImage
		} : { 
			id: null, 
			nickname: "없음", 
			profileImage: null 
		};

		// 총 사용 포인트
		const pointsUsed = requests.reduce((sum, req) => sum + req.totalPrice, 0);

		// 리뷰 작성률 (COMPLETED 중에서)
		const completedRequests = requests.filter(req => req.status === 'COMPLETED');
		const reviewedRequests = completedRequests.filter(req => req.reviews.length > 0);
		const reviewRate = completedRequests.length > 0 
			? Math.round((reviewedRequests.length / completedRequests.length) * 1000) / 10  // 소수점 1자리
			: 0.0;

		return {
			mainCategory,
			favoriteArtist,
			pointsUsed,
			reviewRate
		};
	},

	/**
	 * 카테고리별 집계
	 */
	aggregateByCategory(requests) {
		const categoryMap = new Map();

		requests.forEach(req => {
			const categoryName = req.commission.category.name;
			const existing = categoryMap.get(categoryName) || { name: categoryName, count: 0, points: 0 };
			existing.count += 1;
			existing.points += req.totalPrice;
			categoryMap.set(categoryName, existing);
		});

		// 1순위: 횟수, 2순위: 포인트로 정렬
		return Array.from(categoryMap.values())
			.sort((a, b) => {
				if (a.count !== b.count) return b.count - a.count;  // 횟수 많은 순
				return b.points - a.points;  // 포인트 많은 순
			});
	},

	/**
	 * 작가별 집계
	 */
	aggregateByArtist(requests) {
		const artistMap = new Map();

		requests.forEach(req => {
			const artistId = req.commission.artist.id;
			const existing = artistMap.get(artistId) || { 
				id: artistId,
				nickname: req.commission.artist.nickname,
				profileImage: req.commission.artist.profileImage,
				count: 0, 
				points: 0 
			};
			existing.count += 1;
			existing.points += req.totalPrice;
			artistMap.set(artistId, existing);
		});

		// 1순위: 횟수, 2순위: 포인트로 정렬
		return Array.from(artistMap.values())
			.sort((a, b) => {
				if (a.count !== b.count) return b.count - a.count;  // 횟수 많은 순
				return b.points - a.points;  // 포인트 많은 순
			});
	}
};