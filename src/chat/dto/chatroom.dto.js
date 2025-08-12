export class CreateChatroomDto {
  constructor({ consumerId, artistId, requestId }) {
    this.consumerId = consumerId;
    this.artistId = artistId;
    this.requestId = requestId;
  }
}

export class GetChatroomDto {
    constructor({ consumerId, accountId }) {
        this.consumerId = BigInt(consumerId);
        this.accountId = BigInt(accountId);
    }
}

export class ChatroomListResponseDto {
  constructor(room, unreadCount = 0) {
    this.chatroom_id = room.id;
    this.artist_id = room.artist.id;
    this.artist_nickname = room.artist.nickname;
    this.artist_profile_image = room.artist.profileImage;
    this.request_id = room.request.id;
    this.request_title = room.request.commission.title;
    // 이미지가 있으면 이미지 URL, 없으면 텍스트 content
    const lastMsg = room.chatMessages[0];
    this.last_message = lastMsg?.imageUrl || lastMsg?.content || null;
    this.last_message_time = room.chatMessages[0]?.createdAt || null;
    this.has_unread = unreadCount;
  }
}

export class DeleteChatroomDto {
  constructor({ chatroomIds, userType, userId }) {
    this.chatroomIds = chatroomIds.map(id => BigInt(id));
    this.userType = userType;
    this.userId = BigInt(userId);
  }
}