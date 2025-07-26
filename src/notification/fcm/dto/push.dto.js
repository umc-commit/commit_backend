// FCM 토큰 등록 요청 DTO
export class PushTokenRegisterDto {
    constructor(data) {
        this.fcm_token = data.fcm_token;  // FCM 토큰
    }
}

// FCM 토큰 응답 DTO
export class PushTokenResponseDto {
    constructor(tokenData) {
        this.id = tokenData.id;
        this.user_id = tokenData.userId;
        this.fcm_token = tokenData.fcmToken;
        this.is_active = tokenData.isActive;
        this.created_at = this._toKST(tokenData.createdAt);
        this.updated_at = this._toKST(tokenData.updatedAt);
    }

    // UTC를 KST로 변환하는 헬퍼 메서드
    _toKST(utcDate) {
        if (!utcDate) return null;

        const kstDate = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000)); // UTC + 9시간
        return kstDate.toISOString().replace('Z', '+09:00'); // Z(UTC) -> +09:00(KST)
    }
}

// 테스트 Push 알림 발송 요청 DTO
export class TestPushRequestDto {
    constructor(data) {
        this.title = data.title || '테스트 알림';
        this.body = data.body || '테스트 Push 알림입니다.';
        this.target_user_id = data.target_user_id;  // 특정 사용자에게 발송
        this.data = data.data || {};  // 추가 데이터
    }
}

// Push 알림 발송 응답 DTO
export class PushSendResponseDto {
    constructor(result) {
        this.success_count = result.successCount || 0;
        this.failure_count = result.failureCount || 0;
        this.sent_tokens = result.sentTokens || [];
        this.failed_tokens = result.failedTokens || [];
        this.message = result.message;
    }
}

// Push 알림 발송용 내부 DTO
export class PushMessageDto {
    constructor(data) {
        this.title = data.title;
        this.body = data.body;
        this.tokens = data.tokens || [];  // FCM 토큰 배열
        this.data = data.data || {};      // 커스텀 데이터
        this.clickAction = data.clickAction || null;  // 클릭 시 이동할 화면
    }
}

// Push 알림 토큰 삭제 응답 DTO
export class PushTokenDeleteResponseDto {
    constructor(message) {
        this.message = message;
    }
}