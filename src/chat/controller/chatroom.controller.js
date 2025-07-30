import { StatusCodes } from "http-status-codes";
import { ChatroomService } from "../service/chatroom.service.js";
import { CreateChatroomDto } from "../dto/chatroom.dto.js";
import { GetChatroomDto } from "../dto/chatroom.dto.js";
import { DeleteChatroomDto } from "../dto/chatroom.dto.js";
import { parseWithBigInt, stringifyWithBigInt } from "../../bigintJson.js";

export const createChatroom = async (req, res, next) => {
  try {
    const consumerId = BigInt(req.user.userId);

    const dto = new CreateChatroomDto({
      consumerId: consumerId,
      artistId: BigInt(req.body.artistId),
      requestId: BigInt(req.body.requestId),
    });

    const chatroom = await ChatroomService.createChatroom(dto);
    const responseData = parseWithBigInt(stringifyWithBigInt(chatroom));

    res.status(StatusCodes.CREATED).success(responseData);
  } catch (err) {
    next(err);
  }
};

export const getChatroom = async (req, res, next) => {
  try {
    const dto = new GetChatroomDto({
      consumerId: BigInt(req.user.userId)
    });

    const chatrooms = await ChatroomService.getChatroomsByUserId(dto);
    const responseData = parseWithBigInt(stringifyWithBigInt(chatrooms));

    res.status(StatusCodes.OK).success(responseData);
  } catch (err) {
    next(err)
  }
};

export const deleteChatrooms = async (req, res, next) => {
  try {
    const userId = BigInt(req.user.userId);

    const dto = new DeleteChatroomDto({
      chatroomIds: req.body.chatroomIds,
      userType: req.body.userType,
      userId: userId,
    });

    const chatrooms = await ChatroomService.softDeleteChatroomsByUser(dto);
    const responseData = parseWithBigInt(stringifyWithBigInt(chatrooms));

    res.status(StatusCodes.NO_CONTENT).success(responseData);
  } catch (err) {
    next(err)
  }
};