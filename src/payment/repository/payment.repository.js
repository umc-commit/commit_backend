import { prisma } from "../../db.config.js";

export const PaymentRepository = {
  async getProductById(productId) {
    return await prisma.product.findUnique({
      where: { id: BigInt(productId) },
    });
  },

  async createPayment(data) {
    return await prisma.payment.create({
      data: {
        requestId: BigInt(data.requestId),
        userId: BigInt(data.userId),
        productId: BigInt(data.productId),
        price: data.price,
        status: data.status,
        impUid: data.impUid,
        merchantUid: data.merchantUid,
        pgProvider: data.pgProvider,
      },
    });
  },
};