import { SearchRepository } from '../repository/search.repository.js';

export class SearchService {
  /**
   * 랜덤 추천 태그 5개 조회
   * @returns {Promise<Array<{id: number, name: string}>>}
   */
  static async getRecommendedTags() {
    return await SearchRepository.getRandomTags(5);
  }
}