import { prisma } from "../../db.config.js"

export const RequestRepository = {
    async findRequestById(requestId) {
    return await prisma.request.findUnique({
      where: {
        id: requestId,
      },
    });
  },
};