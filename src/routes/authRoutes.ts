import express from "express";
import {
  adminLoginController,
  traineeLoginController,
} from "../controllers/authControllers.js";

const router = express.Router();
router.post("/admin/login", adminLoginController);
router.post("/trainee/login", traineeLoginController);

export default router;
