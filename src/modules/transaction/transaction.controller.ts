import { Request, Response, NextFunction } from "express";
import { TransactionService } from "./transaction.service";
import { AppError } from "../../errors/AppError";
import { createTransactionSchema } from "./transaction.validation";

export class TransactionController {
  private transactionService = new TransactionService();

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;

      const dto = createTransactionSchema.parse(req.body);

      const result = await this.transactionService.create({
        ...dto,
        userId,
      });

      res.status(201).json({
        success: true,
        message: "Transaction created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async findMyTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;

      const result = await this.transactionService.findMyTransactions(userId);

      res.status(200).json({
        success: true,
        message: "Transaction history retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadPaymentProof(req: Request, res: Response, next: NextFunction) {
    try {
      const transactionId = Number(req.params.id);
      const userId = (req as any).user.id;

      if (!req.file) {
        throw new AppError("Payment proof is required", 400);
      }

      const result = await this.transactionService.uploadPaymentProof(
        transactionId,
        req.file.path,
        userId,
      );

      res.status(200).json({
        success: true,
        message: "Payment proof uploaded successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async approveTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const transactionId = Number(req.params.id);
    const organizerId = (req as any).user.id;

    const result = await this.transactionService.approveTransaction(
      transactionId,
      organizerId,
    );

    res.status(200).json({
      success: true,
      message: "Transaction approved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async rejectTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const transactionId = Number(req.params.id);
    const organizerId = (req as any).user.id;

    const result = await this.transactionService.rejectTransaction(
      transactionId,
      organizerId,
    );

    res.status(200).json({
      success: true,
      message: "Transaction rejected successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
}
