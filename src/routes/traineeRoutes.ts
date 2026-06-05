import { Router } from "express";
import { requireAdmin } from "../middlewares/authMiddleware.js";
import { createTrainee } from "../controllers/traineeControllers.js";
export const traineeRouter = Router();

traineeRouter.post("/", requireAdmin, createTrainee);
