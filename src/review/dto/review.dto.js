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
        // UTC 시간 (타임존 이슈 생길 경우 현지 시간으로 변환 필요)
        this.created_at = reviewData.createdAt?.toISOString();
        this.updated_at = reviewData.updatedAt?.toISOString();
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