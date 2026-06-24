import { Router } from "express";
import { requireAdmin, requireTrainee } from "../middlewares/authMiddleware.js";
import {
  checkIn,
  createTrainee,
  generateQr,
  getTrainees,
  renewMembership,
} from "../controllers/traineeControllers.js";
export const traineeRouter = Router();

traineeRouter.post("/", requireAdmin, createTrainee);
traineeRouter.get("/qr/new", requireTrainee, generateQr);
traineeRouter.post("/checkin", requireAdmin, checkIn);
traineeRouter.put("/membership", requireAdmin, renewMembership);
traineeRouter.get("/", requireAdmin, getTrainees);
traineeRouter.get("/:traineeId", requireAdmin, getTrainees);
traineeRouter.delete("/:traineeId", requireAdmin);
