export class TransferPointDto {
  constructor({ requestId, amount, userId }) {
    if (requestId === undefined || amount === undefined || userId === undefined) {
      throw new Error("Invalid DTO: requestId, amount, and userId are required");
    }
    this.requestId = requestId;
    this.amount = amount;
    this.userId = userId;
  }
}