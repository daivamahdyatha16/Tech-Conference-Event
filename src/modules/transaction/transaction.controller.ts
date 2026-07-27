import { Request, Response, NextFunction } from "express";
import { TransactionService } from "./transaction.service";

export class TransactionController {
  private transactionService = new TransactionService();

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.transactionService.create(req.body);

      res.status(201).json({
        success: true,
        message: "Berhasil membuat transaksi",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}