import { StatusCodes } from 'http-status-codes';
import { SearchService } from '../service/search.service.js';
import { parseWithBigInt, stringifyWithBigInt } from '../../bigintJson.js';

/**
 * 추천 태그 조회
 * - 검색창 상단에 노출할 태그 5개를 랜덤하게 반환
 */
export const getRecommendedTags = async (req, res, next) => {
  try {
    const tags = await SearchService.getRecommendedTags();

    const response = parseWithBigInt(stringifyWithBigInt({
      tags,
    }));

    return res.status(StatusCodes.OK).success(response);
  } catch (err) {
    next(err);
  }
};