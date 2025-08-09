import path from 'path';
import multer from 'multer';
import { uploadToS3, deleteFromS3 } from '../../s3.upload.js';

// 관련 에러 클래스 import
import {
    ReviewNotFoundError,
    UnsupportedImageFormatError,
    FileSizeExceededError,
    ImageUploadFailedError,
    ReviewAlreadyExistsError,
    ReviewContentTooShortError,
    ReviewContentTooLongError,
    RequestNotFoundError,
    ReviewPermissionDeniedError,
    RequestNotCompletedError,
    ReviewRatingInvalidError
} from '../../common/errors/review.errors.js';

import { UserNotFoundError } from '../../common/errors/user.errors.js';

// Repository import
import reviewRepository from '../repository/review.repository.js';

class ReviewService {

    /**
     * 파일 업로드를 위한 multer 설정 초기화
     */
    constructor() {
        // 업로드 파일 메모리에 적재
        this.storage = multer.memoryStorage();

        // 파일 필터 (이미지만 허용)
        this.fileFilter = (req, file, cb) => {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new UnsupportedImageFormatError({ fileType: file.mimetype }), false);
            }
        };

        // multer 인스턴스 생성
        this.upload = multer({
            storage: this.storage,
            fileFilter: this.fileFilter,
            limits: {
                fileSize: 5 * 1024 * 1024 // 5MB 제한
            }
        });
    }

    /**
     * 이미지 업로드 처리
     * 
     * @param {Object} file - multer로 업로드된 파일 객체
     * @returns {Object} 업로드 결과 { image_url, file_size, file_type }
     * 
     * @example 
     * const result = await reviewService.uploadImage(req.file);
     */
    async uploadImage(file) {
        try {
            // 1. 파일 존재 여부 확인 (사용자가 파일을 보내지 않았거나, multer에서 처리 실패 시)
            if (!file) {
                throw new ImageUploadFailedError({ reason: '파일이 업로드되지 않았습니다' });
            }

            // 2. 파일 크기 추가 검증
            if (file.size > 5 * 1024 * 1024) {
                throw new FileSizeExceededError({ fileSize: file.size });
            }

            // 3. 파일 확장자 기준 추가 검증
            const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
            if (!['jpeg', 'jpg', 'png'].includes(ext)) {
                throw new UnsupportedImageFormatError({ fileType: file.mimetype });
            }

            // 4. S3 업로드 (리뷰 이미지 전용으로 reviews/ 폴더에 저장)
            const imageUrl = await uploadToS3(
                file.buffer,
                'reviews',
                ext
            );

            return {
                image_url: imageUrl,
                file_size: file.size,
                file_type: file.mimetype
            };

        } catch (error) {
            throw error;
        }
    }

    /**
     * S3 객체 삭제
     *
     * @param {string} imageUrl - 삭제할 이미지의 퍼블릭 URL
     * @returns {Promise<void>}
     */
    async deleteS3File(imageUrl) {
        try {
            if (imageUrl && imageUrl.includes('s3.amazonaws.com')) {
                await deleteFromS3(imageUrl);
                console.log(`S3 파일 삭제 완료: ${imageUrl}`);
            }
        } catch (error) {
            console.error('S3 파일 삭제 실패:', error);
        }
    }


    /**
     * 리뷰 작성
     *
     * @param {BigInt} requestId - 커미션 신청 ID
     * @param {BigInt} userId - 사용자 ID
     * @param {ReviewCreateDto} reviewDto - 검증된 DTO 객체
     * @returns {Object} 생성된 리뷰 정보 (DTO에서 처리할 원본 데이터)
     */
    async createReview(requestId, userId, reviewDto) {
        // DTO에서 검증된 데이터 추출
        const { rate, content, image_urls = [] } = reviewDto;

        // 1. 커미션 신청 존재 여부 및 권한 확인
        const request = await reviewRepository.findRequestByIdForReview(requestId);
        if (!request) {
            throw new RequestNotFoundError({ requestId });
        }

        // 2. 리뷰 작성 권한 확인 (본인이 신청한 커미션인지)
        if (request.userId !== userId) {
            throw new ReviewPermissionDeniedError({ userId, requestId });
        }

        // 3. 커미션 완료 상태 확인 (완료된 커미션만 리뷰 작성 가능)
        if (request.status !== 'COMPLETED') {
            throw new RequestNotCompletedError({ requestId, status: request.status });
        }

        // 4. 이미 리뷰가 작성되었는지 확인 (중복 리뷰 방지)
        const existingReview = await reviewRepository.findReviewByRequestId(requestId);
        if (existingReview) {
            throw new ReviewAlreadyExistsError({ requestId });
        }

        // 5. 세부 입력값 검증
        // 5-1. 별점 검증 (1-5점 사이)
        if (!rate || rate < 1 || rate > 5) {
            throw new ReviewRatingInvalidError({ rate });
        }
        // 5-2. 내용 최소 길이 검증 (10자 이상)
        if (!content || content.trim().length < 10) {
            throw new ReviewContentTooShortError({ contentLength: content ? content.trim().length : 0 });
        }
        // 5-3. 내용 최대 길이 검증 (1000자 이하)
        if (content.trim().length > 1000) {
            throw new ReviewContentTooLongError({ contentLength: content.trim().length });
        }

        // 6. 리뷰 데이터 DB 저장
        const review = await reviewRepository.createReview({
            userId,
            requestId,
            rate,
            content: content.trim()
        });

        // 7. 리뷰 이미지 저장 (최대 5개)
        // TODO: S3 연동 시 URL 검증 로직 필요 (현재는 로컬 URL만 처리)
        if (image_urls && image_urls.length > 0) {
            const imagesToSave = image_urls.slice(0, 5);

            for (const imageUrl of imagesToSave) {
                await reviewRepository.createImage('review', review.id, imageUrl);
            }
        }

        // 8. Controller로 반환할 데이터 구성 (DTO에서 BigInt 처리)
        return {
            id: review.id,
            requestId: review.requestId,
            userId: review.userId,
            rate: review.rate,
            content: review.content,
            image_urls: image_urls.slice(0, 5),
            createdAt: review.createdAt,
            updatedAt: review.updatedAt
        };
    }

    /**
     * 리뷰 수정
     * @param {BigInt} reviewId - 리뷰 ID
     * @param {BigInt} userId - 사용자 ID (권한 확인용)
     * @param {ReviewUpdateDto} reviewDto - 검증된 DTO 객체
     * @returns {Object} 수정된 리뷰 정보 (DTO에서 처리할 원본 데이터)
     */
    async updateReview(reviewId, userId, reviewDto) {
        // DTO에서 검증된 데이터 추출
        const { rate, content, image_urls = [] } = reviewDto;

        // 1. 리뷰 존재 여부 확인
        const review = await reviewRepository.findReviewById(reviewId);
        if (!review) {
            throw new ReviewNotFoundError({ reviewId });
        }

        // 2. 권한 확인 (작성자 본인만 수정 가능)
        if (review.userId !== userId) {
            throw new ReviewPermissionDeniedError({ userId, reviewId });
        }

        // 3. 세부 입력값 검증
        // 3-1. 별점 검증 (1-5점 사이)
        if (!rate || rate < 1 || rate > 5) {
            throw new ReviewRatingInvalidError({ rate });
        }
        // 3-2. 내용 최소 길이 검증 (10자 이상)
        if (!content || content.trim().length < 10) {
            throw new ReviewContentTooShortError({ contentLength: content ? content.trim().length : 0 });
        }
        // 3-3. 내용 최대 길이 검증 (1000자 이하)
        if (content.trim().length > 1000) {
            throw new ReviewContentTooLongError({ contentLength: content.trim().length });
        }

        // 4. 리뷰 업데이트
        const updatedReview = await reviewRepository.updateReview(reviewId, {
            rate,
            content: content.trim()
        });

        // 5. 이미지 업데이트 (프론트에서 보낸 최종 이미지 목록으로 교체)
        // 프론트 로직: 기존 이미지 로드 > 사용자가 추가/삭제 > 최종 결과만 백으로 전송
        // 백엔드 로직: 기존 이미지 목록 전체 삭제 > 새로 받은 이미지들로 교체
        
        // 5-1. 기존 이미지들 조회 후 S3에서 삭제
        const existingImages = await reviewRepository.getImagesByTarget('review', reviewId);
        for (const image of existingImages) {
            if (image.imageUrl) {
                await this.deleteS3File(image.imageUrl);
            }
        }
        
        // 5-2. DB에서 기존 이미지 정보 삭제
        await reviewRepository.deleteAllReviewImages(reviewId);

        // 5-3. 새로운 이미지들 추가 (최대 5개)
        if (image_urls && image_urls.length > 0) {
            const imagesToSave = image_urls.slice(0, 5);
            for (const imageUrl of imagesToSave) {
                await reviewRepository.createImage('review', reviewId, imageUrl);
            }
        }

        // 6. Controller로 반환할 데이터 구성
        return {
            id: updatedReview.id,
            requestId: updatedReview.requestId,
            userId: updatedReview.userId,
            rate: updatedReview.rate,
            content: updatedReview.content,
            image_urls: image_urls.slice(0, 5),
            createdAt: updatedReview.createdAt,
            updatedAt: updatedReview.updatedAt
        };
    }

    /**
     * 리뷰 삭제
     * 
     * @param {BigInt} reviewId - 리뷰 ID
     * @param {BigInt} userId - 사용자 ID (권한 확인용)
     * @returns {Object} 삭제 결과 메시지
     */
    async deleteReview(reviewId, userId) {
        // 1. 리뷰 존재 여부 확인
        const review = await reviewRepository.findReviewById(reviewId);
        if (!review) {
            throw new ReviewNotFoundError({ reviewId });
        }

        // 2. 권한 확인 (작성자 본인만 삭제 가능)
        if (review.userId !== userId) {
            throw new ReviewPermissionDeniedError({ userId, reviewId });
        }

        // 3. 관련 이미지들 조회 후 S3에서 삭제
        const reviewImages = await reviewRepository.getImagesByTarget('review', reviewId);
        for (const image of reviewImages) {
            if (image.imageUrl) {
                await this.deleteS3File(image.imageUrl);
            }
        }

        // 4. DB에서 이미지 정보 삭제
        await reviewRepository.deleteAllReviewImages(reviewId);

        // 5. 리뷰 삭제
        await reviewRepository.deleteReview(reviewId);

        // 6. 성공 메시지 반환
        return {
            message: "리뷰가 성공적으로 삭제되었습니다."
        };
    }

    /**
     * 사용자별 리뷰 목록 조회
     * 
     * @param {BigInt} userId - 조회할 사용자 ID
     * @param {number} page - 페이지 번호 (기본값: 1)
     * @param {number} limit - 페이지당 항목 수 (기본값: 10)
     * @returns {Object} { items: 리뷰 목록, pagination: 페이지네이션 정보 }
     */
    async getReviewsByUserId(userId, page = 1, limit = 10) {
        // 1. 사용자 존재 여부 확인
        const user = await reviewRepository.findUserById(userId);
        if (!user) {
            throw new UserNotFoundError(userId);
        }

        // 2. 입력값 검증 및 보정
        const validatedPage = Math.max(1, parseInt(page) || 1); // 음수나 0이면 1로 보정
        const validatedLimit = Math.min(50, Math.max(1, parseInt(limit) || 10)); // 최대 50개로 제한 (무한스크롤 성능 고려)

        // 3. 해당 사용자가 작성한 리뷰 목록 조회
        const { items: reviews, total } = await reviewRepository.findReviewsByUserId(
            userId,
            validatedPage,
            validatedLimit
        );

        // 4. 각 리뷰에 대해 화면에 표시할 이미지 정보 추가
        for (let review of reviews) {
            // 4-1. 커미션 썸네일 조회 (첫 번째 이미지 가져오기)
            const commissionImages = await reviewRepository.getImagesByTarget(
                'commission',
                review.request.commission.id
            );
            review.request.commission.thumbnail = commissionImages[0]?.imageUrl || null;

            // 4-2. 리뷰 이미지 목록 조회 (사용자가 리뷰 작성 시 첨부한 이미지)
            const reviewImages = await reviewRepository.getImagesByTarget(
                'review',
                review.id
            );
            review.image_urls = reviewImages.map(img => img.imageUrl);
        }

        // 5. 무한 스크롤을 위한 페이지네이션 정보 생성
        const pagination = {
            page: validatedPage,
            limit: validatedLimit,
            total: total,
            totalPages: Math.ceil(total / validatedLimit)
        };

        // 6. Controller로 원본 데이터 반환
        return {
            items: reviews,
            pagination: pagination
        };
    }

}

export default new ReviewService();