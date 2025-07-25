import { prisma } from '../../db.config.js';

export class SearchRepository {
  /**
   * 커미션 검색
   */
  static async searchCommissions({ 
    keyword, 
    categoryId, 
    minPrice, 
    maxPrice,
    deadline, 
    followingOnly, 
    userId,
    sort,
    page, 
    limit 
  }) {
    const where = {};
    const offset = (page - 1) * limit;

    // 검색어 파싱 및 조건 설정
    if (keyword.startsWith('@')) {
      // 작가 검색
      const artistName = keyword.slice(1);
      where.artist = {
        nickname: {
          contains: artistName
        }
      };
    } else if (keyword.startsWith('#')) {
      // 태그 검색
      const tagNames = keyword.split('#').filter(tag => tag.trim()).map(tag => tag.trim());
      where.AND = tagNames.map(tagName => ({
        commissionTags: {
          some: {
            tag: {
              name: tagName
            }
          }
        }
      }));
    } else {
      // 일반 검색 (제목, 내용)
      where.OR = [
        { title: { contains: keyword } },
        { summary: { contains: keyword } },
        { content: { contains: keyword } }
      ];
    }

    // 카테고리 필터
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // 가격 범위 필터 (minPrice <= commission.minPrice <= maxPrice)
    const priceFilter = {};
    if (minPrice !== null) {
      priceFilter.gte = minPrice;
    }
    if (maxPrice !== null) {
      priceFilter.lte = maxPrice;
    }
    if (Object.keys(priceFilter).length > 0) {
      where.minPrice = priceFilter;
    }

    // 마감 기한 필터
    if (deadline !== 'all') {
      const deadlineValue = parseInt(deadline);
      where.deadline = { lte: deadlineValue };
    }

    // 팔로잉 필터 - AND 조건이 있으면 배열에 추가, 없으면 바로 설정
    if (followingOnly && userId) {
      const followCondition = {
        artist: {
          follows: {
            some: {
              userId: userId
            }
          }
        }
      };

      if (where.AND) {
        // 태그 검색 + 팔로잉 필터
        where.AND.push(followCondition);
      } else if (where.artist) {
        // 작가 검색 + 팔로잉 필터
        where.artist.follows = {
          some: {
            userId: userId
          }
        };
      } else {
        // 팔로잉 필터만
        where.artist = {
          follows: {
            some: {
              userId: userId
            }
          }
        };
      }
    }

    // 정렬 설정
    let orderBy = {};
    switch (sort) {
      case 'price_low':
        orderBy = { minPrice: 'asc' };
        break;
      case 'price_high':
        orderBy = { minPrice: 'desc' };
        break;
      case 'latest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // 데이터 조회
    const [commissions, totalCount] = await Promise.all([
      prisma.commission.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true }
          },
          artist: {
            select: {
              id: true,
              nickname: true,
              profileImage: true,
              ...(userId && {
                follows: {
                  where: { userId },
                  select: { id: true }
                }
              })
            }
          },
          commissionTags: {
            take: 2,
            include: {
              tag: {
                select: { id: true, name: true }
              }
            }
          },
          _count: {
            select: { bookmarks: true }
          }
        }
      }),
      prisma.commission.count({ where })
    ]);

    return { commissions, totalCount };
  }

  /**
   * 사용자의 북마크 여부 확인
   */
  static async getBookmarkStatus(userId, commissionIds) {
    if (!userId || commissionIds.length === 0) {
      return new Map();
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: userId,
        commissionId: { in: commissionIds }
      },
      select: { commissionId: true }
    });

    const bookmarkMap = new Map();
    commissionIds.forEach(id => bookmarkMap.set(id, false));
    bookmarks.forEach(bookmark => bookmarkMap.set(bookmark.commissionId, true));

    return bookmarkMap;
  }

  /**
   * 카테고리 존재 여부 확인
   */
  static async categoryExists(categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    return !!category;
  }

  /**
   * 커미션 썸네일 이미지 조회
   */
  static async getCommissionThumbnails(commissionIds) {
    const images = await prisma.image.findMany({
      where: {
        target: 'commission',
        targetId: { in: commissionIds },
        orderIndex: 0
      },
      select: {
        targetId: true,
        imageUrl: true
      }
    });

    const thumbnailMap = new Map();
    images.forEach(image => {
      thumbnailMap.set(image.targetId, image.imageUrl);
    });

    return thumbnailMap;
  }

  /**
   * 태그 5개를 랜덤으로 조회
   */
  static async getRandomTags(limit = 6) {
    return await prisma.$queryRawUnsafe(`SELECT id, name FROM tags ORDER BY RAND() LIMIT ${limit}`);
  }
}