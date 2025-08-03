import express from "express";
import { AccessArtistProfile } from "./controller/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();


// 작가 프로필 조회
router.get("/:artistId", authenticate,AccessArtistProfile );


export default router;