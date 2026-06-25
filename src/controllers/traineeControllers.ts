import express from "express";
import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/errorHelper.js";
import { db } from "../models/index.js";
import { gymsTable, staffTable, traineesTable } from "../models/schema.js";
import { and, eq, or } from "drizzle-orm";
import { generatePassword } from "../utils/passwordGenerator.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendingMails.js";
import { qrChecker } from "../utils/qrHelpers.js";
import QRCode from "qrcode";
import crypto from "crypto";

/**
 * TRAINEE
 */
export const createTrainee = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const staffId = req.staffId;
    if (!staffId) throw new AppError("Please sign in", 400);

    const [staff] = await db
      .select()
      .from(staffTable)
      .where(eq(staffTable.id, staffId))
      .limit(1);
    if (!staff) throw new AppError("Owner doesn't exist", 404);
    const gymId = staff.gymId;
    if (gymId === null) throw new AppError("There is no gym", 404);

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
      gymId,
    };
    const [trainee] = await db
      .insert(traineesTable)
      .values(traineeData)
      .returning();
    await sendEmail(
      "YOUR GYM CREDINTIALS",
      "Here are your credintials",
      email,
      generatedPassword
    );
    res.status(201).json({
      message: "Created New User",
      email: trainee?.email,
      number: trainee?.phoneNumber,
      gymId: gymId,
    });
  }
);

export const getMeTrainee = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const traineeId = req.traineeId;
    if (!traineeId) throw new AppError("Please sign in first", 404);
    const [trainee] = await db
      .select({
        traineeId: traineesTable.traineeId,
        email: traineesTable.email,
        number: traineesTable.phoneNumber,
        gym: gymsTable.gymName,
        membership: traineesTable.membershipStatus,
        memberShipExpiryDate: traineesTable.membershipExpiryDate,
        lastCheckIn: traineesTable.lastCheckIn,
      })
      .from(traineesTable)
      .where(eq(traineesTable.id, traineeId))
      .leftJoin(gymsTable, eq(traineesTable.gymId, gymsTable.id));
    if (!trainee) throw new AppError("Trainee doesn't exist", 404);
    res.status(200).json({ message: "Got the trainee", trainee });
  }
);

export const updateMeTrainee = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const { name, email, number, password } = req.body;
    const traineeId = req.traineeId;
    if (!traineeId) throw new AppError("Please sign in first", 404);
    const [trainee] = await db
      .select({
        id: traineesTable.id,
        traineeId: traineesTable.traineeId,
        name: traineesTable.name,
        password: traineesTable.hashedPassword,
        email: traineesTable.email,
        number: traineesTable.phoneNumber,
        gym: gymsTable.gymName,
        membership: traineesTable.membershipStatus,
        memberShipExpiryDate: traineesTable.membershipExpiryDate,
        lastCheckIn: traineesTable.lastCheckIn,
      })
      .from(traineesTable)
      .where(eq(traineesTable.id, traineeId))
      .leftJoin(gymsTable, eq(traineesTable.gymId, gymsTable.id));
    if (!trainee) throw new AppError("Trainee doesn't exist", 404);
    const updatedData = {
      name: name || trainee.name,
      email: email || trainee.email,
      number: number || trainee.number,
      password: trainee.password,
    };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedData.password = hashedPassword;
    }
    const [updatedTrainee] = await db
      .update(traineesTable)
      .set(updatedData)
      .where(eq(traineesTable.id, trainee.id))
      .returning({
        id: traineesTable.id,
        traineeId: traineesTable.traineeId,
        name: traineesTable.name,
        email: traineesTable.email,
        number: traineesTable.phoneNumber,
        membership: traineesTable.membershipStatus,
        memberShipExpiryDate: traineesTable.membershipExpiryDate,
        lastCheckIn: traineesTable.lastCheckIn,
      });

    res.status(200).json({ message: "updated successfully", updatedTrainee });
  }
);

export const deleteMeTrainee = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const traineeId = req.traineeId;
    if (!traineeId) throw new AppError("Please sign in", 404);

    const [deletedTrainee] = await db
      .delete(traineesTable)
      .where(eq(traineesTable.id, traineeId))
      .returning({
        id: traineesTable.id,
        traineeId: traineesTable.traineeId,
        name: traineesTable.name,
        email: traineesTable.email,
        number: traineesTable.phoneNumber,
        membership: traineesTable.membershipStatus,
        memberShipExpiryDate: traineesTable.membershipExpiryDate,
        lastCheckIn: traineesTable.lastCheckIn,
      });

    if (!deletedTrainee)
      throw new AppError("No trainee exist with this id", 404);
    res
      .status(200)
      .json({ message: "Deleted the trainee successfully", deletedTrainee });
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

