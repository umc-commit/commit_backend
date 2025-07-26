import { StatusCodes } from "http-status-codes";
import { PointService } from "../service/point.service.js";
import { TransferPointDto } from "../dto/point.dto.js";
import { parseWithBigInt, stringifyWithBigInt } from "../../bigintJson.js";

export const getUserPoint = async(req, res, next) => {
  try {
    const userId = BigInt(req.user.id);

    const point = await PointService.getCurrentPoint(userId);
    const responseData = parseWithBigInt(stringifyWithBigInt(point));

    res.status(StatusCodes.OK).success(responseData);
  } catch(error) {
    next(err);
  }
}

export const getProducts = async(req, res, next) => {
  try {
    const products = await PointService.getAllProducts();
    const responseData = parseWithBigInt(stringifyWithBigInt(products));

    res.status(StatusCodes.OK).success(responseData);
  } catch (error) {
    next(error);
  }
}

export const transferPoint = async(req, res, next) => {
  try {
    const userId = BigInt(req.user.userId);
    
    console.log("userId:", userId);

    const dto = new TransferPointDto ({
      requestId: req.body.requestId,
      amount: req.body.amount,
      userId: userId,
    });

    console.log("dto.requestId", dto.requestId);
    console.log("dto.amount", dto.amount);
    console.log("dto.userId", dto.userId);

    const point = await PointService.transferPoint(dto);
    const responseData = parseWithBigInt(stringifyWithBigInt(point));

    res.status(StatusCodes.OK).success(responseData);
  } catch (error) {
    next(error);
  }
}