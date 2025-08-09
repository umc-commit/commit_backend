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
    return prisma.chatroom.findMany({
      where: { consumerId },
      include: {
        artist: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
          }
        },
        request: {
          select: {
            id: true,
            commission: {
              select: {
                title: true
              }
            }
          }
        },
        chatMessages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            content: true,
            createdAt: true
          }
        }
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