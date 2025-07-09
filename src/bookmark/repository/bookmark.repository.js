import { prisma } from "../../db.config.js"

export const BookmarkRepository = {

  /**
   * 사용자 + 커미션id로 북마크 조회
   */
 async findBookmarkByUserAndCommission(userId, commissionId) {
   return await prisma.bookmark.findUnique({
     where: {
       userId_commissionId: {
         userId,
         commissionId
       }
     }
   });
 },

  /**
   * 북마크 생성
   */
 async createBookmark(data) {
   return await prisma.bookmark.create({
     data
   });
 },

  /**
  * 북마크 ID로 단일 조회
  */
 async findBookmarkById(bookmarkId) {
   return await prisma.bookmark.findUnique({
     where: {
       id: BigInt(bookmarkId)
     }
   });
 },

  /**
  * 단일 북마크 삭제
  */
 async deleteBookmark(bookmarkId) {
   return await prisma.bookmark.delete({
     where: {
       id: BigInt(bookmarkId)
     }
   });
 },

  /**
   * 다중 북마크 조회
   */
  async findBookmarksByIds(bookmarkIds) {
    return await prisma.bookmark.findMany({
      where: {
        id: { in: bookmarkIds.map((id) => BigInt(id)) },
      },
    });
  },

  /**
   * 다중 북마크 삭제
   */
  async deleteBookmarksByIds(bookmarkIds) {
    return await prisma.bookmark.deleteMany({
      where: {
        id: { in: bookmarkIds.map((id) => BigInt(id)) },
      },
    });
  },
};