import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/errorHelper.js";
import { db } from "../models/index.js";
import { gymsTable, staffTable } from "../models/schema.js";
import { eq } from "drizzle-orm";

export const createGym = catchAsync(async (req: Request, res: Response) => {
  const staffId = req.staffId;
  if (!staffId) throw new AppError("Please sign in first", 404);

  const [staff] = await db
    .select()
    .from(staffTable)
    .where(eq(staffTable.id, staffId));
  if (!staff) throw new AppError("No owner found", 404);

  const { gymName } = req.body;
  if (!gymName) throw new AppError("Please add the required information", 400);

  const [gym] = await db.insert(gymsTable).values({ gymName }).returning();
  if (!gym) throw new AppError("Failed to create a gym", 500);
  const [updatedStaff] = await db
    .update(staffTable)
    .set({ gymId: gym.id })
    .where(eq(staffTable.id, staffId))
    .returning();

  res.status(201).json({
    message: "Created a gym successfully",
    updatedStaff: { updatedStaff, ...gym },
  });
});

export const getMeGym = catchAsync(async (req: Request, res: Response) => {
  const staffId = req.staffId;
  if (!staffId) throw new AppError("Please sign in first", 404);

  const [staff] = await db
    .select()
    .from(staffTable)
    .where(eq(staffTable.id, staffId));
  if (!staff) throw new AppError("No owner found", 404);
  if (!staff.gymId) throw new AppError("Please create a gym first", 404);

  const [gym] = await db
    .select()
    .from(gymsTable)
    .where(eq(gymsTable.id, staff.gymId));
  if (!gym) throw new AppError("Please create a gym first", 404);
  res.status(200).json({ message: "Got the gym successfully", gym });
});

export const updateMeGym = catchAsync(async (req: Request, res: Response) => {
  const staffId = req.staffId;
  if (!staffId) throw new AppError("Please sign in first", 404);

  const [staff] = await db
    .select()
    .from(staffTable)
    .where(eq(staffTable.id, staffId));
  if (!staff) throw new AppError("No owner found", 404);
  if (!staff.gymId) throw new AppError("Please create a gym first", 404);

  const { gymName } = req.body;
  const [updatedGym] = await db
    .update(gymsTable)
    .set({ gymName: gymName || gymsTable.gymName })
    .where(eq(gymsTable.id, staff.gymId))
    .returning();

  res.status(200).json({ message: "Updated successfully", updatedGym });
});

export const deleteMeGym = catchAsync(async (req: Request, res: Response) => {
  const staffId = req.staffId;
  if (!staffId) throw new AppError("Please sign in first", 404);

  const [staff] = await db
    .select()
    .from(staffTable)
    .where(eq(staffTable.id, staffId));
  if (!staff) throw new AppError("No owner found", 404);
  if (!staff.gymId) throw new AppError("Please create a gym first", 404);

  const [deletedGym] = await db
    .delete(gymsTable)
    .where(eq(gymsTable.id, staff.gymId))
    .returning();

  res.status(200).json({ message: "Deleted Successfully", deletedGym });
});

export const getGym = catchAsync(async (req: Request, res: Response) => {
  const gymId = req.params.gymId as string;
  if (!gymId) {
    const gyms = await db.select().from(gymsTable);
    res.status(200).json({ message: "Got the gyms!", gyms });
  } else {
    const [gym] = await db
      .select()
      .from(gymsTable)
      .where(eq(gymsTable.id, gymId));
    if (!gym) throw new AppError("No gym  with this id exists", 404);
    res.status(200).json({ message: "Got the gym!", gym });
  }
});

export const updateGym = catchAsync(async (req: Request, res: Response) => {
  const gymId = req.params.gymId as string;
  if (!gymId) throw new AppError("Please enter a valid id", 404);

  const { gymName } = req.body;
  const [updatedGym] = await db
    .update(gymsTable)
    .set({ gymName: gymName || gymsTable.gymName })
    .where(eq(gymsTable.id, gymId))
    .returning();
  if (!updatedGym) throw new AppError("No matching gym with the same id", 404);
  res.status(200).json({ message: "Updated Successfully", updatedGym });
});

export const deleteGym = catchAsync(async (req: Request, res: Response) => {
  const gymId = req.params.gymId as string;
  if (!gymId) throw new AppError("Please add a valid id", 404);

  const [deletedGym] = await db
    .delete(gymsTable)
    .where(eq(gymsTable.id, gymId))
    .returning();
  if (deletedGym)
    throw new AppError("Gym doesn't exist or its already deleted", 404);

  res.status(200).json({ message: "Deleted successfully", deletedGym });
});
