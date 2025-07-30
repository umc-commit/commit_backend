export class CreateChatroomDto {
  constructor({ consumerId, artistId, requestId }) {
    this.consumerId = consumerId;
    this.artistId = artistId;
    this.requestId = requestId;
  }
}

export class GetChatroomDto {
    constructor({ consumerId }) {
        this.consumerId = BigInt(consumerId);
    }
}

export class DeleteChatroomDto {
  constructor({ chatroomIds, userType, userId }) {
    this.chatroomIds = chatroomIds.map(id => BigInt(id));
    this.userType = userType;
    this.userId = BigInt(userId);
  }
}