import { SearchRepository } from '../repository/search.repository.js';
import { CommissionItemDto } from '../dto/search.dto.js';
import { 
  InvalidSearchKeywordError,
  SearchKeywordTooLongError,
  InvalidCategoryIdError,
  InvalidSortTypeError,
  InvalidDeadlineError,
  InvalidPageError,
  InvalidLimitError,
  CategoryNotFoundError,
  InvalidPriceRangeError
} from '../../common/errors/search.errors.js';

export class SearchService {

  /**
   * 커미션 검색
   */
  static async searchCommissions(searchDto, userId = null) {
    // 파라미터 검증
    this.validateSearchParams(searchDto);

    // 카테고리 존재 확인
    if (searchDto.categoryId) {
      const categoryExists = await SearchRepository.categoryExists(searchDto.categoryId);
      if (!categoryExists) {
        throw new CategoryNotFoundError();
      }
    }

    // 검색 실행
    const { commissions, totalCount } = await SearchRepository.searchCommissions({
      keyword: searchDto.keyword,
      categoryId: searchDto.categoryId,
      minPrice: searchDto.minPrice,
      maxPrice: searchDto.maxPrice,
      deadline: searchDto.deadline,
      followingOnly: searchDto.followingOnly,
      userId: userId,
      sort: searchDto.sort,
      page: searchDto.page,
      limit: searchDto.limit
    });

    //  검색어 저장
    if (userId) {
      SearchRepository.saveSearchHistory(userId, searchDto.keyword)
        .catch(err => console.error('검색어 저장 실패:', err));
    }

    // 커미션 ID 목록 추출
    const commissionIds = commissions.map(commission => commission.id);

    // 북마크 상태와 썸네일 이미지 조회
    const [bookmarkMap, thumbnailMap] = await Promise.all([
      SearchRepository.getBookmarkStatus(userId, commissionIds),
      SearchRepository.getCommissionThumbnails(commissionIds)
    ]);

    // 응답 데이터 변환
    const commissionItems = commissions.map(commission => {
      return new CommissionItemDto({
        id: commission.id,
        title: commission.title,
        minPrice: commission.minPrice,
        thumbnailImageUrl: thumbnailMap.get(commission.id) || null,
        deadline: commission.deadline,
        isBookmarked: bookmarkMap.get(commission.id) || false,
        category: {
          id: commission.category.id,
          name: commission.category.name
        },
        artist: {
          id: commission.artist.id,
          nickname: commission.artist.nickname,
          profileImageUrl: commission.artist.profileImage
        },
        tags: commission.commissionTags.map(ct => ({
          id: ct.tag.id,
          name: ct.tag.name
        }))
      });
    });

    // 페이지네이션 정보 계산
    const totalPages = Math.ceil(totalCount / searchDto.limit);

    return {
      commissions: commissionItems,
      pagination: {
        page: searchDto.page,
        limit: searchDto.limit,
        totalCount: totalCount,
        totalPages: totalPages
      }
    };
  }

  /**
   * 검색 파라미터 검증
   */
  static validateSearchParams(searchDto) {
    // 검색어 검증
    if (!searchDto.keyword || searchDto.keyword.trim().length === 0) {
      throw new InvalidSearchKeywordError();
    }
    
    if (searchDto.keyword && searchDto.keyword.length > 100) {
      throw new SearchKeywordTooLongError();
    }
    
    // 카테고리 ID 검증
    if (searchDto.categoryId !== null && (!Number.isInteger(searchDto.categoryId) || searchDto.categoryId <= 0)) {
      throw new InvalidCategoryIdError();
    }
    
    // 정렬 방식 검증
    const validSortTypes = ['latest', 'price_low', 'price_high'];
    if (searchDto.sort && !validSortTypes.includes(searchDto.sort)) {
      throw new InvalidSortTypeError();
    }

    // 가격 범위 검증
    if (searchDto.minPrice !== null && searchDto.maxPrice !== null && searchDto.minPrice > searchDto.maxPrice) {
      throw new InvalidPriceRangeError();
    }
    
    // 마감 기한 검증
    const validDeadlines = ['all', '1', '7', '14', '30'];
    if (searchDto.deadline && !validDeadlines.includes(searchDto.deadline)) {
      throw new InvalidDeadlineError();
    }
    
    // 페이지 검증
    if (searchDto.page < 1) {
      throw new InvalidPageError();
    }
    
    // 제한 수 검증
    if (searchDto.limit < 1 || searchDto.limit > 50) {
      throw new InvalidLimitError();
    }
  }

  /**
   * 랜덤 추천 태그 6개 조회
   */
  static async getRecommendedTags() {
    return await SearchRepository.getRandomTags(6);
  }
}