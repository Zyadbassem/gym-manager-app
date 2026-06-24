import express from "express";
import {
  adminLoginController,
  staffLoginController,
  traineeLoginController,
} from "../controllers/authControllers.js";
import { rateLimit } from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 1000 * 60 * 5,
  limit: 5,
  message: "Too many login attempts. Try again in 5 minutes.",
});
const router = express.Router();
router.post("/admin/login", loginLimiter, adminLoginController);
router.post("/trainee/login", loginLimiter, traineeLoginController);
router.post("/staff/login", loginLimiter, staffLoginController);

export default router;
