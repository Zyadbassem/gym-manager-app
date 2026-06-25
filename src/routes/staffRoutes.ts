import express from "express";
import { requireAdmin, requireStaff } from "../middlewares/authMiddleware.js";
import { getStaff, getMyStaff } from "../controllers/staffControllers.js";
const staffRouter = express.Router();

staffRouter.get("/", requireAdmin, getStaff);
staffRouter.post("/");
staffRouter.get("/me", requireStaff, getMyStaff);
staffRouter.get("/:staffId", requireAdmin, getStaff);
staffRouter.delete("/:staffId", requireAdmin, requireAdmin);

export default staffRouter;
