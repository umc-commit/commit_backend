export class GetMessagesDto {
  constructor({ chatroomId, limit, cursor, userId }) {
    this.chatroomId = chatroomId;
    this.limit = limit ? Number(limit) : 20;
    this.cursor = cursor ? BigInt(cursor) : null;
    this.userId = BigInt(userId);
  }
}

export class FindChatroomByMessageDto {
  constructor(query) {
    this.keyword = query.keyword;
  }
}