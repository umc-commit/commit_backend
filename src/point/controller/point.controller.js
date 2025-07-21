import { StatusCodes } from "http-status-codes";
import { PointService } from "../service/point.service.js"
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