import { prisma } from '../../db.config.js';

export class SearchRepository {
  /**
   * 태그 5개를 랜덤으로 조회
   * @param {number} limit - 가져올 태그 개수
   * @returns {Promise<Array<{id: number, name: string}>>}
   */
  static async getRandomTags(limit = 5) {
    return await prisma.$queryRawUnsafe(`SELECT id, name FROM tags ORDER BY RAND() LIMIT ${limit}`);
  }
}
