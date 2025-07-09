const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ReviewRepository {
  
  /**
   * 이미지 정보를 데이터베이스에 저장
   * 사용 시점: 리뷰 작성 시 (리뷰 ID가 생성된 이후)
   * @param {string} target - 이미지가 연결될 대상 ('review')
   * @param {number} targetId - 연결할 리뷰의 ID
   * @param {string} imageUrl - 업로드된 이미지의 URL
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
   * 특정 리뷰의 이미지들을 조회
   * 사용 시점: 리뷰 목록 조회 시
   * @param {string} target - 대상 타입 ('review')
   * @param {number} targetId - 조회할 리뷰의 ID
   * @returns {Array} 해당 리뷰의 이미지 목록
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