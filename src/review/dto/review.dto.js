// 리뷰 작성 요청 DTO
export class ReviewCreateDto {
    constructor(data) {
        this.rate = data.rate;                   // 별점 (1-5)
        this.content = data.content;             // 리뷰 내용
        this.image_urls = data.image_urls || []; // 이미지 URL 배열 (없으면 빈 배열)
    }
}

// 리뷰 수정 요청 DTO
export class ReviewUpdateDto {
    constructor(data) {
        this.rate = data.rate;                   // 별점 (1-5)
        this.content = data.content;             // 리뷰 내용
        this.image_urls = data.image_urls || []; // 이미지 URL 배열 (없으면 빈 배열)
    }
}

// 리뷰 응답 DTO
export class ReviewResponseDto {
    constructor(reviewData) {
        this.id = reviewData.id;                                // BigInt 유지(bigintJson.js에서 문자열 변환)
        this.requestId = reviewData.requestId;                  // BigInt 유지
        this.user_id = reviewData.userId;                       // BigInt 유지
        this.rate = reviewData.rate;
        this.content = reviewData.content;
        this.image_urls = reviewData.image_urls || [];
        // KST 시간으로 변환하여 응답
        this.created_at = this._toKST(reviewData.createdAt);
        this.updated_at = this._toKST(reviewData.updatedAt);
    }

    // UTC를 KST로 변환하는 헬퍼 메서드
    _toKST(utcDate) {
        if (!utcDate) return null;

        const kstDate = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000)); // UTC + 9시간
        return kstDate.toISOString().replace('Z', '+09:00'); // Z(UTC) -> +09:00(KST)
    }
}

// 이미지 업로드 응답 DTO
export class ImageUploadResponseDto {
    constructor(data) {
        this.image_url = data.image_url;  // 업로드된 이미지 URL
        this.file_size = data.file_size;  // 파일 크기
        this.file_type = data.file_type;  // 파일 타입
    }
}

// 리뷰 목록 조회용 - 커미션 정보 DTO
export class ReviewCommissionDto {
    constructor(commissionData) {
        this.id = commissionData.id;
        this.title = commissionData.title;
        this.creator = {
            id: commissionData.artist?.id,
            nickname: commissionData.artist?.nickname,
            profile_image: commissionData.artist?.profileImage
        };
    }
}

// 리뷰 목록 조회용 - 개별 리뷰 아이템 DTO
export class ReviewListItemDto {
    constructor(reviewData) {
        this.id = reviewData.id;
        this.requestId = reviewData.requestId;
        this.rate = reviewData.rate;
        this.content = reviewData.content;
        this.image_urls = reviewData.image_urls || [];
        this.created_at = this._toKST(reviewData.createdAt);

        // 커미션 정보 (어떤 작업에 대한 리뷰인지)
        this.request = {
            id: reviewData.request?.id,
            title: reviewData.request?.commission?.title,
            thumbnail: reviewData.request?.commission?.thumbnail,
            creator: {
                id: reviewData.request?.commission?.artist?.id,
                nickname: reviewData.request?.commission?.artist?.nickname
            }
        };
    }

    // UTC를 KST로 변환하는 헬퍼 메서드
    _toKST(utcDate) {
        if (!utcDate) return null;

        const kstDate = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000)); // UTC + 9시간
        return kstDate.toISOString().replace('Z', '+09:00'); // Z(UTC) -> +09:00(KST)
    }
}

// 페이지네이션 정보 DTO
export class PaginationDto {
    constructor(page, limit, total) {
        this.page = parseInt(page);
        this.limit = parseInt(limit);
        this.total = parseInt(total);
        this.totalPages = Math.ceil(total / limit);
    }
}

// 리뷰 목록 조회 응답 DTO
export class ReviewListResponseDto {
    constructor(items, pagination) {
        this.items = items.map(item => new ReviewListItemDto(item));
        this.pagination = pagination;
    }
}