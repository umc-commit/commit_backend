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

  async searchMessagesByKeyword(keyword) {
    const messages =  await ChatRepository.searchByKeyword(keyword);
    return messages;
  },
};