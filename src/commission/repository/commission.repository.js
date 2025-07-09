import { prisma } from "../../db.config.js"

export async function findCommissionById(id) {
  return prisma.commission.findUnique({
    where: { id: BigInt(id) },
  });
}