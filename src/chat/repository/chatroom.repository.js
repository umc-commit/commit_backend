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
    // 1. 채팅방 기본 정보 + 마지막 메시지(내용, 생성시간, id) 조회
    const chatrooms = await prisma.chatroom.findMany({
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
                title: true,
              }
            }
          }
        },
        chatMessages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
          }
        }
      }
    });

    // 2. 마지막 메시지 ID 목록 수집
    const messageIds = chatrooms
      .map(room => room.chatMessages[0]?.id)
      .filter(Boolean); // null 제외

    if (messageIds.length === 0) {
      return chatrooms;
    }

    // 3. 메시지 ID로 이미지 URL 조회
    const images = await prisma.image.findMany({
      where: {
        target: "chat_messages",
        targetId: { in: messageIds },
      },
    });

    // 4. 이미지 URL 매핑 (messageId -> imageUrl)
    const imageMap = {};
    images.forEach(img => {
      imageMap[img.targetId.toString()] = img.imageUrl;
    });

    // 5. 채팅방 객체에 이미지 URL 병합
    chatrooms.forEach(room => {
      const msg = room.chatMessages[0];
      if (msg) {
        msg.imageUrl = imageMap[msg.id.toString()] || null;
      }
    });

    return chatrooms;
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