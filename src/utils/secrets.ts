import dotenv from "dotenv";
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "ffhfhfh";
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const EMAIL = process.env.EMAIL;
export const PASS = process.env.PASS;
