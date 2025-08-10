import { StatusCodes } from "http-status-codes";
import { CommissionService } from '../service/commission.service.js';
import 
{ GetCommissionDetailDto,
  GetCommissionArtistInfoDto,
  GetCommissionFormDto,
  SubmitCommissionRequestDto
 } from "../dto/commission.dto.js";
import { parseWithBigInt, stringifyWithBigInt } from "../../bigintJson.js";
import { BadgeRepository } from "../../user/repository/badge.repository.js";

// 커미션 게시글 상세글 조회
export const getCommissionDetail = async (req, res, next) => {
 try {
   const userId = req.user?.userId ? BigInt(req.user.userId) : null;
   const dto = new GetCommissionDetailDto({
     commissionId: BigInt(req.params.commissionId)
   });

   const commission = await CommissionService.getCommissionDetail(userId, dto);
   const responseData = parseWithBigInt(stringifyWithBigInt(commission));

   res.status(StatusCodes.OK).success(responseData);
 } catch (err) {
   next(err);
 }
};

// 커미션 게시글 작가 정보 조회
export const getCommissionArtistInfo = async (req, res, next) => {
  try {
    const userId = req.user.userId ? BigInt(req.user.userId) : null;
    const dto = new GetCommissionArtistInfoDto({
      commissionId: BigInt(req.params.commissionId),
      page: req.query.page,
      limit: req.query.limit
    });

    const result = await CommissionService.getCommissionArtistInfo(userId, dto);
    const responseData = parseWithBigInt(stringifyWithBigInt(result));

    res.status(StatusCodes.OK).success(responseData);
  } catch (err) {
    next(err);
  }
};

// 커미션 신청폼 조회
export const getCommissionForm = async (req, res, next) => {
  try {
    const userId = req.user?.userId ? BigInt(req.user.userId) : null;
    const dto = new GetCommissionFormDto({
      commissionId: BigInt(req.params.commissionId)
    });

    const result = await CommissionService.getCommissionForm(userId, dto);
    const responseData = parseWithBigInt(stringifyWithBigInt(result));

    res.status(StatusCodes.OK).success(responseData);
  } catch (err) {
    next(err);
  }
};

// 커미션 신청 이미지 업로드
export const uploadRequestImage = async (req, res, next) => {
  // multer 미들웨어 적용
  const upload = CommissionService.getUploadMiddleware();
  
  upload(req, res, async (err) => {
    try {
      // multer 에러 처리
      if (err) {
        return next(err);
      }

      // 파일 업로드 처리
      const result = await CommissionService.uploadRequestImage(req.file);
      
      res.status(StatusCodes.OK).success(result);
    } catch (error) {
      next(error);
    }
  });
}

// 커미션 신청 제출
export const submitCommissionRequest = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const accountId = req.user.accountId;

    const dto = new SubmitCommissionRequestDto({
      commissionId: BigInt(req.params.commissionId),
      formAnswer: req.body.formAnswer
    });

    const result = await CommissionService.submitCommissionRequest(userId, dto);
    const responseData = parseWithBigInt(stringifyWithBigInt(result));

    await BadgeRepository.GiveCommissionApplyBadges(userId, accountId);

    res.status(StatusCodes.OK).success(responseData);
  } catch (err) {
    next(err);
  }
};

// 커미션 리포트 조회
export const getCommissionReport = async (req, res, next) => {
	try {
		const userId = BigInt(req.user.userId);
		
		const result = await CommissionService.getReport(userId);
		const responseData = parseWithBigInt(stringifyWithBigInt(result));

		res.status(StatusCodes.OK).success(responseData);
	} catch (err) {
		next(err);
	}
};