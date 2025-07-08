import { StatusCodes } from "http-status-codes";
import { ChatService } from "../service/chat.service.js";
import { CreateChatroomDto } from "../dto/chatroom.dto.js";
import { ShowChatroomDto } from "../dto/chatroom.dto.js";
import { parseWithBigInt, stringifyWithBigInt } from "../../bigintJson.js";

export const createChatroom = async (req, res, next) => {
  try {
    const dto = new CreateChatroomDto({
      consumerId: BigInt(req.body.consumerId),
      artistId: BigInt(req.body.artistId),
      requestId: BigInt(req.body.requestId),
    });

    const chatroom = await ChatService.createChatroom(dto);

    const responseData = parseWithBigInt(stringifyWithBigInt(chatroom));

    res.status(StatusCodes.CREATED).success(responseData);
  } catch (err) {
    next(err);
  }
};

export const showChatroom = async (req, res, next) => {
  try {
    const dto = new ShowChatroomDto({
      consumerId: BigInt(req.params.consumerId)
    });

    const chatrooms = await ChatService.getChatroomsByUserId(dto);

    const responseData = parseWithBigInt(stringifyWithBigInt(chatrooms));

    res.status(StatusCodes.OK).success(responseData);
  } catch (err) {
    next(err)
  }
};