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
        userId: BigInt(data.userId),
        productId: BigInt(data.productId),
        price: data.price,
        pointAmount: data.pointAmount,
        status: data.status,
        impUid: data.impUid,
        merchantUid: data.merchantUid,
        pgProvider: data.pgProvider,
      },
    });
  },

  async getPaymentByImpUid(impUid) {
    return await prisma.payment.findUnique({
      where: { impUid },
    });
  },

  async getPayments(userId) {
    return await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } 
};