import { ChatroomRepository } from "../repository/chatroom.repository.js";
import { ChatRepository } from "../repository/chat.repository.js";
import { UserRepository } from "../../user/repository/user.repository.js";
import { CommissionRepository } from "../../commission/repository/commission.repository.js";
import { UserNotFoundError } from "../../common/errors/user.errors.js";
import { ArtistNotFoundError } from "../../common/errors/artist.errors.js";
import { CommissionNotFoundError } from "../../common/errors/commission.errors.js";
import { ChatroomNotFoundError } from "../../common/errors/chat.errors.js";
import { ChatroomListResponseDto } from "../dto/chatroom.dto.js";

export const ChatroomService = {
  async createChatroom(dto) {
    const user = await UserRepository.findUserById(dto.userId);
    if (!user) {
      throw new UserNotFoundError({ userId: dto.userId });
    }

    const artist = await UserRepository.findArtistById(dto.artistId);
    if (!artist) {
      throw new ArtistNotFoundError({ artistId: dto.artistId });
    }

    const commission = await CommissionRepository.findCommissionById(dto.commissionId);
    if (!commission) {
      throw new CommissionNotFoundError({ commissionId: dto.commissionId });
    }

    // 채팅방 중복 확인
    const existing = await ChatroomRepository.findChatroomByUsersAndCommission(
      dto.userId,
      dto.artistId,
      dto.commissionId
    );

    // 기존 채팅방 반환
    if (existing) {
      return existing;
    }

    // 채팅방이 없을 시 생성
    const chatroom = await ChatroomRepository.createChatroom({
      userId: dto.userId,
      artistId: dto.artistId,
      commissionId: dto.commissionId,
    });

    return chatroom;
  },

  async getChatroomsByUserId(dto) {
    const user = await UserRepository.findUserById(dto.userId);
    if (!user) {
      throw new UserNotFoundError({ userId: dto.userId });
    }

    const chatrooms = await ChatroomRepository.findChatroomsByUser(dto.userId);
    console.log(dto.accountId)

    const result = [];
    for (const room of chatrooms) {
      const unreadCount = await ChatRepository.countUnreadMessages(room.id, dto.accountId);
      result.push(new ChatroomListResponseDto(room, unreadCount));
    }

    return result;
  },

  async softDeleteChatroomsByUser(dto) {
    const existingChatrooms = await ChatroomRepository.findChatroomsByIds(dto.chatroomIds);
    if (!existingChatrooms || existingChatrooms.length === 0) {
        throw new ChatroomNotFoundError({ chatroomIds: dto.chatroomIds });
    }

    await ChatroomRepository.softDeleteChatrooms(dto.chatroomIds, dto.userType, dto.userId);

    const chatrooms = await ChatroomRepository.findChatroomsByIds(dto.chatroomIds);

    const chatroomIdsToDelete = chatrooms
        .filter(cr => cr.hiddenUser && cr.hiddenArtist)
        .map(cr => cr.id);

    if (chatroomIdsToDelete.length > 0) {
        await ChatroomRepository.hardDeleteChatrooms(chatroomIdsToDelete);
    }

    return chatrooms;
  },
};