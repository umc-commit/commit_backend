import { StatusCodes } from "http-status-codes";
import { stringifyWithBigInt } from "../../../bigintJson.js";
import {
    PushTokenDeleteResponseDto,
    PushTokenRegisterDto,
    PushTokenResponseDto,
    TestPushRequestDto,
    PushSendResponseDto
} from '../dto/push.dto.js';
import pushService from '../service/push.service.js';

class PushController {

    /**
     * FCM 토큰 등록 API
     */
    async registerPushToken(req, res, next) {
        try {
            // 현재 로그인한 사용자 ID
            const userId = BigInt(req.user.id);

            // 요청 본문 데이터를 DTO로 구조화
            const tokenDto = new PushTokenRegisterDto(req.body);

            // FCM 토큰 등록 서비스 호출
            const result = await pushService.registerPushToken(userId, tokenDto.fcm_token);

            // 등록된 토큰을 응답용 DTO로 가공
            const responseData = new PushTokenResponseDto(result);
            // BigInt를 JSON 문자열로 변환 후 다시 파싱하여 일반 객체로 변환
            const finalData = JSON.parse(stringifyWithBigInt(responseData));

            // 클라이언트에 응답 전송 (201 Created)
            res.status(StatusCodes.CREATED).json({
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
     * FCM 토큰 삭제 API
     */
    async deletePushToken(req, res, next) {
        try {
            // 현재 로그인한 사용자 ID
            const userId = BigInt(req.user.id);

            // FCM 토큰 삭제 서비스 호출
            const result = await pushService.deletePushToken(userId);

            // 삭제 결과를 응답용 DTO로 가공
            const responseData = new PushTokenDeleteResponseDto(result.message);

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
     * 테스트 Push 알림 발송 API (개발 테스트용)
     */
    async sendTestPush(req, res, next) {
        try {
            // 요청 본문 데이터를 DTO로 구조화
            const testPushDto = new TestPushRequestDto(req.body);

            // 대상 사용자 ID 추출
            const targetUserId = BigInt(testPushDto.target_user_id);

            // 테스트 Push 발송 서비스 호출
            const result = await pushService.sendTestPush(
                testPushDto.title,
                testPushDto.body,
                targetUserId,
                testPushDto.data
            );

            // 발송 결과를 응답용 DTO로 가공
            const responseData = new PushSendResponseDto(result);

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

}

export default new PushController();