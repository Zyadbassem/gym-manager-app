import { Router } from "express";
import { requireAdmin, requireTrainee } from "../middlewares/authMiddleware.js";
import {
  checkIn,
  createTrainee,
  generateQr,
  renewMembership,
} from "../controllers/traineeControllers.js";
export const traineeRouter = Router();

traineeRouter.post("/", requireAdmin, createTrainee);
traineeRouter.get("/qr/new", requireTrainee, generateQr);
traineeRouter.post("/checkin", requireAdmin, checkIn);
traineeRouter.put("/membership", requireAdmin, renewMembership);

// {
// 	"payload":
//  {
// 		"token": "779c2553-fe53-435b-aa0e-99403e290f85",
// 		"traineeId": "34d6c8a6-b768-440d-966f-069dae6c7511"
// 	}
// }
