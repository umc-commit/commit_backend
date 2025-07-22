import { StatusCodes } from "http-status-codes";
import { HomeService } from '../service/home.service.js';
import { parseWithBigInt, stringifyWithBigInt } from "../../bigintJson.js";

// 홈화면 데이터 조회
export const getHomeData = async (req, res, next) => {
  try {
    const userId = BigInt(req.user.userId);
    
    const result = await HomeService.getHomeData(userId);
    const responseData = parseWithBigInt(stringifyWithBigInt(result));

    res.status(StatusCodes.OK).success(responseData);
  } catch (err) {
    next(err);
  }
};