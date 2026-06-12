import express from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/errorHelper.js";
import { db } from "../models/index.js";
import { traineesTable } from "../models/schema.js";
import { eq, or } from "drizzle-orm";
import { generatePassword } from "../utils/passwordGenerator.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendingMails.js";
import { qrChecker } from "../utils/qrHelpers.js";
import QRCode from "qrcode";
import crypto from "crypto";

export const createTrainee = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const { name, email, number } = req.body;
    if (!name || !email || !number) {
      throw new AppError("Please fill all the inputs", 401);
    }

    const [exists] = await db
      .select()
      .from(traineesTable)
      .where(
        or(
          eq(traineesTable.email, email),
          eq(traineesTable.phoneNumber, number)
        )
      )
      .limit(1);
    if (exists) {
      throw new AppError("Trainee already exists", 409);
    }

    const generatedPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);
    const traineeData = {
      name,
      email,
      phoneNumber: number,
      hashedPassword,
    };
    await db.insert(traineesTable).values(traineeData);
    await sendEmail(
      "YOUR GYM CREDINTIALS",
      "Here are your credintials",
      email,
      generatedPassword
    );
    res.status(201).json({ message: "Created New User" });
  }
);

export const generateQr = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const traineeId = req.traineeId;
    if (!traineeId) {
      throw new AppError("Not a valid id", 401);
    }
    const [trainee] = await db
      .select()
      .from(traineesTable)
      .where(eq(traineesTable.id, traineeId))
      .limit(1);

    if (!trainee) throw new AppError("No Trainee with this ID", 404);

    if (
      !trainee.membershipExpiryDate ||
      trainee.membershipStatus === "expired" ||
      new Date() > trainee.membershipExpiryDate
    ) {
      await db
        .update(traineesTable)
        .set({ membershipStatus: "expired" })
        .where(eq(traineesTable.id, traineeId));
      throw new AppError("Membership expired", 401);
    }

    if (!trainee.lastCheckIn || qrChecker(2, trainee.lastCheckIn.getTime())) {
      const secured = crypto.randomUUID();
      const data = {
        traineeId,
        currentTime: Date.now(),
        used: false,
        token: secured,
      };
      const stringfiedData = JSON.stringify(data);
      const generatedQr = await QRCode.toDataURL(stringfiedData);
      console.log("Successfully generated QR URI!");
      console.log(generatedQr);
      await db
        .update(traineesTable)
        .set({ lastQr: secured })
        .where(eq(traineesTable.id, traineeId));
      res.status(200).json({
        message: "Successfully generated QR URI!",
        generatedQr: generatedQr,
      });
    } else {
      throw new AppError("A qr code was generated before", 403);
    }
  }
);
