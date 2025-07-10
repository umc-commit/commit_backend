import { ChatRepository } from "../repository/chat.repository.js";
import { UserRepository } from "../../user/repository/user.repository.js";
import { RequestRepository } from "../../request/repository/request.repository.js";
import { UserNotFoundError } from "../../common/errors/user.errors.js";
import { ArtistNotFoundError } from "../../common/errors/artist.errors.js";
import { RequestNotFoundError } from "../../common/errors/request.errors.js";
import { ChatroomNotFoundError } from "../../common/errors/chat.errors.js";

export const ChatService = {
  async createChatroom(dto) {
    const user = await UserRepository.findUserById(dto.consumerId);
    if (!user) {
      throw new UserNotFoundError({ consumerId: dto.consumerId });
    }

    const artist = await UserRepository.findArtistById(dto.artistId);
    if (!artist) {
      throw new ArtistNotFoundError({ artistId: dto.artistId });
    }

    const request = await RequestRepository.findRequestById(dto.requestId);
    if (!request) {
      throw new RequestNotFoundError({ requestId: dto.requestId });
    }

    // 채팅방 중복 확인
    const existing = await ChatRepository.findChatroomByUsersAndCommission(
      dto.consumerId,
      dto.artistId,
      dto.requestId
    );

    // 기존 채팅방 반환
    if (existing) {
      return existing;
    }

    // 채팅방이 없을 시 생성
    const chatroom = await ChatRepository.createChatroom({
      consumerId: dto.consumerId,
      artistId: dto.artistId,
      requestId: dto.requestId,
    });

    return chatroom;
  },

  async getChatroomsByUserId(dto) {
    const user = await UserRepository.findUserById(dto.consumerId);
    if (!user) {
      throw new UserNotFoundError({ consumerId: dto.consumerId });
    }

    const chatrooms = await ChatRepository.findChatroomsByUser(dto.consumerId);
    
    return chatrooms;
  },

  async softDeleteChatroomsByUser(dto) {
    const existingChatrooms = await ChatRepository.findChatroomsByIds(dto.chatroomIds);
    if (!existingChatrooms || existingChatrooms.length === 0) {
        throw new ChatroomNotFoundError({ chatroomIds: dto.chatroomIds });
    }

    await ChatRepository.softDeleteChatrooms(dto.chatroomIds, dto.userType);

    const chatrooms = await ChatRepository.findChatroomsByIds(dto.chatroomIds);

    const chatroomIdsToDelete = chatrooms
        .filter(cr => cr.hiddenConsumer && cr.hiddenArtist)
        .map(cr => cr.id);

    if (chatroomIdsToDelete.length > 0) {
        await ChatRepository.hardDeleteChatrooms(chatroomIdsToDelete);
    }

    return chatrooms;
  },
};