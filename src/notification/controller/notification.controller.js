import { StatusCodes } from "http-status-codes";
import { stringifyWithBigInt } from "../../bigintJson.js";
import {
    NotificationIdRequiredError
} from '../../common/errors/notification.errors.js';
import {
    NotificationDeleteResponseDto,
    NotificationListResponseDto,
    NotificationReadResponseDto
} from '../dto/notification.dto.js';
import notificationService from '../service/notification.service.js';

class NotificationController {

    /**
     * 알림 목록 조회 API
     */
    async getNotifications(req, res, next) {
        try {
            // 현재 로그인한 사용자 ID
            const userId = BigInt(req.user.userId);

            // 쿼리 파라미터에서 페이지네이션 정보 추출
            const page = req.query.page || 1;
            const limit = req.query.limit || 20;

            // 알림 목록 조회 서비스 호출
            const result = await notificationService.getNotificationsByUserId(userId, page, limit);

            // 응답 데이터를 DTO로 구조화
            const responseData = new NotificationListResponseDto(result.items, result.pagination);
            // BigInt를 JSON 문자열로 변환 후 다시 파싱하여 일반 객체로 변환
            const finalData = JSON.parse(stringifyWithBigInt(responseData));

            // 클라이언트에 응답 전송 (200 OK)
            res.status(StatusCodes.OK).json({
                resultType: "SUCCESS",
                error: null,
                success: finalData
            });

        } catch (error) {
            // 에러 발생 시 에러 처리 미들웨어로 넘김
            next(error);
        }
    }

    /**
     * 개별 알림 읽음 처리 API
     */
    async markNotificationAsRead(req, res, next) {
        try {
            // URL 파라미터에서 알림 ID를 추출하고 BigInt로 변환
            if (!req.params.notificationId) {
                throw new NotificationIdRequiredError(); // notificationId가 누락된 경우 NotificationIdRequiredError 반환
            }
            const notificationId = BigInt(req.params.notificationId);

            // 현재 로그인한 사용자 ID
            const userId = BigInt(req.user.userId);

            // 알림 읽음 처리 서비스 호출
            const result = await notificationService.markNotificationAsRead(notificationId, userId);

            // 읽음 처리된 알림을 응답용 DTO로 가공
            const responseData = new NotificationReadResponseDto(result);
            // BigInt를 JSON 문자열로 변환 후 다시 파싱하여 일반 객체로 변환
            const finalData = JSON.parse(stringifyWithBigInt(responseData));

            // 클라이언트에 응답 전송 (200 OK)
            res.status(StatusCodes.OK).json({
                resultType: "SUCCESS",
                error: null,
                success: finalData
            });

        } catch (error) {
            // 에러 발생 시 에러 처리 미들웨어로 넘김
            next(error);
        }
    }

    /**
     * 모든 알림 읽음 처리 API
     */
    async markAllNotificationsAsRead(req, res, next) {
        try {
            // 현재 로그인한 사용자 ID
            const userId = BigInt(req.user.userId);

            // 모든 알림 읽음 처리 서비스 호출
            const result = await notificationService.markAllNotificationsAsRead(userId);

            // 클라이언트에 응답 전송 (200 OK)
            res.status(StatusCodes.OK).json({
                resultType: "SUCCESS",
                error: null,
                success: result
            });

        } catch (error) {
            // 에러 발생 시 에러 처리 미들웨어로 넘김
            next(error);
        }
    }

    /**
     * 선택 알림 삭제 API
     */
    async deleteNotificationsByIds(req, res, next) {
        try {
            // 요청 본문에서 삭제할 알림 ID 배열 추출
            const { notification_ids } = req.body;

            // 현재 로그인한 사용자 ID
            const userId = BigInt(req.user.userId);

            // 선택 알림 삭제 서비스 호출
            const result = await notificationService.deleteNotificationsByIds(notification_ids, userId);

            // 삭제 결과를 응답용 DTO로 가공
            const responseData = new NotificationDeleteResponseDto(result.deleted_count, result.message);

            // 클라이언트에 응답 전송 (200 OK)
            res.status(StatusCodes.OK).json({
                resultType: "SUCCESS",
                error: null,
                success: responseData
            });

        } catch (error) {
            // 에러 발생 시 에러 처리 미들웨어로 넘김
            next(error);
        }
    }

    /**
     * 전체 알림 삭제 API
     */
    async deleteAllNotifications(req, res, next) {
        try {
            // 현재 로그인한 사용자 ID
            const userId = BigInt(req.user.userId);

            // 전체 알림 삭제 서비스 호출
            const result = await notificationService.deleteAllNotifications(userId);

            // 삭제 결과를 응답용 DTO로 가공
            const responseData = new NotificationDeleteResponseDto(result.deleted_count, result.message);

            // 클라이언트에 응답 전송 (200 OK)
            res.status(StatusCodes.OK).json({
                resultType: "SUCCESS",
                error: null,
                success: responseData
            });

        } catch (error) {
            // 에러 발생 시 에러 처리 미들웨어로 넘김
            next(error);
        }
    }

    /**
     * 알림 생성 API (개발 테스트용)
     * 로컬 테스트 환경에서는 주석 처리 해제 후 사용
     * 
     * TODO: 테스트 후에는 반드시 주석 처리
     *       추후 불필요해지면 삭제 예정
     */
    // async createNotification(req, res, next) {
    //     try {
    //         // 요청 본문에서 알림 데이터 추출
    //         const { userId, type, relatedData } = req.body;

    //         // 알림 생성 서비스 호출
    //         const result = await notificationService.createNotification({
    //             userId: BigInt(userId),
    //             type,
    //             relatedData
    //         });

    //         // 생성된 알림을 응답용 DTO로 가공
    //         const responseData = new NotificationListItemDto(result);
    //         const finalData = JSON.parse(stringifyWithBigInt(responseData));

    //         // 클라이언트에 응답 전송 (201 Created)
    //         res.status(StatusCodes.CREATED).json({
    //             resultType: "SUCCESS",
    //             error: null,
    //             success: finalData
    //         });

    //     } catch (error) {
    //         next(error);
    //     }
    // }

}

export default new NotificationController();