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

  async findChatroomsByUser(consumerId) {
    return await prisma.chatroom.findMany({
        where: {
            consumerId: consumerId,
        },
    });
  },

  async softDeleteChatrooms(chatroomIds, userType) {
    const hiddenField = userType === "consumer" ? "hiddenConsumer" : "hiddenArtist";

    await prisma.chatroom.updateMany({
      where: {
        id: { in: chatroomIds }
      },
      data: {
        [hiddenField]: true
      }
    });
  },

  async findChatroomsByIds(chatroomIds) {
    return await prisma.chatroom.findMany({
      where: {
        id: { in: chatroomIds }
      }
    });
  },

  async hardDeleteChatrooms(chatroomIds) {
    await prisma.chatroom.deleteMany({
      where: {
        id: { in: chatroomIds }
      }
    });
  },
};