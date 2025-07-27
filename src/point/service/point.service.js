import { PointRepository } from "../repository/point.repository.js";
import { RequestRepository } from "../../request/repository/request.repository.js";
import { DuplicatePaymentError } from "../../common/errors/payment.errors.js";
import { InsufficientPointError } from "../../common/errors/point.errors.js";
import { RequestNotFoundError } from "../../common/errors/request.errors.js";
import { prisma } from "../../db.config.js";

export const PointService = {
  async getCurrentPoint(userId) {
    const point = await PointRepository.getUserPoint(userId);
    return point;
  },

  async getAllProducts() {
    const products = await PointRepository.getAllProducts();
    return products;
  },

  async transferPoint(dto) {
    return await prisma.$transaction(async (prisma) => {
      const request = await RequestRepository.findRequestById(dto.requestId);
      if (!request) {
        throw new RequestNotFoundError({ requestId: dto.requestId });
      }

      if (request.PointTransaction && request.PointTransaction.length > 0) {
        throw new DuplicatePaymentError({ requestId: dto.requestId });
      }

      const point = await PointRepository.getUserPoint(dto.userId);
      if (point.amount < dto.amount) {
        throw new InsufficientPointError({ amount: dto.amount});
      }

      const updatedPoint = await PointRepository.updateUserPoint({
        userId: dto.userId,
        amount: point.amount - dto.amount,
      });

      const pointTransaction = await PointRepository.createPointTransaction({
        userId: dto.userId,
        requestId: dto.requestId,
        amount: -dto.amount,
        balance: updatedPoint.amount,
        status: "USED",
      });

      return { updatedPoint, pointTransaction };
    });
  },

  async getTransactionHistory(data) {
    const transactions = await PointRepository.getUserTransactions(data.userId, data.requestId);

    return transactions.map((tx) => {
      const base = tx.request?.commission?.minPrice ?? 0;
      return {
        baseAmount: base,
        extraAmount: Math.abs(tx.amount) - base,
        totalAmount: Math.abs(tx.amount),
        time: tx.createdAt,
      };
    });
  },
}