const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ReviewRepository {
  
  /**
   * 이미지 정보를 데이터베이스에 저장
   * @param {string} target - 이미지가 연결될 대상 ('review')
   * @param {number} targetId - 대상의 ID (리뷰 ID)
   * @param {string} imageUrl - 업로드된 이미지 URL
   * @returns {Object} 저장된 이미지 정보
   */
  async createImage(target, targetId, imageUrl) {
    return await prisma.image.create({
      data: {
        target,
        targetId: BigInt(targetId),
        imageUrl
      }
    });
  }

  /**
   * 특정 대상의 이미지들 조회
   * @param {string} target - 대상 타입 ('review')
   * @param {number} targetId - 대상 ID
   * @returns {Array} 이미지 목록
   */
  async getImagesByTarget(target, targetId) {
    return await prisma.image.findMany({
      where: {
        target,
        targetId: BigInt(targetId)
      },
      orderBy: {
        id: 'asc'
      }
    });
  }
}

module.exports = new ReviewRepository();