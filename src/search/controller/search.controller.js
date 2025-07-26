import { StatusCodes } from 'http-status-codes';
import { SearchService } from '../service/search.service.js';
import {
  SearchCommissionDto,
  GetRecentSearchDto,
 } from '../dto/search.dto.js';
import { parseWithBigInt, stringifyWithBigInt } from '../../bigintJson.js';

/**
 * 검색 결과 조회
 */
export const searchCommissions = async (req, res, next) => {
  try {
    const searchDto = new SearchCommissionDto(req.query);
    const userId = req.user.userId;

    const result = await SearchService.searchCommissions(searchDto, userId);

    const response = parseWithBigInt(stringifyWithBigInt(result));

    return res.status(StatusCodes.OK).success(response);
  } catch (err) {
    next(err);
  }
};

/**
 * 추천 태그 조회
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

/**
 * 최근 검색어 조회
 */
export const getRecentSearches = async (req, res, next) => {
  try {
    const getRecentSearchDto = new GetRecentSearchDto(req.query);
    const userId = req.user.userId;

    const result = await SearchService.getRecentSearches(getRecentSearchDto, userId);

    const response = parseWithBigInt(stringifyWithBigInt(result));

    return res.status(StatusCodes.OK).success(response);
  } catch (err) {
    next(err);
  }
};