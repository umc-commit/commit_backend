import { prisma } from "../../db.config.js"

export const ChatroomRepository = {
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
            hiddenConsumer: false,
        }
    });
  },

  async softDeleteChatrooms(chatroomIds, userType, userId) {
    const hiddenField = userType === "consumer" ? "hiddenConsumer" : "hiddenArtist";
    const userField = userType === "consumer" ? "consumerId" : "artistId";

    await prisma.chatroom.updateMany({
      where: {
        id: { in: chatroomIds },
        [userField]: userId
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

  async findChatroomById(chatroomId) {
    return await prisma.chatroom.findUnique({
      where: {
        id: chatroomId,
      },
    });
  },
};