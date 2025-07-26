import express from 'express';
import notificationController from './controller/notification.controller.js';
import pushController from './fcm/controller/push.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * 알림 목록 조회 API
 * GET /api/notifications
 */
router.get('/',
    authenticate,
    notificationController.getNotifications
);

/**
 * 개별 알림 읽음 처리 API
 * PATCH /api/notifications/:notificationId/read
 */
router.patch('/:notificationId/read',
    authenticate,
    notificationController.markNotificationAsRead
);

/**
 * 모든 알림 읽음 처리 API
 * PATCH /api/notifications/read-all
 */
router.patch('/read-all',
    authenticate,
    notificationController.markAllNotificationsAsRead
);

/**
 * 선택 알림 삭제 API
 * DELETE /api/notifications/bulk
 */
router.delete('/bulk',
    authenticate,
    notificationController.deleteNotificationsByIds
);

/**
 * 전체 알림 삭제 API
 * DELETE /api/notifications/all
 */
router.delete('/all',
    authenticate,
    notificationController.deleteAllNotifications
);

/**
 * 알림 생성 API (개발 테스트용)
 * POST /api/notifications/create
 * 
 * 로컬 테스트 환경에서는 주석 처리 해제 후 사용
 * 
 * TODO: 테스트 후에는 반드시 주석 처리
 *       추후 불필요해지면 삭제 예정
 * 
 */
// router.post('/create',
//     authenticate,
//     notificationController.createNotification
// );

/**
 * FCM 토큰 등록 API
 * POST /api/notifications/fcm/token
 */
router.post('/fcm/token',
    authenticate,
    pushController.registerPushToken
);

/**
 * FCM 토큰 삭제 API
 * DELETE /api/notifications/fcm/token
 */
router.delete('/fcm/token',
    authenticate,
    pushController.deletePushToken
);

/**
 * 테스트 Push 알림 발송 API (개발 테스트용)
 * POST /api/notifications/fcm/test
 * 
 * 로컬 테스트 환경에서는 주석 처리 해제 후 사용
 * 
 * TODO: 테스트 후에는 반드시 주석 처리
 *       추후 불필요해지면 삭제 예정
 */
// router.post('/fcm/test',
//     authenticate,
//     pushController.sendTestPush
// );

export default router;