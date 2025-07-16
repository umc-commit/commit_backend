import { StatusCodes } from "http-status-codes";
import { parseWithBigInt, stringifyWithBigInt } from "../../bigintJson.js";
import { ShowMessagesDto } from "../dto/chat.dto.js";
import { ChatService } from "../service/chat.service.js";

export const showMessages = async (req, res, next) => {
  try {
    const dto = new ShowMessagesDto ({
      chatroomId: BigInt(req.params.chatroomId),
      limit: req.query.limit,
      cursor: req.query.cursor,
    });

    const messages = await ChatService.getMessagesByChatroomId(dto);
    const responseData = parseWithBigInt(stringifyWithBigInt(messages));

    res.status(StatusCodes.OK).success(responseData);
  } catch (err) {
    next(err);
  }
}