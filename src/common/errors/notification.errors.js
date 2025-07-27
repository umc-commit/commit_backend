import { BaseError } from './BaseError.js';

export class NotificationNotFoundError extends BaseError {
    constructor(data = null) {
        super({
            errorCode: "N001",
            reason: "알림을 찾을 수 없습니다",
            statusCode: 404,
            data
        });
    }
}

export class NotificationPermissionDeniedError extends BaseError {
    constructor(data = null) {
        super({
            errorCode: "N002",
            reason: "알림에 접근할 권한이 없습니다",
            statusCode: 403,
            data
        });
    }
}

export class AlreadyReadNotificationError extends BaseError {
    constructor(data = null) {
        super({
            errorCode: "N003",
            reason: "이미 읽은 알림입니다",
            statusCode: 400,
            data
        });
    }
}

export class NotificationSendFailedError extends BaseError {
    constructor(data = null) {
        super({
            errorCode: "N004",
            reason: "알림 발송에 실패했습니다",
            statusCode: 500,
            data
        });
    }
}

export class NoUnreadNotificationsError extends BaseError {
    constructor(data = null) {
        super({
            errorCode: "N005",
            reason: "읽지 않은 알림이 없습니다",
            statusCode: 400,
            data
        });
    }
}

export class NoNotificationsToDeleteError extends BaseError {
    constructor(data = null) {
        super({
            errorCode: "N006",
            reason: "삭제할 알림이 없습니다",
            statusCode: 400,
            data
        });
    }
}

export class NoNotificationsSelectedError extends BaseError {
    constructor(data = null) {
        super({
            errorCode: "N007",
            reason: "삭제할 알림을 선택해주세요",
            statusCode: 400,
            data
        });
    }
}

// 특정 사용자의 FCM 토큰을 찾는데 없는 경우
export class PushTokenNotFoundError extends BaseError {
    constructor(data = null) {
        super({
            errorCode: "N008",
            reason: "등록된 FCM 토큰이 없습니다",
            statusCode: 404,
            data
        });
    }
}

export class PushTokenInvalidError extends BaseError {
    constructor(data = null) {
        super({
            errorCode: "N009",
            reason: "FCM 토큰이 비어있거나 유효하지 않습니다",
            statusCode: 400,
            data
        });
    }
}

export class FCMSendFailedError extends BaseError {
    constructor(data = null) {
        super({
            errorCode: "N010",
            reason: "FCM Push 알림 발송에 실패했습니다",
            statusCode: 500,
            data
        });
    }
}

export class PushTokenAlreadyExistsError extends BaseError {
    constructor(data = null) {
        super({
            errorCode: "N011",
            reason: "이미 등록된 FCM 토큰입니다",
            statusCode: 409,
            data
        });
    }
}