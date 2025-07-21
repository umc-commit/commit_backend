import express from "express";
import { paymentConfirm } from "./controller/payment.controller.js";

const router = express.Router();

router.post("/complete", paymentConfirm);

export default router;