import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";

// Extended Interface agar req.user memiliki Tipe Data di Express
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  // Cek apakah Header Authorization ada dan berformat "Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Akses ditolak. Token tidak ditemukan.", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verifikasi Token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role: string;
      email: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError("Token tidak valid atau sudah kadaluwarsa.", 401));
  }
};