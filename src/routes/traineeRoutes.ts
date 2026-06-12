import { Router } from "express";
import { requireAdmin, requireTrainee } from "../middlewares/authMiddleware.js";
import {
  createTrainee,
  generateQr,
} from "../controllers/traineeControllers.js";
export const traineeRouter = Router();

traineeRouter.post("/", requireAdmin, createTrainee);
traineeRouter.get("/qr/new", requireTrainee, generateQr);
