import { prisma } from "../../db.config.js";

export const PointRepository = {
  async getUserPoint(userId) {
    let point = await prisma.point.findUnique({
      where: { userId: BigInt(userId) },
    });

    if (!point) {
      point = await prisma.point.create({
        data: { userId: BigInt(userId), amount: 0 },
      });
    }
    return point;
  },

  async updateUserPoint({ userId, amount }) {
    return await prisma.point.update({
      where: { userId: BigInt(userId) },
      data: { amount },
    });
  },

  async createPointTransaction(data) {
    return await prisma.pointTransaction.create({
      data: {
        userId: BigInt(data.userId),
        paymentId: data.paymentId ? BigInt(data.paymentId) : null,
        requestId: data.requestId ? BigInt(data.requestId) : null,
        status: data.status,
        amount: data.amount,
        balance: data.balance,
      },
    });
  },

  async updateTransactionBalance(paymentId, balance) {
    return await prisma.pointTransaction.updateMany({
      where: { paymentId: BigInt(paymentId) },
      data: { balance },
    });
  },

  async getAllProducts() {
    return await prisma.product.findMany();
  },
};