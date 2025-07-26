export class CreatePaymentDto {
  constructor({ impUid, merchantUid, productId, userId }) {
    this.impUid = impUid;
    this.merchantUid = merchantUid;
    this.productId = productId;
    this.userId = userId;
  }
}