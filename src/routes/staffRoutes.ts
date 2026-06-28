import express from "express";
import { requireAdmin, requireStaff } from "../middlewares/authMiddleware.js";
import {
  getStaff,
  getMyStaff,
  createStaff,
  updateMyStaff,
  deleteMyStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/staffControllers.js";
const staffRouter = express.Router();

staffRouter.post("/", createStaff);

staffRouter.get("/me", requireStaff, getMyStaff);
staffRouter.put("/me", requireStaff, updateMyStaff);
staffRouter.delete("/me", requireStaff, deleteMyStaff);

staffRouter.get("/", requireAdmin, getStaff);
staffRouter.get("/:staffId", requireAdmin, getStaff);
staffRouter.put("/:staffId", requireAdmin, updateStaff);
staffRouter.delete("/:staffId", requireAdmin, deleteStaff);

export default staffRouter;
