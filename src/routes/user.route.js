import express from "express";
import { registerUserController, loginUserController, getUserByIdController, updateUserController, sendOtpController, forgetPasswordController } from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUserController);
router.post("/login", loginUserController);
router.get("/", authMiddleware, getUserByIdController);
router.post("/update", authMiddleware, updateUserController);
router.post("/send-otp", sendOtpController);
router.post("/forget-password", forgetPasswordController);


export default router;
