import {
    NotificationNotFoundError,
    NotificationPermissionDeniedError,
    NoNotificationsToDeleteError,
    AlreadyReadNotificationError,
    NoUnreadNotificationsError
} from '../../common/errors/notification.errors.js';
import { UserNotFoundError } from '../../common/errors/user.errors.js';

// Repository import
import notificationRepository from '../repository/notification.repository.js';

class NotificationService {

    /**
     * 사용자의 알림 목록 조회
     * 
     * @param {BigInt} userId - 조회할 사용자 ID
     * @param {number} page - 페이지 번호 (기본값: 1)
     * @param {number} limit - 페이지당 항목 수 (기본값: 20)
     * @returns {Object} { items: 알림 목록, pagination: 페이지네이션 정보 }
     */
    async getNotificationsByUserId(userId, page = 1, limit = 20) {
        // 1. 사용자 존재 여부 확인
        const user = await notificationRepository.findUserById(userId);
        if (!user) {
            throw new UserNotFoundError(userId);
        }

        // 2. 입력값 검증 및 보정
        const validatedPage = Math.max(1, parseInt(page) || 1); // 음수나 0이면 1로 보정
        const validatedLimit = Math.min(50, Math.max(1, parseInt(limit) || 20)); // 최대 50개로 제한 (무한스크롤 성능 고려)

        // 3. 해당 사용자의 알림 목록 조회
        const { items: notifications, total } = await notificationRepository.findNotificationsByUserId(
            userId,
            validatedPage,
            validatedLimit
        );

        // 4. 무한 스크롤을 위한 페이지네이션 정보 생성
        const pagination = {
            page: validatedPage,
            limit: validatedLimit,
            total: total,
            totalPages: Math.ceil(total / validatedLimit)
        };

        // 5. Controller로 원본 데이터 반환
        return {
            items: notifications,
            pagination: pagination
        };
    }

    /**
     * 개별 알림 읽음 처리 (사용자가 알림을 클릭해서 해당 화면으로 이동할 때)
     * 
     * @param {BigInt} notificationId - 알림 ID
     * @param {BigInt} userId - 사용자 ID (권한 확인용)
     * @returns {Object} 읽음 처리된 알림 정보
     */
    async markNotificationAsRead(notificationId, userId) {
        // 1. 알림 존재 여부 확인
        const notification = await notificationRepository.findNotificationById(notificationId);
        if (!notification) {
            throw new NotificationNotFoundError(notificationId);
        }

        // 2. 권한 확인 (본인의 알림만 읽음 처리 가능)
        if (notification.userId !== userId) {
            throw new NotificationPermissionDeniedError(userId, notificationId);
        }

        // 3. 이미 읽은 알림인지 확인 (중복 처리 방지)
        if (notification.isRead) {
            throw new AlreadyReadNotificationError(notificationId);
        }

        // 4. 읽음 처리 실행
        const updatedNotification = await notificationRepository.markNotificationAsRead(notificationId);

        // 5. Controller로 반환할 데이터 구성
        return {
            id: updatedNotification.id,
            isRead: updatedNotification.isRead,
            readAt: updatedNotification.readAt
        };
    }

    /**
     * 사용자의 모든 미읽음 알림을 읽음 처리 ('모두 읽음으로 표시' 버튼 클릭 시)
     * 
     * @param {BigInt} userId - 사용자 ID
     * @returns {Object} 읽음 처리된 알림 개수 정보
     */
    async markAllNotificationsAsRead(userId) {
        // 1. 사용자 존재 여부 확인
        const user = await notificationRepository.findUserById(userId);
        if (!user) {
            throw new UserNotFoundError(userId);
        }

        // 2. 모든 미읽음 알림 읽음 처리
        const result = await notificationRepository.markAllNotificationsAsRead(userId);

        // 3. 읽음 처리할 알림이 없었던 경우
        if (result.count === 0) {
            throw new NoUnreadNotificationsError(userId);
        }

        // 4. 성공 응답 반환
        return {
            updated_count: result.count
        };
    }

    /**
     * 선택한 알림들 삭제 ('선택 삭제' 버튼 클릭 시)
     * 
     * @param {Array<BigInt>} notificationIds - 삭제할 알림 ID 배열
     * @param {BigInt} userId - 사용자 ID (권한 확인용)
     * @returns {Object} 삭제 결과 정보
     */
    async deleteNotificationsByIds(notificationIds, userId) {
        // 1. 사용자 존재 여부 확인
        const user = await notificationRepository.findUserById(userId);
        if (!user) {
            throw new UserNotFoundError(userId);
        }

        // 2. 삭제할 알림 ID 배열 검증
        if (!notificationIds || notificationIds.length === 0) {
            throw new NoNotificationsToDeleteError();
        }

        // 3. BigInt 변환 처리
        const bigIntIds = notificationIds.map(id => BigInt(id));

        // 4. 선택한 알림들 삭제 (본인 알림만 삭제됨)
        const result = await notificationRepository.deleteNotificationsByIds(bigIntIds, userId);

        // 5. 삭제된 알림이 없는 경우 (존재하지 않는 ID들)
        if (result.count === 0) {
            throw new NoNotificationsToDeleteError();
        }

        // 6. 성공 응답 반환
        return {
            deleted_count: result.count,
            message: "선택한 알림이 성공적으로 삭제되었습니다."
        };
    }

    /**
     * 사용자의 모든 알림 삭제 ('전체 삭제' 버튼 클릭 시)
     * 
     * @param {BigInt} userId - 사용자 ID
     * @returns {Object} 삭제 결과 정보
     */
    async deleteAllNotifications(userId) {
        // 1. 사용자 존재 여부 확인
        const user = await notificationRepository.findUserById(userId);
        if (!user) {
            throw new UserNotFoundError(userId);
        }

        // 2. 모든 알림 삭제
        const result = await notificationRepository.deleteAllNotificationsByUserId(userId);

        // 3. 삭제할 알림이 없었던 경우
        if (result.count === 0) {
            throw new NoNotificationsToDeleteError();
        }

        // 4. 성공 응답 반환
        return {
            deleted_count: result.count,
            message: "모든 알림이 성공적으로 삭제되었습니다."
        };
    }

    /**
     * 알림 생성 (다른 API에서 호출하는 공통 메서드)
     * 
     * @param {Object} notificationData - 알림 데이터
     * @param {BigInt} notificationData.userId - 대상 사용자 ID
     * @param {string} notificationData.title - 알림 제목
     * @param {string} notificationData.content - 알림 내용
     * @param {string} notificationData.type - 알림 타입
     * @param {Object} notificationData.relatedData - 관련 데이터 (선택)
     * @returns {Object} 생성된 알림 정보
     */
    async createNotification(notificationData) {
        // 1. 필수 필드 검증
        const { userId, title, content, type } = notificationData;

        if (!userId || !title || !content || !type) {
            throw new Error('필수 필드가 누락되었습니다. (userId, title, content, type)');
        }

        // 2. 사용자 존재 여부 확인
        const user = await notificationRepository.findUserById(BigInt(userId));
        if (!user) {
            throw new UserNotFoundError(userId);
        }

        // 3. 알림 생성
        const notification = await notificationRepository.createNotification({
            userId: BigInt(userId),
            title: title.trim(),
            content: content.trim(),
            type: type,
            relatedData: notificationData.relatedData || {}
        });

        // 4. 생성 결과 반환
        return notification;
    }

}

export default new NotificationService();