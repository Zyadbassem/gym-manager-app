import express from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/errorHelper.js";
import { db } from "../models/index.js";
import { traineesTable } from "../models/schema.js";
import { eq, or } from "drizzle-orm";
import { generatePassword } from "../utils/passwordGenerator.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendingMails.js";

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
    console.log(generatePassword);

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
