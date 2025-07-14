import { StatusCodes } from "http-status-codes";
import reviewService from '../service/review.service.js';
import { parseWithBigInt, stringifyWithBigInt } from "../../bigintJson.js";
import {
    ReviewCreateDto,
    ReviewResponseDto,
    ImageUploadResponseDto
} from '../dto/review.dto.js'; // DTO 클래스 import

class ReviewController {

    /**
     * 리뷰 이미지 업로드 API
     */
    async uploadImage(req, res, next) {
        try {
            const result = await reviewService.uploadImage(req.file);

            // 응답 데이터를 DTO로 구조화
            const responseData = new ImageUploadResponseDto(result);
            // BigInt를 JSON 문자열로 변환
            const finalData = parseWithBigInt(stringifyWithBigInt(responseData));

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
            const requestId = BigInt(req.params.requestId);

            // 현재 로그인한 사용자 ID (BigInt 변환)
            const userId = BigInt(req.user.id); // TODO: 실제 JWT 인증 미들웨어로 교체 필요 (현재는 테스트용 하드코딩)

            // 요청 본문 데이터를 DTO 클래스로 구조화
            const reviewDto = new ReviewCreateDto(req.body);

            // 리뷰 생성 서비스 호출
            const result = await reviewService.createReview(requestId, userId, reviewDto);

            // 생성된 리뷰를 응답용 DTO로 가공
            const responseData = new ReviewResponseDto(result);
            // BigInt를 JSON 문자열로 변환
            const finalData = parseWithBigInt(stringifyWithBigInt(responseData));

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

}

export default new ReviewController();