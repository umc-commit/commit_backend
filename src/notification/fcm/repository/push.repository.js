import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class PushRepository {

    /**
     * FCM 토큰 등록/업데이트 (기존 토큰이 있으면 새 토큰으로 교체)
     * @param {BigInt} userId - 사용자 ID
     * @param {string} fcmToken - FCM 토큰
     * @returns {Object} 등록된 토큰 정보
     */
    async upsertPushToken(userId, fcmToken) {
        return await prisma.pushToken.upsert({
            where: {
                userId: BigInt(userId)
            },
            update: {
                fcmToken: fcmToken,
                isActive: true,
                updatedAt: new Date()
            },
            create: {
                userId: BigInt(userId),
                fcmToken: fcmToken,
                isActive: true
            }
        });
    }

    /**
     * 사용자의 FCM 토큰을 조회함
     * @param {BigInt} userId - 사용자 ID
     * @returns {Object|null} 토큰 정보 또는 null
     */
    async findPushTokenByUserId(userId) {
        return await prisma.pushToken.findUnique({
            where: {
                userId: BigInt(userId)
            }
        });
    }

    /**
     * 사용자의 FCM 토큰을 삭제함
     * @param {BigInt} userId - 사용자 ID
     * @returns {Object} 삭제된 토큰 정보
     */
    async deletePushTokenByUserId(userId) {
        return await prisma.pushToken.delete({
            where: {
                userId: BigInt(userId)
            }
        });
    }

    /**
     * 모든 활성 FCM 토큰을 조회함 (전체 사용자에게 발송할 때 사용)
     * @returns {Array} 활성 토큰 목록
     */
    async findAllActivePushTokens() {
        return await prisma.pushToken.findMany({
            where: {
                isActive: true
            },
            select: {
                fcmToken: true,
                userId: true
            }
        });
    }

    /**
     * 특정 사용자들의 활성 FCM 토큰을 조회함 (특정 사용자들에게만 발송할 때 사용)
     * @param {Array<BigInt>} userIds - 사용자 ID 배열
     * @returns {Array} 해당 사용자들의 토큰 목록
     */
    async findPushTokensByUserIds(userIds) {
        const bigIntIds = userIds.map(id => BigInt(id));

        return await prisma.pushToken.findMany({
            where: {
                userId: { in: bigIntIds },
                isActive: true
            },
            select: {
                fcmToken: true,
                userId: true
            }
        });
    }

}

export default new PushRepository();