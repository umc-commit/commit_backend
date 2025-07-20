// 알림 목록 조회용 - 개별 알림 아이템 DTO
export class NotificationListItemDto {
    constructor(notificationData) {
        this.id = notificationData.id;
        this.user_id = notificationData.userId;
        this.title = notificationData.title;
        this.content = notificationData.content;
        this.created_at = this._toKST(notificationData.createdAt);
        this.is_read = notificationData.isRead;
        this.type = notificationData.type;
        this.related_data = notificationData.relatedData || {};
    }

    // UTC를 KST로 변환하는 헬퍼 메서드
    _toKST(utcDate) {
        if (!utcDate) return null;

        const kstDate = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000)); // UTC + 9시간
        return kstDate.toISOString().replace('Z', '+09:00'); // Z(UTC) -> +09:00(KST)
    }
}

// 페이지네이션 정보 DTO
export class PaginationDto {
    constructor(page, limit, total) {
        this.page = parseInt(page);
        this.limit = parseInt(limit);
        this.total = parseInt(total);
        this.totalPages = Math.ceil(total / limit);
    }
}

// 알림 목록 조회 응답 DTO
export class NotificationListResponseDto {
    constructor(items, pagination) {
        this.items = items.map(item => new NotificationListItemDto(item));
        this.pagination = pagination;
    }
}

// 개별 알림 읽음 처리 응답 DTO
export class NotificationReadResponseDto {
    constructor(notificationData) {
        this.id = notificationData.id;
        this.is_read = notificationData.isRead;
        this.read_at = this._toKST(notificationData.readAt);
    }

    // UTC를 KST로 변환하는 헬퍼 메서드
    _toKST(utcDate) {
        if (!utcDate) return null;

        const kstDate = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000)); // UTC + 9시간
        return kstDate.toISOString().replace('Z', '+09:00'); // Z(UTC) -> +09:00(KST)
    }
}

// 알림 삭제 응답 DTO
export class NotificationDeleteResponseDto {
    constructor(deletedCount, message) {
        this.deleted_count = deletedCount;
        this.message = message;
    }
}