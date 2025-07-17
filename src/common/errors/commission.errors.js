import { BaseError } from "./BaseError.js";

export class CommissionNotFoundError extends BaseError {
 constructor(data = null) {
   super({
     errorCode: "C001",
     reason: "존재하지 않는 커미션입니다.",
     statusCode: 404,
     data,
   });
 }
}