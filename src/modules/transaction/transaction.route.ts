import { Router } from "express";
import { TransactionController } from "./transaction.controller";
import { upload } from "../../middleware/upload";

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
      this.transactionController.create.bind(this.transactionController),
    );

    this.router.patch(
      "/:id/upload-proof",
      upload.single("paymentProof"),
      this.transactionController.uploadPaymentProof.bind(
        this.transactionController,
      ),
    );
    this.router.patch(
      "/:id/approve",
      this.transactionController.approveTransaction.bind(
        this.transactionController,
      ),
    );

    this.router.patch(
      "/:id/reject",
      this.transactionController.rejectTransaction.bind(
        this.transactionController,
      ),
    );
  }
}
