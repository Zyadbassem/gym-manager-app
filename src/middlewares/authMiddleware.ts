import type { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../utils/secrets.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { AppError } from "../utils/errorHelper.js";

declare global {
  namespace Express {
    interface Request {
      adminId?: string;
      traineeId?: string;
      staffId?: string;
    }
  }
}

const getDecodedToken = (req: Request): JwtPayload => {
  const token = req.cookies?.token;
  if (!token) {
    throw new AppError("You are not logged in.", 401);
  }

  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new AppError("Invalid or expired token. Please log in again.", 401);
  }
};

export const requireAdmin = (req: Request, _: Response, next: NextFunction) => {
  try {
    const decoded = getDecodedToken(req);

    if (!decoded.adminId) {
      return next(new AppError("Access denied. Admins only.", 403));
    }

    req.adminId = decoded.adminId;

    next();
  } catch (error) {
    next(error);
  }
};

export const requireStaff = (req: Request, _: Response, next: NextFunction) => {
  try {
    const decoded = getDecodedToken(req);

    if (!decoded.staffId) {
      return next(new AppError("Access denied. Owners/Staff only", 403));
    }

    req.staffId = decoded.staffId;

    next();
  } catch (error) {
    next(error);
  }
};

export const requireTrainee = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  try {
    const decoded = getDecodedToken(req);

    if (!decoded.traineeId) {
      return next(new AppError("Access denied. Trainees only.", 403));
    }

    req.traineeId = decoded.traineeId;
    next();
  } catch (error) {
    next(error);
  }
};
