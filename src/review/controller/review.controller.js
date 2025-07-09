import reviewService from '../service/review.service.js';
import { BaseError } from '../../common/errors/BaseError.js';

class ReviewController {

  /**
   * 리뷰 이미지 업로드 API
   */
  async uploadImage(req, res) {
    try {
      const result = await reviewService.uploadImage(req.file);
      
      // 업로드 성공 응답
      res.status(200).json({
        resultType: "SUCCESS",
        error: null,
        success: result
      });

    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      
      // 리뷰 커스텀 에러(review.errors)
      if (error instanceof BaseError) {
        return res.status(error.statusCode).json({
          resultType: "FAIL",
          error: {
            errorCode: error.errorCode,
            reason: error.reason,
            data: error.data
          },
          success: null
        });
      }

      // multer 에러 처리
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          resultType: "FAIL",
          error: {
            errorCode: "R009",
            reason: "이미지 파일 크기가 초과되었습니다",
            data: { 
              maxSize: 5 * 1024 * 1024 // 5MB
            }
          },
          success: null
        });
      }

      // 기타 에러(서버 에러)
      res.status(500).json({
        resultType: "FAIL", 
        error: {
          errorCode: "R007",
          reason: "리뷰 이미지 업로드에 실패했습니다",
          data: { reason: error.message }
        },
        success: null
      });
    }
  }

  /**
   * 리뷰 작성 API
   */
  async createReview(req, res) {
    try {
      const requestId = parseInt(req.params.requestId);
      const userId = req.user.id; // TODO: 실제 JWT 인증 미들웨어로 교체 필요 (현재는 테스트용 하드코딩)
      const reviewData = req.body;

      const result = await reviewService.createReview(requestId, userId, reviewData);

      // 리뷰 작성 성공 응답
      res.status(201).json({
        resultType: "SUCCESS",
        error: null,
        success: result
      });

    } catch (error) {
      console.error('리뷰 작성 실패:', error);
      
      // 리뷰 커스텀 에러
      if (error instanceof BaseError) {
        return res.status(error.statusCode).json({
          resultType: "FAIL",
          error: {
            errorCode: error.errorCode,
            reason: error.reason,
            data: error.data
          },
          success: null
        });
      }

      // 기타 에러(서버 에러)
      res.status(500).json({
        resultType: "FAIL",
        error: {
          errorCode: "R007",
          reason: "리뷰 작성에 실패했습니다",
          data: { reason: error.message }
        },
        success: null
      });
    }
  }
}

export default new ReviewController();