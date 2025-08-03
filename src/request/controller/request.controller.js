import { StatusCodes } from "http-status-codes";
import { RequestService } from '../service/request.service.js';
import { 
  GetRequestListDto,
  UpdateRequestStatusDto,
  GetRequestDetailDto,
  GetRequestFormDto,
  GetCompletedRequestsDto,
  GetRequestResultDto
} from "../dto/request.dto.js";
import { parseWithBigInt, stringifyWithBigInt } from "../../bigintJson.js";

// 신청 목록 조회
export const getRequestList = async (req, res, next) => {
  try {
    const userId = BigInt(req.user.userId);
    const dto = new GetRequestListDto({
      filter: req.query.filter,
      page: req.query.page,
      limit: req.query.limit
    });

    const result = await RequestService.getRequestList(userId, dto);
    const responseData = parseWithBigInt(stringifyWithBigInt(result));

    res.status(StatusCodes.OK).success(responseData);
  } catch (err) {
    next(err);
  }
};

// 커미션 신청 상태 변경
export const updateRequestStatus = async (req, res, next) => {
  try {
    const userId = req.user?.userId ? BigInt(req.user.userId) : null;
    const dto = new UpdateRequestStatusDto({
      requestId: BigInt(req.params.requestId),
      status: req.body.status
    });

    const result = await RequestService.updateRequestStatus(userId, dto);
    const responseData = parseWithBigInt(stringifyWithBigInt(result));

    res.status(StatusCodes.OK).success(responseData);
  } catch (err) {
    next(err);
  }
};

// 신청함 상세 조회
export const getRequestDetail = async (req, res, next) => {
  try {
    const userId = BigInt(req.user.userId);
    const dto = new GetRequestDetailDto({
      requestId: req.params.requestId
    });

    const result = await RequestService.getRequestDetail(userId, dto.requestId);
    const responseData = parseWithBigInt(stringifyWithBigInt(result));

    res.status(StatusCodes.OK).success(responseData);
  } catch (err) {
    next(err);
  }
};

// 제출된 신청서 조회
export const getSubmittedRequestForm = async (req, res, next) => {
   try {
   	const userId = BigInt(req.user.userId);
   	const dto = new GetRequestFormDto({
   		requestId: BigInt(req.params.requestId)
   	});

   	const result = await RequestService.getSubmittedRequestForm(userId, dto);
   	const responseData = parseWithBigInt(stringifyWithBigInt(result));

   	res.status(StatusCodes.OK).success(responseData);
   } catch (err) {
   	next(err);
   }
};

// 완료된 신청내역 조회
export const getCompletedRequests = async (req, res, next) => {
   try {
   	const userId = BigInt(req.user.userId);
   	const dto = new GetCompletedRequestsDto({
   		sort: req.query.sort,
   		page: req.query.page,
   		limit: req.query.limit
   	});

   	const result = await RequestService.getCompletedRequests(userId, dto);
   	const responseData = parseWithBigInt(stringifyWithBigInt(result));

   	res.status(StatusCodes.OK).success(responseData);
   } catch (err) {
   	next(err);
   }
};

// 작업물 조회
export const getRequestResult = async (req, res, next) => {
  try {
    const userId = BigInt(req.user.userId);
    const dto = new GetRequestResultDto({
      requestId: req.params.requestId
    });

    const result = await RequestService.getRequestResult(userId, dto);
    const responseData = parseWithBigInt(stringifyWithBigInt(result));

    res.status(StatusCodes.OK).success(responseData);
  } catch (err) {
    next(err);
  }
};
