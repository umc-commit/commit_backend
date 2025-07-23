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
};