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
  deleteTrainee,
  generateQr,
  getMeTrainee,
  getMyGymTrainees,
  getTrainees,
  renewMembership,
  updateMeTrainee,
} from "../controllers/traineeControllers.js";
export const traineeRouter = Router();

traineeRouter.post("/", requireStaff, createTrainee);

traineeRouter.get("/me", requireTrainee, getMeTrainee);
traineeRouter.put("/me", requireTrainee, updateMeTrainee);
traineeRouter.delete("/me", requireTrainee, deleteMeTrainee);

traineeRouter.get("/qr/new", requireTrainee, generateQr);
traineeRouter.post("/checkin", requireAdmin, checkIn);
traineeRouter.put("/membership", requireAdmin, renewMembership);

traineeRouter.get("/staff/me", requireStaff, getMyGymTrainees);
traineeRouter.get("/staff/me/:traineeId", requireStaff, getMyGymTrainees);
/** To Do "Get only the owners' gym trainees" */
traineeRouter.delete("/stuff/me/:traineeId", requireStaff);
traineeRouter.put("/stuff/me/:traineeId", requireStaff);
/** DonestaffRouter.get("/:staffId", requireAdmin, getStaff); */
traineeRouter.get("/", requireAdmin, getTrainees);
traineeRouter.get("/:traineeId", requireAdmin, getTrainees);
traineeRouter.delete("/:traineeId", requireAdmin, deleteTrainee);
