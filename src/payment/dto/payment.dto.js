export class CreatePaymentDto {
  constructor({ impUid, merchantUid, productId, userId, requestId }) {
    this.impUid = impUid;
    this.merchantUid = merchantUid;
    this.productId = productId;
    this.userId = userId;
  }
}