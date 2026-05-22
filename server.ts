import express from "express";
import type { Request, Response, NextFunction } from "express";
import authRouter from "./src/routes/authRoutes.js";

const app = express();
const port = 3000;

app.use(express.json({ limit: "10kb" }));

app.get("/", (_, res) => {
  res.send("Hello World!, He He");
});

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});

app.use("/api/auth", authRouter);

app.use((err: any, _: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});
