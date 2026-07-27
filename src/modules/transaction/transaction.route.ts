import { Router } from "express";
import { TransactionController } from "./transaction.controller";

export class TransactionRoute {
  public router: Router;

  private transactionController: TransactionController;

  constructor() {
    this.router = Router();
    this.transactionController = new TransactionController();

    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/",
      this.transactionController.create.bind(this.transactionController)
    );
  }
}