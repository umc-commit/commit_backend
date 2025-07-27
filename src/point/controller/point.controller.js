import { StatusCodes } from "http-status-codes";
import { PointService } from "../service/point.service.js";
import { TransferPointDto } from "../dto/point.dto.js";
import { TransactionHistoryDto } from "../dto/point.dto.js";
import { parseWithBigInt, stringifyWithBigInt } from "../../bigintJson.js";

export const getUserPoint = async(req, res, next) => {
  try {
    const userId = BigInt(req.user.userId);

    const point = await PointService.getCurrentPoint(userId);
    const responseData = parseWithBigInt(stringifyWithBigInt(point));

    res.status(StatusCodes.OK).success(responseData);
  } catch(err) {
    next(err);
  }
}

export const getProducts = async(req, res, next) => {
  try {
    const products = await PointService.getAllProducts();
    const responseData = parseWithBigInt(stringifyWithBigInt(products));

    res.status(StatusCodes.OK).success(responseData);
  } catch (err) {
    next(err);
  }
}

export const transferPoint = async(req, res, next) => {
  try {
    const userId = BigInt(req.user.userId);
    
    const dto = new TransferPointDto ({
      requestId: req.body.requestId,
      amount: req.body.amount,
      userId: userId,
    });

    const point = await PointService.transferPoint(dto);
    const responseData = parseWithBigInt(stringifyWithBigInt(point));

    res.status(StatusCodes.OK).success(responseData);
  } catch (err) {
    next(err);
  }
}

export const getTransactionHistory = async (req, res, next) => {
  try {
    const userId = BigInt(req.user.userId);
    const dto = new TransactionHistoryDto ({
      userId: userId,
      requestId: req.query.requestId ? BigInt(req.query.requestId) : null,
    });

    const transactions = await PointService.getTransactionHistory(dto);
    const responseData = parseWithBigInt(stringifyWithBigInt(transactions));

    res.status(StatusCodes.OK).success(responseData);
  } catch (err) {
    next(err);
  }
}