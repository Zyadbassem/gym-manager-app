import { Router } from "express";
import {
  requireAdmin,
  requireStaff,
  requireTrainee,
} from "../middlewares/authMiddleware.js";
import {
  checkIn,
  createTrainee,
  deleteMeTrainee,
  deleteMyGymTrainee,
  deleteTrainee,
  generateQr,
  getMeTrainee,
  getMyGymTrainees,
  getTrainees,
  renewMembership,
  updateMeTrainee,
  updateMyGymTrainee,
} from "../controllers/traineeControllers.js";
export const traineeRouter = Router();

traineeRouter.post("/", requireStaff, createTrainee);

traineeRouter.get("/me", requireTrainee, getMeTrainee);
traineeRouter.put("/me", requireTrainee, updateMeTrainee);
traineeRouter.delete("/me", requireTrainee, deleteMeTrainee);
traineeRouter.get("/qr/new", requireTrainee, generateQr);

traineeRouter.put("/membership", requireStaff, renewMembership);
traineeRouter.get("/staff/me", requireStaff, getMyGymTrainees);
traineeRouter.post("/checkin", requireStaff, checkIn);
traineeRouter.get("/staff/me/:traineeId", requireStaff, getMyGymTrainees);
traineeRouter.delete("/staff/me/:traineeId", requireStaff, deleteMyGymTrainee);
traineeRouter.put("/staff/me/:traineeId", requireStaff, updateMyGymTrainee);

traineeRouter.get("/", requireAdmin, getTrainees);
traineeRouter.get("/:traineeId", requireAdmin, getTrainees);
traineeRouter.delete("/:traineeId", requireAdmin, deleteTrainee);
