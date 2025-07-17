import { StatusCodes } from "http-status-codes";
import { CommissionService } from '../service/commission.service.js';
import { GetCommissionDetailDto } from "../dto/commission.dto.js";
import { parseWithBigInt, stringifyWithBigInt } from "../../bigintJson.js";

// 커미션 게시글 상세글 조회
export const getCommissionDetail = async (req, res, next) => {
 try {
   const userId = req.user?.userId ? BigInt(req.user.userId) : null;
   const dto = new GetCommissionDetailDto({
     commissionId: BigInt(req.params.commissionId)
   });

   const commission = await CommissionService.getCommissionDetail(userId, dto);
   const responseData = parseWithBigInt(stringifyWithBigInt(commission));

   res.status(StatusCodes.OK).success(responseData);
 } catch (err) {
   next(err);
 }
};