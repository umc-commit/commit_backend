export class CreateChatroomDto {
  constructor({ consumerId, artistId, requestId }) {
    this.consumerId = consumerId;
    this.artistId = artistId;
    this.requestId = requestId;
  }
}

export class ShowChatroomDto {
    constructor({ consumerId }) {
        this.consumerId = consumerId;
    }
}

export class DeleteChatroomDto {
    constructor({ chatroomIds, userType }) {
        this.chatroomIds = chatroomIds.map(id => BigInt(id));
        this.userType = userType;
    }
}