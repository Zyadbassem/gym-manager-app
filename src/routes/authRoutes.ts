import express from "express";
import { adminLoginController } from "../controllers/authControllers.js";

const router = express.Router();
router.post("/admin/login", adminLoginController);
// router.post("/trainees/login");
// router.post("/trainee/check-in");

export default router;
