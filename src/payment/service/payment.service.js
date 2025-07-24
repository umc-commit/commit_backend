import axios from "axios";
import { PaymentRepository } from "../repository/payment.repository.js";
import { PointRepository } from "../../point/repository/point.repository.js";
import { ProductNotFoundError } from "../../common/errors/payment.errors.js";
import { PaymentAmountMismatchError } from "../../common/errors/payment.errors.js";
import { DuplicatePaymentError } from "../../common/errors/payment.errors.js";

export const PaymentService = {
  async createPayment(dto) {
    // 아임포트 액세스 토큰 발급
    const getTokenRes = await axios.post("https://api.iamport.kr/users/getToken", {
      imp_key: process.env.IMP_KEY,
      imp_secret: process.env.IMP_SECRET,
    });
    const { access_token } = getTokenRes.data.response;

    // impUid로 결제 정보 조회
    const paymentDataRes = await axios.get(`https://api.iamport.kr/payments/${dto.impUid}`, {
      headers: { Authorization: access_token },
    });
    const paymentData = paymentDataRes.data.response;

    const existingPayment = await PaymentRepository.getPaymentByImpUid(paymentData.imp_uid);
    if (existingPayment) {
      throw new DuplicatePaymentError({ impUid: paymentData.imp_uid });
    }

    // DB에서 product 가격 조회
    const product = await PaymentRepository.getProductById(dto.productId);
    if (!product) {
      throw new ProductNotFoundError({ productId: dto.productId });
    }

    // 결제 금액 검증
    if (paymentData.amount !== product.price) {
      throw new PaymentAmountMismatchError({ price: product.price });
    }

    // DB 저장
    const savedPayment = await PaymentRepository.createPayment({
      ...dto,
      price: paymentData.amount,
      pointAmount: product.point,
      status: paymentData.status,
      impUid: paymentData.imp_uid,
      merchantUid: paymentData.merchant_uid,
      pgProvider: paymentData.pg_provider,
    });

    // point_transaction 테이블에 기록
    await PointRepository.createPointTransaction({
      userId: dto.userId,
      paymentId: savedPayment.id,
      status: "CHARGE", // CHARGE / USE
      amount: product.point,
      balance: 0,
    });

    // point 테이블 (총합) 업데이트
    const currentPoint = await PointRepository.getUserPoint(dto.userId);
    const newAmount = currentPoint.amount + product.point;

    await PointRepository.updateUserPoint({
      userId: dto.userId,
      amount: newAmount,
    });

    // point_transaction 테이블 balance 업데이트 (최종 잔액 기록)
    await PointRepository.updateTransactionBalance(savedPayment.id, newAmount);

    return savedPayment;
  },

  async getPayments(userId) {
    const payments = PaymentRepository.getPayments(userId);

    return payments;
  }
};