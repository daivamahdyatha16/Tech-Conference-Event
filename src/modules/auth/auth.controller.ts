import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { RegisterSchema, LoginSchema } from "./auth.validation";
import { AppError } from "../../errors/AppError";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedBody = RegisterSchema.parse(req.body);
      const newUser = await AuthService.register(validatedBody);

      return res.status(201).json({
        success: true,
        message: "Registrasi akun berhasil!",
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedBody = LoginSchema.parse(req.body);
      const result = await AuthService.login(validatedBody);

      return res.status(200).json({
        success: true,
        message: "Login berhasil!",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("Tidak terotorisasi", 401);
      }

      const user = await AuthService.getProfile(userId);

      return res.status(200).json({
        success: true,
        message: "Berhasil mengambil data profile",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}