import { Router } from "express";
import { TransactionController } from "./transaction.controller";
import { upload } from "../../middleware/upload";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";

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
      authMiddleware,
      this.transactionController.create.bind(this.transactionController),
    );

    this.router.patch(
      "/:id/upload-proof",
      authMiddleware,
      upload.single("paymentProof"),
      this.transactionController.uploadPaymentProof.bind(
        this.transactionController,
      ),
    );
    this.router.patch(
      "/:id/approve",
      authMiddleware,
      roleMiddleware(["ORGANIZER"]),
      this.transactionController.approveTransaction.bind(
        this.transactionController,
      ),
    );

    this.router.patch(
      "/:id/reject",
      authMiddleware,
      roleMiddleware(["ORGANIZER"]),
      this.transactionController.rejectTransaction.bind(
        this.transactionController,
      ),
    );
  }
}
