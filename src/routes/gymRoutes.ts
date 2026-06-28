import express from "express";
import { requireAdmin, requireStaff } from "../middlewares/authMiddleware.js";
import {
  createGym,
  deleteGym,
  deleteMeGym,
  getGym,
  getMeGym,
  updateGym,
  updateMeGym,
} from "../controllers/gymController.js";

const gymRouter = express.Router();

gymRouter.post("/", requireStaff, createGym);

gymRouter.get("/me", requireStaff, getMeGym);
gymRouter.put("/me", requireStaff, updateMeGym);
gymRouter.delete("/me", requireStaff, deleteMeGym);

gymRouter.get("/", requireAdmin, getGym);
gymRouter.get("/:gymId", requireAdmin, getGym);
gymRouter.put("/:gymId", requireAdmin, updateGym);
gymRouter.delete("/:gymId", requireAdmin, deleteGym);

export default gymRouter;
