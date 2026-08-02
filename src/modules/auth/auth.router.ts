import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

export class AuthRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post("/register", AuthController.register);
    this.router.post("/login", AuthController.login);
    this.router.get("/me", authMiddleware, AuthController.me);
  }
}