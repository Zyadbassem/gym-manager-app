import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { db } from "../models/index.js";
import { adminsTable, gymsTable, staffTable } from "../models/schema.js";
import { eq, or } from "drizzle-orm";
import { AppError } from "../utils/errorHelper.js";
import bcrypt from "bcryptjs";

export const getStaff = catchAsync(async (req: Request, res: Response) => {
  const staffId = req.params.staffId as string;
  if (!staffId) {
    // GET ALL STUFF
    const allStaff = await db
      .select({
        name: staffTable.name,
        email: staffTable.email,
        phone: staffTable.phoneNumber,
        gymName: gymsTable.gymName,
        role: staffTable.role,
      })
      .from(staffTable)
      .leftJoin(gymsTable, eq(staffTable.gymId, gymsTable.id));

    res.status(200).json({ message: "Got the staff", allStaff });
    return;
  }

  const [staff] = await db
    .select({
      name: staffTable.name,
      email: staffTable.email,
      phone: staffTable.phoneNumber,
      gymName: gymsTable.gymName,
      role: staffTable.role,
    })
    .from(staffTable)
    .where(eq(staffTable.id, staffId))
    .leftJoin(gymsTable, eq(staffTable.gymId, gymsTable.id));

  if (!staff) throw new AppError("Staff doesn't exist", 404);
  res.status(200).json({ message: "Got the staff", staff });
});

export const getMyStaff = catchAsync(async (req: Request, res: Response) => {
  const staffId = req.staffId;
  if (!staffId) throw new AppError("Please sign in", 400);
  const [staff] = await db
    .select({
      name: staffTable.name,
      email: staffTable.email,
      phone: staffTable.phoneNumber,
      gymName: gymsTable.gymName,
      role: staffTable.role,
    })
    .from(staffTable)
    .where(eq(staffTable.id, staffId))
    .leftJoin(gymsTable, eq(staffTable.gymId, gymsTable.id));
  if (!staff) throw new AppError("No staff found", 404);
  res.status(200).json({ message: "Got the data", staff });
});

export const createStaff = catchAsync(async (req: Request, res: Response) => {
  const {
    name,
    email,
    phoneNumber,
    password,
  }: { name: string; email: string; phoneNumber: string; password: string } =
    req.body;
  if (!name || !email || !phoneNumber || !password)
    throw new AppError("Please fill all the data", 400);

  const [exists] = await db
    .select()
    .from(staffTable)
    .where(
      or(eq(staffTable.email, email), eq(staffTable.phoneNumber, phoneNumber))
    )
    .limit(1);
  if (exists)
    throw new AppError(
      "There is an exsisting staff with the same credintials",
      409
    );

  const hashedPassword = await bcrypt.hash(password, 10);
  const staffData: {
    name: string;
    email: string;
    phoneNumber: string;
    hashedPassword: string;
    role: "owner" | "receptionist";
  } = { name, email, phoneNumber, hashedPassword, role: "owner" };
  const [staff] = await db.insert(staffTable).values(staffData).returning();
  res.status(201).json({ message: "Created new staff", staff });
});

export const updateMyStaff = catchAsync(async (req: Request, res: Response) => {
  const staffId = req.staffId;
  const { name, email, phone, password } = req.body;
  if (!staffId) throw new AppError("Please sign in", 404);

  const [staff] = await db
    .select({
      name: staffTable.name,
      email: staffTable.email,
      phone: staffTable.phoneNumber,
      password: staffTable.hashedPassword,
    })
    .from(staffTable)
    .where(eq(staffTable.id, staffId))
    .limit(1);
  if (!staff) throw new AppError("Staff doesn't exist", 404);

  const updatedStaffData = {
    name: name || staff.name,
    email: email || staff.email,
    phone: phone || staff.phone,
    password: staff.password,
  };

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updatedStaffData.password = hashedPassword;
  }

  const [updatedStaff] = await db
    .update(staffTable)
    .set({
      name: updatedStaffData.name,
      email: updatedStaffData.email,
      phoneNumber: updatedStaffData.phone,
      hashedPassword: updatedStaffData.password,
    })
    .where(eq(staffTable.id, staffId))
    .returning({
      name: staffTable.name,
      email: staffTable.email,
      phone: staffTable.phoneNumber,
      password: staffTable.hashedPassword,
    });

  res.status(200).json({ message: "Updated Successfully", updatedStaff });
});

export const deleteMyStaff = catchAsync(async (req: Request, res: Response) => {
  const staffId = req.staffId;
  if (!staffId) throw new AppError("Please sign in", 404);

  const [deletedStaff] = await db
    .delete(staffTable)
    .where(eq(staffTable.id, staffId))
    .returning();
  if (!deletedStaff)
    throw new AppError("No owner existd with the same id", 404);

  res.status(200).json({ message: "Deleted successfully", deletedStaff });
});

export const updateStaff = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.adminId;
  if (!adminId) throw new AppError("Please Sign in", 404);
  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.id, adminId));
  if (!admin) throw new AppError("Please sign in first", 404);

  const { name, email, phone, password } = req.body;
  const staffId = req.params.staffId as string;
  if (!staffId) throw new AppError("Invalid staff id", 404);
  const [staff] = await db
    .select({
      name: staffTable.name,
      email: staffTable.email,
      phone: staffTable.phoneNumber,
      password: staffTable.hashedPassword,
    })
    .from(staffTable)
    .where(eq(staffTable.id, staffId));

  if (!staff) throw new AppError("Please sign in", 404);
  const updatedData = {
    name: name || staff.name,
    email: email || staff.email,
    phone: phone || staff.phone,
    password: staff.password,
  };
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updatedData.password = hashedPassword;
  }

  const [updatedStaff] = await db
    .update(staffTable)
    .set({
      name: updatedData.name,
      email: updatedData.email,
      phoneNumber: updatedData.phone,
      hashedPassword: updatedData.password,
    })
    .where(eq(staffTable.id, staffId))
    .returning();

  res.status(200).json({ message: "updated successfully", updatedStaff });
});

export const deleteStaff = catchAsync(async (req: Request, res: Response) => {
  const staffId = req.params.staffId as string;
  if (!staffId) throw new AppError("Please add a valid id", 404);

  const [deletedStaff] = await db
    .delete(staffTable)
    .where(eq(staffTable.id, staffId))
    .returning();
  if (!deletedStaff)
    throw new AppError("Staff doesn't exist / already deleted", 404);
  res.status(200).json({ message: "Deleted successfully", deletedStaff });
});
