import express, { type NextFunction } from "express";
import { adminsTable, traineesTable } from "../models/schema.js";
import { db } from "../models/index.js";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { AppError } from "../utils/errorHelper.js";
import jwt from "jsonwebtoken";
import { catchAsync } from "../utils/catchAsync.js";
import { JWT_SECRET } from "../utils/secrets.js";

export const adminLoginController = catchAsync(
  async (req: express.Request, res: express.Response, _: NextFunction) => {
    const { emailOrNumber, password } = req.body;
    if (!emailOrNumber || !password) {
      throw new AppError("Invalid credentials", 401);
    }

    const [admin] = await db
      .select()
      .from(adminsTable)
      .where(
        or(
          eq(adminsTable.email, emailOrNumber),
          eq(adminsTable.phoneNumber, emailOrNumber)
        )
      )
      .limit(1);
    if (!admin) {
      throw new AppError("Invalid credentials", 401);
    }

    const hashed = admin?.hashedPassword || "";
    const isPasswordValid = await bcrypt.compare(password, hashed);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    res
      .status(200)
      .json({ status: "success", message: "Logged in successfully" });
  }
);

export const traineeLoginController = catchAsync(
  async (req: express.Request, res: express.Response, _: NextFunction) => {
    const { emailOrNumber, password } = req.body;
    if (!emailOrNumber || !password) {
      throw new AppError("Invalid credentials", 401);
    }

    const [trainee] = await db
      .select()
      .from(traineesTable)
      .where(
        or(
          eq(traineesTable.phoneNumber, emailOrNumber),
          eq(traineesTable.email, emailOrNumber)
        )
      )
      .limit(1);

    if (!trainee) {
      throw new AppError("Invalid credentials", 401);
    }

    const hashed = trainee.hashedPassword;
    const isPasswordValid = await bcrypt.compare(password, hashed);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 400);
    }

    const token = jwt.sign(
      { traineeId: trainee.id, traineeGymId: trainee.traineeId },
      JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 259200000,
    });

    res
      .status(200)
      .json({ status: "success", message: "Logged in successfully" });
  }
);
