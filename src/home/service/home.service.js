import { HomeRepository } from "../repository/home.repository.js";

export const HomeService = {

  /**
   * 홈화면 데이터 조회
   */
  async getHomeData(userId) {
    const limit = 6;

    // 사용자 선호 카테고리 조회
    const categoryIds = await HomeRepository.findUserCategories(userId);

    // 각 섹션별 데이터 조회
    const [
      section1Data,
      section2Data, 
      section3Data,
      section4Data,
      newReviews,
      newArtists
    ] = await Promise.all([
      HomeRepository.findRecommendedCommissions(userId, categoryIds, limit),
      HomeRepository.findNewCommissions(userId, categoryIds, limit),
      HomeRepository.findPopularCommissions(userId, categoryIds, limit),
      HomeRepository.findDeadlineCommissions(userId, categoryIds, limit),
      HomeRepository.findNewReviews(limit),
      HomeRepository.findNewArtists(limit)
    ]);

    // 커미션 섹션들의 썸네일 이미지 조회
    const allCommissions = [...section1Data, ...section2Data, ...section3Data, ...section4Data];
    const commissionIds = allCommissions.map(commission => commission.id);
    const thumbnailImages = await HomeRepository.findThumbnailImagesByCommissionIds(commissionIds);

    // 최신 리뷰 섹션의 썸네일 이미지 조회
    const reviewIds = newReviews.map(review => review.id);
    const reviewImages = await HomeRepository.findReviewImagesByReviewIds(reviewIds);

    // 커미션 썸네일 이미지 매핑
    const thumbnailMap = {};
    thumbnailImages.forEach(image => {
      thumbnailMap[image.targetId.toString()] = image.imageUrl;
    });

    // 리뷰 썸네일 이미지 매핑
    const reviewImageMap = {};
    reviewImages.forEach(image => {
      reviewImageMap[image.targetId.toString()] = image.imageUrl;
    });

    // 작업기간 계산
    const calculateDuration = (inProgressAt, completedAt) => {
      if (!inProgressAt || !completedAt) return null;
      
      const diffMs = new Date(completedAt) - new Date(inProgressAt);
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays >= 1) { // 1일을 분기로 표기 변경
        return `${diffDays}일`;
      } else {
        return `${diffHours}시간`;
      }
    };

    // 커미션 데이터 변환
    const transformCommission = (commission) => ({
      id: commission.id,
      title: commission.title,
      category: commission.category.name,
      tags: commission.commissionTags.map(ct => ct.tag.name),
      thumbnailImageUrl: thumbnailMap[commission.id.toString()] || null,
      isBookmarked: commission.bookmarks?.length > 0 || false,
      artist: {
        id: commission.artist.id,
        nickname: commission.artist.nickname,
        profileImageUrl: commission.artist.profileImage
      }
    });

    // 응답 데이터
    return {
      section1: section1Data.map(transformCommission),
      section2: section2Data.map(transformCommission), 
      section3: section3Data.map(transformCommission),
      section4: section4Data.map(transformCommission),
      newReview: newReviews.map(review => ({
        id: review.id,
        rate: review.rate,
        content: review.content,
        duration: calculateDuration(
          review.request.inProgressAt, 
          review.request.completedAt
        ),
        reviewImageUrl: reviewImageMap[review.id.toString()] || null,
        user: {
          id: review.user.id,
          nickname: review.user.nickname,
          profileImageUrl: review.user.profileImage
        },
        commission: {
          id: review.request.commission.id,
          title: review.request.commission.title
        }
      })),
      newArtist: newArtists.map(artist => ({
        id: artist.id,
        nickname: artist.nickname,
        profileImageUrl: artist.profileImage
      }))
    };
  },

  /**
   * 팔로잉 작가 커미션 조회
   */
  async getFollowingCommissions(userId, dto) {
    const { offset, limit, page } = dto;

    // 팔로잉 작가 커미션 목록 조회
    const commissions = await HomeRepository.findFollowingCommissions(userId, offset, limit);
    
    // 총 개수 조회
    const totalCount = await HomeRepository.countFollowingCommissions(userId);
    
    // 커미션 ID 목록으로 이미지 조회
    const commissionIds = commissions.map(commission => commission.id);
    const images = await HomeRepository.findImagesByCommissionIds(commissionIds);
    
    // 이미지를 커미션별로 그룹화
    const imagesByCommissionId = images.reduce((acc, image) => {
      const commissionId = image.targetId.toString();
      if (!acc[commissionId]) acc[commissionId] = [];
      acc[commissionId].push({
        id: image.id,
        imageUrl: image.imageUrl,
        orderIndex: image.orderIndex
      });
      return acc;
    }, {});

    // timeago 계산 (KST 기준)
    const calculateTimeAgo = (createdAt) => {
      const now = new Date();
      const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
      const kstCreatedAt = new Date(new Date(createdAt).getTime() + (9 * 60 * 60 * 1000));
      
      const diffMs = kstNow - kstCreatedAt;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30);

      if (diffMinutes < 1) {
        return "방금";
      } else if (diffMinutes < 60) {
        return `${diffMinutes}분 전`;
      } else if (diffHours < 24) {
        return `${diffHours}시간 전`;
      } else if (diffDays < 30) {
        return `${diffDays}일 전`;
      } else {
        return `${diffMonths}달 전`;
      }
    };

    // 응답 데이터
    const items = commissions.map(commission => ({
      id: commission.id,
      title: commission.title,
      summary: commission.summary,
      images: imagesByCommissionId[commission.id.toString()] || [],
      timeAgo: calculateTimeAgo(commission.createdAt),
      createdAt: commission.createdAt.toISOString(),
      isBookmarked: commission.bookmarks?.length > 0 || false,
      artist: {
        id: commission.artist.id,
        nickname: commission.artist.nickname,
        profileImageUrl: commission.artist.profileImage,
        followCount: commission.artist._count.follows
      }
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    };
  },
};
