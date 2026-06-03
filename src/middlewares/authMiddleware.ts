import type { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../utils/secrets.js";
import jwt, {type JwtPayload} from "jsonwebtoken";
import { AppError } from "../utils/errorHelper.js";

declare global {
  namespace Express {
    interface Request {
      adminId?: string;
    }
  }
}

export const authMiddleware = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return next(
        new AppError("You are not logged in. Please log in to get access.", 401)
      );
    }

    // 3. Verify the token (this will throw an error to the catch block if expired)
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded || !decoded.adminId) {
      return next(new AppError("Token is invalid. Please log in again.", 401));
    }

    // 4. Attach the adminId to the request so controllers can use it
    req.adminId = decoded.adminId;

    // 5. Move to the next function (the controller)
    next();
  } catch (error) {
    // Catch JWT expiration or tampering errors safely
    return next(
      new AppError("Invalid or expired token. Please log in again.", 401)
    );
  }
};
