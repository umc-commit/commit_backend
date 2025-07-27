import { PrismaClient } from '@prisma/client';
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

    /**
     * 리뷰 작성 시 Request 정보 조회
     * @param {number} requestId - Request ID
     * @returns {Object} Request 정보
     */
    async findRequestByIdForReview(requestId) {
        return await prisma.request.findUnique({
            where: { id: BigInt(requestId) },
            include: {
                user: {
                    select: {
                        id: true,
                        nickname: true,
                        profileImage: true
                    }
                },
                commission: {
                    include: {
                        artist: {
                            select: {
                                id: true,
                                nickname: true,
                                profileImage: true
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Request ID로 리뷰 조회 (중복 리뷰 방지용)
     * @param {number} requestId - Request ID
     * @returns {Object|null} 리뷰 정보 또는 null
     */
    async findReviewByRequestId(requestId) {
        return await prisma.review.findFirst({
            where: { requestId: BigInt(requestId) }
        });
    }

    /**
     * 리뷰 생성
     * @param {Object} reviewData - 리뷰 데이터
     * @returns {Object} 생성된 리뷰 정보
     */
    async createReview(reviewData) {
        return await prisma.review.create({
            data: {
                userId: BigInt(reviewData.userId),
                requestId: BigInt(reviewData.requestId),
                rate: reviewData.rate,
                content: reviewData.content
            }
        });
    }

    /**
     * 리뷰 ID로 리뷰 조회 (권한 확인 및 수정/삭제용)
     * @param {BigInt} reviewId - 리뷰 ID
     * @returns {Object|null} 리뷰 정보 또는 null
     */
    async findReviewById(reviewId) {
        return await prisma.review.findUnique({
            where: { id: reviewId },
            include: {
                user: {
                    select: {
                        id: true,
                        nickname: true,
                        profileImage: true
                    }
                },
                request: {
                    select: {
                        id: true,
                        userId: true,
                        status: true,
                        commission: {
                            select: {
                                title: true,
                                artist: {
                                    select: {
                                        id: true,
                                        nickname: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * 리뷰 수정
     * @param {BigInt} reviewId - 리뷰 ID
     * @param {Object} updateData - 수정할 데이터 { rate, content }
     * @returns {Object} 수정된 리뷰 정보
     */
    async updateReview(reviewId, updateData) {
        return await prisma.review.update({
            where: { id: reviewId },
            data: {
                rate: updateData.rate,
                content: updateData.content
            }
        });
    }

    /**
     * 리뷰 삭제
     * @param {BigInt} reviewId - 리뷰 ID
     * @returns {Object} 삭제된 리뷰 정보
     */
    async deleteReview(reviewId) {
        return await prisma.review.delete({
            where: { id: reviewId }
        });
    }

    /**
     * 리뷰의 모든 이미지 삭제 (리뷰 삭제 시 사용)
     * @param {BigInt} reviewId - 리뷰 ID
     * @returns {Object} 삭제된 이미지 개수 정보
     */
    async deleteAllReviewImages(reviewId) {
        return await prisma.image.deleteMany({
            where: {
                target: 'review',
                targetId: reviewId
            }
        });
    }

    /**
     * 특정 이미지 삭제 (이미지 일부 삭제 시 사용)
     * @param {string} imageUrl - 삭제할 이미지 URL
     * @param {BigInt} reviewId - 리뷰 ID (권한 확인용)
     * @returns {Object} 삭제 결과
     */
    async deleteReviewImage(imageUrl, reviewId) {
        return await prisma.image.deleteMany({
            where: {
                target: 'review',
                targetId: reviewId,
                imageUrl: imageUrl
            }
        });
    }

    /**
     * 리뷰의 기존 이미지 목록 조회 (수정 시 비교용)
     * @param {BigInt} reviewId - 리뷰 ID
     * @returns {Array} 현재 리뷰의 이미지 URL 목록
     */
    async getReviewImages(reviewId) {
        const images = await prisma.image.findMany({
            where: {
                target: 'review',
                targetId: reviewId
            },
            select: {
                imageUrl: true
            },
            orderBy: {
                id: 'asc'
            }
        });

        return images.map(img => img.imageUrl);
    }

    /**
     * 특정 사용자가 작성한 리뷰 목록 조회 (페이지네이션)
     * @param {BigInt} userId - 사용자 ID
     * @param {number} page - 페이지 번호 (1부터 시작)
     * @param {number} limit - 페이지당 항목 수 (기본값: 10개)
     * @returns {Object} { items: 리뷰 목록, total: 전체 개수 }
     */
    async findReviewsByUserId(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        // 리뷰 목록 조회 (관련 데이터 포함)
        const reviews = await prisma.review.findMany({
            where: { userId: BigInt(userId) },
            include: {
                request: {
                    include: {
                        commission: {
                            include: {
                                artist: {
                                    select: {
                                        id: true,
                                        nickname: true,
                                        profileImage: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },  // 최신순 정렬
            skip: offset,
            take: limit
        });

        // 전체 개수 조회
        const total = await prisma.review.count({
            where: { userId: BigInt(userId) }
        });

        return { items: reviews, total };
    }

    /**
     * 사용자 존재 여부 확인 (권한 검증용)
     * @param {BigInt} userId - 사용자 ID
     * @returns {Object|null} 사용자 정보 또는 null
     */
    async findUserById(userId) {
        return await prisma.user.findUnique({
            where: { id: BigInt(userId) },
            select: {
                id: true,
                nickname: true,
                profileImage: true
            }
        });
    }

}

export default new ReviewRepository();