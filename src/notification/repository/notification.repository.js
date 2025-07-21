import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class NotificationRepository {

    /**
     * 특정 사용자의 알림 목록 조회 (페이지네이션)
     * @param {BigInt} userId - 사용자 ID
     * @param {number} page - 페이지 번호 (1부터 시작)
     * @param {number} limit - 페이지당 항목 수 (기본값: 20개)
     * @returns {Object} { items: 알림 목록, total: 전체 개수 }
     */
    async findNotificationsByUserId(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;

        // 알림 목록 조회 (최신순)
        const notifications = await prisma.notification.findMany({
            where: { userId: BigInt(userId) },
            orderBy: { createdAt: 'desc' },  // 최신순 정렬
            skip: offset,
            take: limit
        });

        // 전체 개수 조회 (페이지네이션 정보 계산용)
        const total = await prisma.notification.count({
            where: { userId: BigInt(userId) }
        });

        return { items: notifications, total };
    }

    /**
     * 알림 ID로 특정 알림 조회 (읽음 처리용)
     * @param {BigInt} notificationId - 알림 ID
     * @returns {Object|null} 알림 정보 또는 null
     */
    async findNotificationById(notificationId) {
        return await prisma.notification.findUnique({
            where: { id: BigInt(notificationId) },
            include: {
                user: {
                    select: {
                        id: true,
                        nickname: true
                    }
                }
            }
        });
    }

    /**
     * 개별 알림 읽음 처리
     * @param {BigInt} notificationId - 알림 ID
     * @returns {Object} 업데이트된 알림 정보
     */
    async markNotificationAsRead(notificationId) {
        return await prisma.notification.update({
            where: { id: BigInt(notificationId) },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });
    }

    /**
     * 사용자가 읽지 않은 알림을 모두 읽음 처리함
     * @param {BigInt} userId - 사용자 ID
     * @returns {Object} 업데이트된 알림 개수 정보
     */
    async markAllNotificationsAsRead(userId) {
        return await prisma.notification.updateMany({
            where: {
                userId: BigInt(userId),
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });
    }

    /**
     * 선택한 알림들 삭제 (배열로 받은 ID들)
     * @param {Array<BigInt>} notificationIds - 삭제할 알림 ID 배열
     * @param {BigInt} userId - 사용자 ID
     * @returns {Object} 삭제된 알림 개수 정보
     */
    async deleteNotificationsByIds(notificationIds, userId) {
        const bigIntIds = notificationIds.map(id => BigInt(id));

        return await prisma.notification.deleteMany({
            where: {
                id: { in: bigIntIds },
                userId: BigInt(userId)  // 본인의 알림만 삭제 가능
            }
        });
    }

    /**
     * 사용자의 모든 알림 삭제
     * @param {BigInt} userId - 사용자 ID
     * @returns {Object} 삭제된 알림 개수 정보
     */
    async deleteAllNotificationsByUserId(userId) {
        return await prisma.notification.deleteMany({
            where: { userId: BigInt(userId) }
        });
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
                nickname: true
            }
        });
    }

    /**
     * 알림 생성 (추후 알림 발송 로직에서 사용됨)
     * @param {Object} notificationData - 알림 데이터
     * @returns {Object} 생성된 알림 정보
     */
    async createNotification(notificationData) {
        return await prisma.notification.create({
            data: {
                userId: BigInt(notificationData.userId),
                title: notificationData.title,
                content: notificationData.content,
                type: notificationData.type,
                relatedData: notificationData.relatedData || {}
            }
        });
    }

}

export default new NotificationRepository();