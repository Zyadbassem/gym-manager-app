import express from "express";
import { adminsTable } from "../models/schema.js";
import { db } from "../models/index.js";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { AppError } from "../utils/errorHelper.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "ffhfhfh";

export const adminLoginController = async (
  req: express.Request,
  res: express.Response
) => {
  const { emailOrNumber, password } = req.body;
  if (!emailOrNumber || !password) {
    throw new AppError("Please enter the email/Number and password", 400);
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
    throw new AppError("No admin with the same data exists", 404);
  }

  const hashed = admin?.hashedPassword || "";
  const isPasswordValid = await bcrypt.compare(password, hashed);
  if (!isPasswordValid) {
    throw new AppError("Wrong password/email", 400);
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
};
