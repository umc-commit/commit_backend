import { StatusCodes } from "http-status-codes";
import { stringifyWithBigInt } from "../../bigintJson.js";
import {
    RequestIdRequiredError,
    ReviewIdRequiredError,
    UserIdRequiredError,
    ImageUploadFailedError
} from '../../common/errors/review.errors.js';
import {
    ImageUploadResponseDto,
    ReviewCreateDto,
    ReviewListResponseDto,
    ReviewResponseDto,
    ReviewUpdateDto
} from '../dto/review.dto.js'; // DTO 클래스 import
import reviewService from '../service/review.service.js';

class ReviewController {

    /**
     * 리뷰 이미지 업로드 API
     */
    async uploadImage(req, res, next) {
        try {
            if (!req.file) {
                throw new ImageUploadFailedError({ reason: '파일이 업로드되지 않았습니다' });
            }

            const result = await reviewService.uploadImage(req.file);

            // 응답 데이터를 DTO로 구조화
            const responseData = new ImageUploadResponseDto(result);
            // BigInt를 JSON 문자열로 변환 후 다시 파싱하여 일반 객체로 변환
            const finalData = JSON.parse(stringifyWithBigInt(responseData));

            // 클라이언트에 응답 전송 (200 OK)
            res.status(StatusCodes.OK).json({
                resultType: "SUCCESS",
                error: null,
                success: finalData
            });

        } catch (error) {
            // 에러 발생 시 에러 처리 미들웨어로 넘김
            next(error);
        }
    }

    /**
     * 리뷰 작성 API
     */
    async createReview(req, res, next) {
        try {
            // URL 파라미터에서 커미션 신청 ID(requestId)를 추출하고 BigInt로 변환
            if (!req.params.requestId) {
                throw new RequestIdRequiredError(); // requestId가 누락된 경우 RequestIdRequiredError 반환
            }
            const requestId = BigInt(req.params.requestId);

            // 현재 로그인한 사용자 ID (BigInt 변환)
            const userId = BigInt(req.user.userId);

            // 요청 본문 데이터를 DTO 클래스로 구조화
            const reviewDto = new ReviewCreateDto(req.body);

            // 리뷰 생성 서비스 호출
            const result = await reviewService.createReview(requestId, userId, reviewDto);

            // 생성된 리뷰를 응답용 DTO로 가공
            const responseData = new ReviewResponseDto(result);
            // BigInt를 JSON 문자열로 변환 후 다시 파싱하여 일반 객체로 변환
            const finalData = JSON.parse(stringifyWithBigInt(responseData));

            // 클라이언트에 응답 전송 (201 Created)
            res.status(StatusCodes.CREATED).json({
                resultType: "SUCCESS",
                error: null,
                success: finalData
            });

        } catch (error) {
            // 에러 발생 시 에러 처리 미들웨어로 넘김
            next(error);
        }
    }

    /**
     * 리뷰 수정 API
     */
    async updateReview(req, res, next) {
        try {
            // URL 파라미터에서 리뷰 ID를 추출하고 BigInt로 변환
            if (!req.params.reviewId) {
                throw new ReviewIdRequiredError(); // reviewId가 누락된 경우 ReviewIdRequiredError 반환
            }
            const reviewId = BigInt(req.params.reviewId);

            // 현재 로그인한 사용자 ID (BigInt 변환)
            const userId = BigInt(req.user.userId);

            // 요청 본문 데이터를 DTO 클래스로 구조화
            const reviewDto = new ReviewUpdateDto(req.body);

            // 리뷰 수정 서비스 호출
            const result = await reviewService.updateReview(reviewId, userId, reviewDto);

            // 수정된 리뷰를 응답용 DTO로 가공
            const responseData = new ReviewResponseDto(result);
            // BigInt를 JSON 문자열로 변환 후 다시 파싱하여 일반 객체로 변환
            const finalData = JSON.parse(stringifyWithBigInt(responseData));

            // 클라이언트에 응답 전송 (200 OK)
            res.status(StatusCodes.OK).json({
                resultType: "SUCCESS",
                error: null,
                success: finalData
            });

        } catch (error) {
            // 에러 발생 시 에러 처리 미들웨어로 넘김
            next(error);
        }
    }

    /**
     * 리뷰 삭제 API
     */
    async deleteReview(req, res, next) {
        try {
            // URL 파라미터에서 리뷰 ID를 추출하고 BigInt로 변환
            if (!req.params.reviewId) {
                throw new ReviewIdRequiredError(); // reviewId가 누락된 경우 ReviewIdRequiredError 반환
            }
            const reviewId = BigInt(req.params.reviewId);

            // 현재 로그인한 사용자 ID (BigInt 변환)
            const userId = BigInt(req.user.userId);

            // 리뷰 삭제 서비스 호출
            const result = await reviewService.deleteReview(reviewId, userId);

            // 클라이언트에 응답 전송 (200 OK)
            res.status(StatusCodes.OK).json({
                resultType: "SUCCESS",
                error: null,
                success: result
            });

        } catch (error) {
            // 에러 발생 시 에러 처리 미들웨어로 넘김
            next(error);
        }
    }

    /**
     * 사용자별 리뷰 목록 조회 API
     */
    async getReviewsByUserId(req, res, next) {
        try {
            // URL 파라미터에서 사용자 ID를 추출하고 BigInt로 변환
            if (!req.params.userId) {
                throw new UserIdRequiredError(); // userId가 누락된 경우 UserIdRequiredError 반환
            }
            const userId = BigInt(req.params.userId);

            // 쿼리 파라미터에서 페이지네이션 정보 추출
            const page = req.query.page || 1;
            const limit = req.query.limit || 10;

            // 리뷰 목록 조회 서비스 호출
            const result = await reviewService.getReviewsByUserId(userId, page, limit);

            // 응답 데이터를 DTO로 구조화
            const responseData = new ReviewListResponseDto(result.items, result.pagination);
            // BigInt를 JSON 문자열로 변환 후 다시 파싱하여 일반 객체로 변환
            const finalData = JSON.parse(stringifyWithBigInt(responseData));

            // 클라이언트에 응답 전송 (200 OK)
            res.status(StatusCodes.OK).json({
                resultType: "SUCCESS",
                error: null,
                success: finalData
            });

        } catch (error) {
            // 에러 발생 시 에러 처리 미들웨어로 넘김
            next(error);
        }
    }

}

export default new ReviewController();