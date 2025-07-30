import { StatusCodes } from "http-status-codes";
import { parseWithBigInt, stringifyWithBigInt } from "../../bigintJson.js";
import { GetMessagesDto } from "../dto/chat.dto.js";
import { ChatService } from "../service/chat.service.js";
import { FindChatroomByMessageDto } from "../dto/chat.dto.js";

export const getMessages = async (req, res, next) => {
  try {
    const userId = BigInt(req.user.userId);

    const dto = new GetMessagesDto ({
      chatroomId: BigInt(req.params.chatroomId),
      limit: req.query.limit,
      cursor: req.query.cursor,
      userId: userId,
    });

    const messages = await ChatService.getMessagesByChatroomId(dto);
    const responseData = parseWithBigInt(stringifyWithBigInt(messages));

    res.status(StatusCodes.OK).success(responseData);
  } catch (err) {
    next(err);
  }
};

export const getMessageByKeyword = async (req, res, next) => {
  try {
    const dto = new FindChatroomByMessageDto(req.query);
    
    const messages = await ChatService.searchMessagesByKeyword(dto.keyword);
    const responseData = parseWithBigInt(stringifyWithBigInt(messages));

    res.status(StatusCodes.OK).success(responseData);
  } catch(err) {
    next(err);
  }
};