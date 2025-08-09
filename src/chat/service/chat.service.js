import { ChatroomRepository } from "../repository/chatroom.repository.js";
import { ChatRepository } from "../repository/chat.repository.js";
import { ChatroomNotFoundError } from "../../common/errors/chat.errors.js";
import { ForbiddenError } from "../../common/errors/chat.errors.js";

export const ChatService = {
  async getMessagesByChatroomId(dto) {
    const chatroom = await ChatroomRepository.findChatroomById(dto.chatroomId);
    if (!chatroom) {
      throw new ChatroomNotFoundError({ chatroomId: dto.chatroomId });
    }

    if (dto.userId !== chatroom.consumerId && dto.userId !== chatroom.artistId) {
      throw new ForbiddenError({ consumerId: dto.userId });
    }
  
    const messages = await ChatRepository.findMessagesWithImages(dto);
    return messages;
  },

  async searchMessagesByKeyword(dto) {
    const userChatrooms = await ChatroomRepository.findChatroomsByUser(dto.userId);
    const chatroomIds = userChatrooms.map(cr => cr.id);

    const messages =  await ChatRepository.searchByKeyword(dto.keyword, chatroomIds);
    return messages;
  },

  async markMessageAsRead(accountId, messageId) {
    return await ChatRepository.markAsRead(accountId, messageId);
  },

  async getUnreadCount(chatroomId, accountId) {
    return await ChatRepository.countUnreadMessages(chatroomId, accountId);
  }
};