import express from "express";
import type { Request, Response, NextFunction } from "express";
import authRouter from "./src/routes/authRoutes.js";
import helmet from "helmet";
import { traineeRouter } from "./src/routes/traineeRoutes.js";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import { db } from "./src/models/index.js";
import { traineesTable } from "./src/models/schema.js";
import { isNull, lt, or } from "drizzle-orm";
import staffRouter from "./src/routes/staffRoutes.js";
import gymRouter from "./src/routes/gymRoutes.js";

const app = express();
const port = 3000;

// Secure the app by setting headers with helmet;
app.use(helmet());
app.use(cookieParser());

// To be able to use Json
app.use(express.json({ limit: "10kb" }));

// Dummy Route
app.get("/", (_, res) => {
  res.send("Hello World!, He He");
});

// Listen to our routes
app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});

// trainees membership updater
cron.schedule("0 0 * * *", async () => {
  await db
    .update(traineesTable)
    .set({ membershipStatus: "expired" })
    .where(
      or(
        lt(traineesTable.membershipExpiryDate, new Date()),
        isNull(traineesTable.membershipExpiryDate)
      )
    );
});

// Auth Router
app.use("/api/auth", authRouter);
app.use("/api/trainee", traineeRouter);
app.use("/api/staff", staffRouter);
app.use("/api/gym", gymRouter);

// Handling errors
app.use((err: any, _: Request, res: Response, __: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    statusCode,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});
