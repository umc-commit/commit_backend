import { parseWithBigInt, stringifyWithBigInt } from "../../bigintJson.js";
import { StatusCodes } from "http-status-codes";
import { CreatePaymentDto } from "../dto/payment.dto.js";
import { PaymentService } from "../service/payment.service.js";

export const paymentConfirm = async (req, res, next) => {
  try {
      const dto = new CreatePaymentDto({
        impUid: req.body.impUid,
        merchantUid: req.body.merchantUid,
        productId: req.body.productId,
        userId: req.body.userId,
      });

      const payment = await PaymentService.createPayment(dto);
      const responseData = parseWithBigInt(stringifyWithBigInt(payment));
      res.status(StatusCodes.CREATED).success(responseData);
    } catch (err) {
      next(err);
    }
}

export const getPayments = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const payments = await PaymentService.getPayments(userId);
    const responseData = parseWithBigInt(stringifyWithBigInt(payments));
    res.status(StatusCodes.OK).success(responseData);
  } catch(err) {
    next(err);
  }
}