import express from "express";
import { getComplainsController, adminAnalyticsController, updateComplainController, adminuserDetailsController, adminuserDeleteController  } from "../controllers/admin.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getComplainsController);
router.get("/analytics", authMiddleware, adminAnalyticsController)
router.post("/update", authMiddleware, updateComplainController)
router.get("/getAllUsers", authMiddleware, adminuserDetailsController)
router.delete("/deleteUser", authMiddleware, adminuserDeleteController)

export default router;
