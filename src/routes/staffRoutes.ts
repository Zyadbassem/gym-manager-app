import express from "express";
import { requireAdmin } from "../middlewares/authMiddleware.js";
const staffRouter = express.Router();

staffRouter.get("/", requireAdmin);
staffRouter.get("/:staffId", requireAdmin);
staffRouter.post("/");
staffRouter.delete("/:staffId", requireAdmin);

export default staffRouter;
