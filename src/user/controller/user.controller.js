import { StatusCodes } from "http-status-codes";
import { UserService } from "../service/user.service.js";
import { UserSignupRequestDto } from "../dto/user.dto.js";
import { UserLoginRequestDto } from "../dto/user.dto.js";
import { UpdateMyprofileDto } from "../dto/user.dto.js";
import { verifyJwt } from "../../jwt.config.js";

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

// 사용자(계정) 추가 
export const addUser = async(req, res, next) => {
    try{
        const {token} = req.body;
        let decoded = verifyJwt(token);

        const {provider, oauth_id} = decoded;

        req.body.provider = provider;
        req.body.oauth_id = oauth_id;

        // 1. Request body를 dto로 변환
        const dto = new UserSignupRequestDto(req.body);

        const result = await UserService.addAccount(dto);

        // 3. 성공 응답 반환
        res.status(StatusCodes.CREATED).success(result);
    } catch(err) {
        next(err);
    }
}

// 사용자 프로필 조회 
export const getUserProfile = async(req, res, next) => {
    try{
        console.log("Decoded JWT from req.user:", req.user);

        const userId = req.user.userId.toString();
        console.log(userId);

        const result = await UserService.getUserProfile(userId);

        res.status(StatusCodes.OK).success(result);
    } catch(err){
        next(err);
    }
}

// 나의 프로필 수정하기 
export const UpdateMyprofile = async(req, res, next) => {
    try{
        console.log("Decoded JWT from req.user:", req.user);

        const userId = req.user.userId.toString();
        console.log("userId : ", userId);

        const dto = new UpdateMyprofileDto(req.body);

        const result = await UserService.updateMyprofile(userId, dto);
        res.status(StatusCodes.OK).success(result);
    } catch(err){
        next(err);
    }
}

// 사용자가 선택한 카테고리 조회하기 
export const AccessUserCategories = async(req, res, next) => {
    try{
        console.log("Decoded JWT from req.user:", req.user);

        const userId = req.user.userId.toString();
        console.log("userId : ", userId);

        const result = await UserService.accessUserCategories(userId);
        res.status(StatusCodes.OK).success(result);
    } catch(err) {
        next(err);
    }
}

// 닉네임 중복 확인 
export const CheckUserNickname = async(req, res, next) => {
    try{
        const {nickname}= req.query;

        const result = await UserService.isNicknameDuplicate(nickname);

        res.status(StatusCodes.OK).success(result);

    } catch(err) {
        next(err);
    }
}

// 작가 팔로우하기
export const FollowArtist = async(req, res, next) => {
    try{
        console.log("Decoded JWT from req.user:", req.user);

        const userId = req.user.userId.toString();
        console.log("userId : ", userId);

        const artistId = req.params.artistId;

        const result = await UserService.FollowArtist(userId, artistId);

        res.status(StatusCodes.CREATED).success(result);
    } catch(err) {
        next(err);
    }
}