/**
 * STUFF
 */

export const getMyGymTrainees = catchAsync(
  async (req: Request, res: Response) => {
    const staffId = req.staffId;
    if (!staffId) throw new AppError("Please sign in", 404);
    const [staff] = await db
      .select()
      .from(staffTable)
      .where(eq(staffTable.id, staffId))
      .leftJoin(gymsTable, eq(gymsTable.id, staffTable.gymId));

    if (!staff || !staff.gyms)
      throw new AppError("You must create a gym first", 404);

    const traineeId = parseInt((req.params.traineeId as string) || "1");
    if (isNaN(traineeId)) throw new AppError("Invalid id", 400);
    if (traineeId === 1) {
      const trainees = await db
        .select({
          gymId: traineesTable.gymId,
          traineeId: traineesTable.traineeId,
          id: traineesTable.id,
          name: traineesTable.name,
          number: traineesTable.phoneNumber,
          email: traineesTable.email,
          membershipExpiryDate: traineesTable.membershipExpiryDate,
          membershipStatus: traineesTable.membershipStatus,
        })
        .from(traineesTable)
        .where(eq(traineesTable.gymId, staff.gyms.id));

      res.status(200).json({ message: "Got the trainees", trainees });
    } else {
      const [trainee] = await db
        .select({
          gymId: traineesTable.gymId,
          traineeId: traineesTable.traineeId,
          id: traineesTable.id,
          name: traineesTable.name,
          number: traineesTable.phoneNumber,
          email: traineesTable.email,
          membershipExpiryDate: traineesTable.membershipExpiryDate,
          membershipStatus: traineesTable.membershipStatus,
        })
        .from(traineesTable)
        .where(
          and(
            eq(traineesTable.gymId, staff.gyms.id),
            eq(traineesTable.traineeId, traineeId)
          )
        )
        .limit(1);

      if (!trainee) throw new AppError("Trainee doesn't exist", 404);
      res.status(200).json({ message: "Got the trainee", trainee });
    }
  }
);

/**
 * ADMIN
 */
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

export const getTrainees = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const paramId = req.params.traineeId as string;
    if (!paramId || paramId === "All") {
      const allTrainees = await db
        .select({
          gymId: traineesTable.gymId,
          traineeId: traineesTable.traineeId,
          id: traineesTable.id,
          name: traineesTable.name,
          number: traineesTable.phoneNumber,
          email: traineesTable.email,
          membershipExpiryDate: traineesTable.membershipExpiryDate,
          membershipStatus: traineesTable.membershipStatus,
        })
        .from(traineesTable);
      res.status(200).json({ message: "Got All Trainees", allTrainees });
      return;
    }

    const gymIdNumber = parseInt(paramId, 10);
    if (!isNaN(gymIdNumber)) {
      const [trainee] = await db
        .select({
          gymId: traineesTable.gymId,
          traineeId: traineesTable.traineeId,
          id: traineesTable.id,
          name: traineesTable.name,
          number: traineesTable.phoneNumber,
          email: traineesTable.email,
          membershipExpiryDate: traineesTable.membershipExpiryDate,
          membershipStatus: traineesTable.membershipStatus,
        })
        .from(traineesTable)
        .where(eq(traineesTable.traineeId, gymIdNumber))
        .limit(1);
      if (!trainee) {
        throw new AppError("Trainee doesn't exist", 404);
      }
      res.status(200).json({ message: "Got Trainee", trainee });
    } else {
      throw new AppError("Invalid Trainee ID format", 400);
    }
  }
);

export const deleteTrainee = catchAsync(async (req: Request, res: Response) => {
  const traineeId = parseInt(req.params.traineeId as string);
  if (isNaN(traineeId)) throw new AppError("Invalid Trainee ID format", 400);
  const [trainee] = await db
    .select()
    .from(traineesTable)
    .where(eq(traineesTable.traineeId, traineeId))
    .limit(1);

  if (!trainee) throw new AppError("No trainee exist with the same id", 404);
  const deletedTrainees = await db
    .delete(traineesTable)
    .where(eq(traineesTable.traineeId, trainee.traineeId))
    .returning();
  if (deletedTrainees.length === 0)
    throw new AppError("No trainee exists with this ID", 404);

  res.status(200).json({
    message: "Deleted Successfully",
    deletedTrainee: deletedTrainees[0],
  });
});
