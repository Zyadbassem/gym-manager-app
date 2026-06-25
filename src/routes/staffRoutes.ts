import express from "express";
import { requireAdmin, requireStaff } from "../middlewares/authMiddleware.js";
import {
  getStaff,
  getMyStaff,
  createStaff,
} from "../controllers/staffControllers.js";
const staffRouter = express.Router();

staffRouter.post("/", createStaff);
staffRouter.get("/me", requireStaff, getMyStaff);
/**TO DO */
staffRouter.put("/me", requireStaff);
staffRouter.delete("/me", requireStaff);
/** DONE */
staffRouter.get("/", requireAdmin, getStaff);
staffRouter.get("/:staffId", requireAdmin, getStaff);
/** TO DO */
staffRouter.put("/:staffId", requireAdmin);
staffRouter.delete("/:staffId", requireAdmin);
/** DONE */

export default staffRouter;
