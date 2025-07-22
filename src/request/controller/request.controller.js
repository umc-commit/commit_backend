import { StatusCodes } from "http-status-codes";
import { RequestService } from '../service/request.service.js';
import { GetRequestListDto } from "../dto/request.dto.js";
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