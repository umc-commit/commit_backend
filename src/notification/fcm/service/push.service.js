import { messaging } from '../../../../config/firebase.js';
import notificationRepository from '../../repository/notification.repository.js';
import pushRepository from '../repository/push.repository.js';

import {
    FCMSendFailedError,
    PushTokenInvalidError,
    PushTokenNotFoundError
} from '../../../common/errors/notification.errors.js';
import { UserNotFoundError } from '../../../common/errors/user.errors.js';

class PushService {

    /**
     * FCM 토큰 등록
     */
    async registerPushToken(userId, fcmToken) {
        // 사용자 존재 여부 확인
        const user = await notificationRepository.findUserById(userId);
        if (!user) {
            throw new UserNotFoundError({ userId: userId.toString() });
        }

        // FCM 토큰 유효성 검증
        if (!fcmToken || fcmToken.trim().length === 0) {
            throw new PushTokenInvalidError({ fcmToken });
        }

        // FCM 토큰 등록/업데이트 (기존 토큰이 있으면 새 토큰으로 교체)
        const tokenData = await pushRepository.upsertPushToken(userId, fcmToken);

        return tokenData;
    }

    /**
     * FCM 토큰 삭제
     */
    async deletePushToken(userId) {
        // 사용자 존재 여부 확인
        const user = await notificationRepository.findUserById(userId);
        if (!user) {
            throw new UserNotFoundError({ userId: userId.toString() });
        }

        // 기존 토큰 존재 여부 확인
        const existingToken = await pushRepository.findPushTokenByUserId(userId);
        if (!existingToken) {
            throw new PushTokenNotFoundError({ userId: userId.toString() });
        }

        // FCM 토큰 삭제
        await pushRepository.deletePushTokenByUserId(userId);

        return {
            message: 'FCM 토큰이 성공적으로 삭제되었습니다.'
        };
    }

    /**
     * 테스트 Push 알림 발송
     */
    async sendTestPush(title, body, targetUserId, data = {}) {
        // 알림을 보낼 대상 사용자 존재 확인
        const user = await notificationRepository.findUserById(targetUserId);
        if (!user) {
            throw new UserNotFoundError({ userId: targetUserId.toString() });
        }

        // 해당 사용자의 FCM 토큰 조회
        const tokenData = await pushRepository.findPushTokenByUserId(targetUserId);
        if (!tokenData) {
            throw new PushTokenNotFoundError({ userId: targetUserId.toString() });
        }

        // FCM 메시지 구성
        const tokens = [tokenData.fcmToken];
        const message = {
            notification: {
                title: title,
                body: body
            },
            data: {
                ...data,
                timestamp: new Date().toISOString()
            },
            tokens: tokens
        };

        // Firebase FCM Push 발송
        try {
            const response = await messaging.sendEachForMulticast(message);

            const result = {
                successCount: response.successCount,
                failureCount: response.failureCount,
                sentTokens: [],
                failedTokens: [],
                message: `${response.successCount}개 성공, ${response.failureCount}개 실패`
            };

            // 발송 결과 분석
            response.responses.forEach((resp, idx) => {
                if (resp.success) {
                    result.sentTokens.push(tokens[idx]);
                } else {
                    result.failedTokens.push({
                        token: tokens[idx],
                        error: resp.error?.message || 'Unknown error'
                    });
                }
            });

            return result;

        } catch (error) {
            console.error('FCM 발송 실패:', error);
            throw new FCMSendFailedError({ originalError: error.message });
        }
    }

    /**
     * 알림 타입별 Push 발송 (다른 서비스에서 호출하는 공통 메서드)
     */
    async sendPushToUsers(userIds, title, body, data = {}) {
        // 대상 사용자들의 FCM 토큰 조회
        const tokenData = await pushRepository.findPushTokensByUserIds(userIds);

        // Push 알림을 받을 수 있는 사용자가 없는 경우
        if (tokenData.length === 0) {
            console.log('FCM 토큰이 등록되지 않은 사용자들입니다. 대상 사용자:', userIds.map(id => id.toString()));
            return {
                successCount: 0,
                failureCount: 0,
                sentTokens: [],
                failedTokens: [],
                message: 'Push 알림을 받을 수 있는 사용자가 없습니다.'
            };
        }

        // FCM 메시지 구성
        const tokens = tokenData.map(token => token.fcmToken);
        const message = {
            notification: {
                title: title,
                body: body
            },
            data: {
                ...data,
                timestamp: new Date().toISOString()
            },
            tokens: tokens
        };

        // Firebase FCM Push 발송
        try {
            const response = await messaging.sendEachForMulticast(message);

            const result = {
                successCount: response.successCount,
                failureCount: response.failureCount,
                sentTokens: [],
                failedTokens: [],
                message: `${response.successCount}개 성공, ${response.failureCount}개 실패`
            };

            // 발송 결과 분석
            response.responses.forEach((resp, idx) => {
                if (resp.success) {
                    result.sentTokens.push(tokens[idx]);
                } else {
                    result.failedTokens.push({
                        token: tokens[idx],
                        error: resp.error?.message || 'Unknown error'
                    });
                }
            });

            return result;

        } catch (error) {
            console.error('FCM 발송 실패:', error);
            throw new FCMSendFailedError({ originalError: error.message });
        }
    }

}

export default new PushService();