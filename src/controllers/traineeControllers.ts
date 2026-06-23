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

export const checkIn = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const { payload } = req.body;
    const HOLDING_HOURS = 2;
    if (!payload || !payload.traineeId || !payload.token)
      throw new AppError("Please scan again", 401);

    const [trainee] = await db
      .select()
      .from(traineesTable)
      .where(eq(traineesTable.id, payload.traineeId));
    if (!trainee) throw new AppError("Trainee doesn't exist", 404);

    if (payload.token !== trainee.lastQr)
      throw new AppError("Invalid Token", 403);

    const currTime = Date.now();
    if (
      trainee.lastCheckIn &&
      currTime - trainee.lastCheckIn?.getTime() < HOLDING_HOURS * 60 * 60 * 1000
    )
      throw new AppError("Please check in again later", 403);

    if (
      !trainee.membershipExpiryDate ||
      trainee.membershipStatus === "expired" ||
      new Date() > trainee.membershipExpiryDate
    ) {
      await db
        .update(traineesTable)
        .set({ membershipStatus: "expired" })
        .where(eq(traineesTable.id, trainee.id));
      throw new AppError("Membership expired", 401);
    }

    // Update the db
    await db
      .update(traineesTable)
      .set({ lastCheckIn: new Date(), lastQr: null })
      .where(eq(traineesTable.id, trainee.id));

    res
      .status(200)
      .json({ message: "Welcome to the gym", trainee: trainee.name });
  }
);

export const renewMembership = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const { traineeId, numOfDays } = req.body;
    if (!traineeId || !numOfDays)
      throw new AppError("Please enter the missing fields", 400);

    const [trainee] = await db
      .select()
      .from(traineesTable)
      .where(eq(traineesTable.traineeId, traineeId))
      .limit(1);

    if (!trainee) throw new AppError("Please enter a valid trainee id", 400);
    const currDate = new Date();
    const updatedDate =
      trainee.membershipExpiryDate && currDate < trainee.membershipExpiryDate
        ? trainee.membershipExpiryDate
        : currDate;
    updatedDate.setDate(updatedDate.getDate() + numOfDays);
    await db
      .update(traineesTable)
      .set({ membershipExpiryDate: updatedDate, membershipStatus: "valid" })
      .where(eq(traineesTable.traineeId, traineeId));

    res.status(200).json({ message: "Renewed Membership", updatedDate });
  }
);
