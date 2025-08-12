import { prisma } from "../../db.config.js";

export const ChatRepository = {
  async findMessagesWithImages({ chatroomId, limit = 20, cursor }) {
    // 메시지 조회
    const messages = await prisma.chatMessage.findMany({
      where: { chatroomId },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    if (messages.length === 0) return [];

    const messageIds = messages.map(m => m.id);

    const images = await prisma.image.findMany({
      where: {
        target: "chat_messages",
        targetId: { in: messageIds },
      },
    });

    const imageMap = {};
    images.forEach(img => {
      imageMap[img.targetId] = img.imageUrl;
    });

    const merged = messages.map(m => ({
      ...m,
      imageUrl: imageMap[m.id] || null,
    }));

    return merged;
  },

  async searchByKeyword(keyword) {
    return await prisma.chatMessage.findMany({
      where: {
        content: {
          contains: keyword
        }
      }
    });
  },

  async markAsRead(accountId, messageId) {
    const existing = await prisma.chatMessageRead.findFirst({
      where: {
        messageId: BigInt(messageId),
        accountId: BigInt(accountId),
      },
    });

    if (existing) {
      return await prisma.chatMessageRead.update({
        where: { id: existing.id },
        data: { read: true },
      });
    } else {
      return await prisma.chatMessageRead.create({
        data: {
          messageId: BigInt(messageId),
          accountId: BigInt(accountId),
          read: true,
        },
      });
    }
  },

  async isMessageRead(accountId, messageId) {
    const record = await prisma.chatMessageRead.findUnique({
      where: {
        messageId_accountId: {
          messageId: BigInt(messageId),
          accountId: BigInt(accountId),
        },
      },
    });
    return record?.read || false;
  },

  async countUnreadMessages(chatroomId, accountId) {
    const count = await prisma.chatMessage.count({
      where: {
        chatroomId: BigInt(chatroomId),
        NOT: {
          chatMessageReads: {
            some: {
              accountId: BigInt(accountId),
              read: true,
            },
          },
        },
      },
    });
    return count;
  },
};