import { PointRepository } from "../repository/point.repository.js";
import { RequestRepository } from "../../request/repository/request.repository.js";
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
  }
}