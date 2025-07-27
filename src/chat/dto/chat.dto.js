export class ShowMessagesDto {
  constructor({ chatroomId, limit, cursor }) {
    this.chatroomId = chatroomId;
    this.limit = limit ? Number(limit) : 20;
    this.cursor = cursor ? BigInt(cursor) : null;
  }
}

export class FindChatroomByMessageDto {
  constructor(query) {
    this.keyword = query.keyword;
  }
}