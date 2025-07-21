import { PointRepository } from "../repository/point.repository.js";

export const PointService = {
  async getCurrentPoint(userId) {
    const point = await PointRepository.getUserPoint(userId);
    return point;
  },

  async getAllProducts() {
    const products = await PointRepository.getAllProducts();
    return products;
  }
}