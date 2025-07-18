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

  /**
   * 사용자의 북마크 목록 조회 (커서 기반 페이징)
   */
  async findBookmarksByUserId(userId, dto) {
    const { sort, limit, cursor, excludeFullSlots = false } = dto;

    const baseCondition = {
    userId: BigInt(userId)
    };

    let whereCondition = { ...baseCondition };
    let orderBy = [];
    
    if (cursor) {
      const decodedCursor = JSON.parse(Buffer.from(cursor, 'base64').toString());
      switch (sort) {
        case 'latest': // 최신순 정렬
          whereCondition.createdAt = { lt: new Date(decodedCursor.created_at) };
          orderBy = [{ createdAt: 'desc' }, { id: 'desc' }];
          break;
        case 'price_low': // 저가순 정렬
          whereCondition.OR = [
            { commission: { minPrice: { gt: decodedCursor.min_price } } },
            { 
              commission: { minPrice: decodedCursor.min_price },
              createdAt: { lt: new Date(decodedCursor.created_at) }
            }
          ];
          orderBy = [{ commission: { minPrice: 'asc' } }, { createdAt: 'desc' }];
          break;
        case 'price_high': // 고가순 정렬
          whereCondition.OR = [
            { commission: { minPrice: { lt: decodedCursor.min_price } } },
            { 
              commission: { minPrice: decodedCursor.min_price },
              createdAt: { lt: new Date(decodedCursor.created_at) }
            }
          ];
          orderBy = [{ commission: { minPrice: 'desc' } }, { createdAt: 'desc' }];
          break;
      }
    } else {
      switch (sort) {
        case 'latest':
          orderBy = [{ createdAt: 'desc' }, { id: 'desc' }];
          break;
        case 'price_low':
          orderBy = [{ commission: { minPrice: 'asc' } }, { createdAt: 'desc' }];
          break;
        case 'price_high':
          orderBy = [{ commission: { minPrice: 'desc' } }, { createdAt: 'desc' }];
          break;
      }
    }

    return await prisma.bookmark.findMany({
      where: whereCondition,
      include: {
        commission: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            },
            commissionTags: {
              include: {
                tag: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
            artist: {
              select: {
                id: true,
                nickname: true,
                profileImage: true,
                slot: true
              }
            },
            requests: { // 남은 슬롯 계산
              where: { 
                status: { 
                  in: ['APPROVED', 'IN_PROGRESS', 'SUBMITTED'] 
                } 
              },
              select: { id: true }
            }
          }
        }
      },
      orderBy,
      take: excludeFullSlots ? 100 : limit + 1, // hasNext 확인용
    });
  },

  /**
   * 사용자의 총 북마크 수 조회
   */
  async countBookmarksByUserId(userId) {
    return await prisma.bookmark.count({
      where: { 
        userId: BigInt(userId)
      }
    });
  },

  /**
   * 사용자의 슬롯이 남은 북마크 수 조회 (excludeFullSlots=true용)
  */
  async countAvailableBookmarksByUserId(userId) {
    // 모든 북마크를 가져와서 슬롯 계산 후 필터링
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: BigInt(userId) },
     include: {
        commission: {
          include: {
            artist: { select: { slot: true } },
            requests: {
              where: { status: { in: ['APPROVED', 'IN_PROGRESS', 'SUBMITTED'] } },
            select: { id: true }
            }
          }
        }
     }
    });

    // remainingSlots > 0인 것만 카운트
    return bookmarks.filter(bookmark => {
      const remainingSlots = bookmark.commission.artist.slot - bookmark.commission.requests.length;
      return remainingSlots > 0;
    }).length;
  },  

  /**
   * 커미션 게시글의 썸네일 조회
   */
  async findThumbnailImageByCommissionId(commissionId) {
    return await prisma.image.findFirst({
      where: {
        target: 'commission',
        targetId: BigInt(commissionId),
        orderIndex: 0
      },
      select: { imageUrl: true }
    });
  },
};