import express from "express";
import multer from "multer";
import authMiddleware from "../middlewares/authMiddleware.js";
import { registerComplainController, getComplainController, getComplainByIdController } from "../controllers/complains.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", authMiddleware, getComplainController);
router.post(
    "/upload",
    authMiddleware,
    upload.fields([
        { name: "complain", maxCount: 1 },
        { name: "extraDoc", maxCount: 1 },
    ]),
    registerComplainController
);
router.get("/getById/:complainId", authMiddleware, getComplainByIdController)

export default router;