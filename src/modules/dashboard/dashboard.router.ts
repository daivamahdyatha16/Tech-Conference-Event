import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";

export class DashboardRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(authMiddleware, roleMiddleware(["ORGANIZER"]));

    this.router.get("/stats", DashboardController.getStats);
    this.router.get("/chart", DashboardController.getChart);
    this.router.get("/events", DashboardController.getEvents);
    this.router.get("/export", DashboardController.exportTransactionCsv);
  }
}