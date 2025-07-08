export class CreateChatroomDto {
  constructor({ consumerId, artistId, requestId }) {
    this.consumerId = consumerId;
    this.artistId = artistId;
    this.requestId = requestId;
  }
}