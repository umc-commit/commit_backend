import { StatusCodes } from "http-status-codes";
import { HomeService } from '../service/home.service.js';
import { GetFollowingCommissionsDto } from "../dto/home.dto.js";
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

// 팔로잉 작가 커미션 조회
export const getFollowingCommissions = async (req, res, next) => {
  try {
    const userId = BigInt(req.user.userId);
    const dto = new GetFollowingCommissionsDto({
      page: req.query.page,
      limit: req.query.limit
    });

    const result = await HomeService.getFollowingCommissions(userId, dto);
    const responseData = parseWithBigInt(stringifyWithBigInt(result));

    res.status(StatusCodes.OK).success(responseData);
  } catch (err) {
    next(err);
  }
};