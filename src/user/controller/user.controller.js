import { StatusCodes } from "http-status-codes";
import { UserService } from "../service/user.service.js";
import { UserSignupRequestDto } from "../dto/user.dto.js";
import { UserLoginRequestDto } from "../dto/user.dto.js";

// 사용자(계정) 추가 
export const addUser = async(req, res, next) => {
    try{
        // 1. Request body를 dto로 변환
        const dto = new UserSignupRequestDto(req.body);

        // 2. Service 호출 
        const result = await UserService.addAccount(dto);

        // 3. 성공 응답 반환
        res.status(StatusCodes.CREATED).success(result);
    } catch(err) {
        next(err);
    }
}

// 로그인 요청 

export const userLogin = async(req, res, next) => {
    try{
        const dto = new UserLoginRequestDto(req.body);
        const result = await UserService.userLogin(dto);
        res.status(StatusCodes.OK).success(result);
    }catch(err) {
        next(err);
    }
}