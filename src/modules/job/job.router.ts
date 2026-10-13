import { Router } from "express";
import { JobController } from "./job.controller";

export class JobRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/expire-transactions", JobController.expireTransactions);
  }
}
