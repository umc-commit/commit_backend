import { prisma } from "../../db.config.js"

export const ChatRepository = {
  async createChatroom(data) {
    console.log(data)
    return await prisma.chatroom.create({
      data: {
        consumerId: data.consumerId,
        artistId: data.artistId,
        requestId: data.requestId,
      },
    });
  },

  async findChatroomByUsersAndCommission(consumerId, artistId, requestId) {
    return await prisma.chatroom.findFirst({
      where: {
        consumerId,
        artistId,
        requestId,
      },
    });
  },
};