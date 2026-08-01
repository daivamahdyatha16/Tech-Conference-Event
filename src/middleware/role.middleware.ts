import { Request, Response, NextFunction } from "express";

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        message: "Akses ditolak. Role Anda tidak memiliki izin untuk tindakan ini.",
      });
    }

    next();
  };
};