import { Request, Response, NextFunction } from "express";
import { TransactionService } from "./transaction.service";
import { AppError } from "../../errors/AppError";

export class TransactionController {
  private transactionService = new TransactionService();

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;

      const result = await this.transactionService.create({
        ...req.body,
        userId,
      });

      res.status(201).json({
        success: true,
        message: "Berhasil membuat transaksi",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadPaymentProof(req: Request, res: Response, next: NextFunction) {
    try {
      const transactionId = Number(req.params.id);

      if (!req.file) {
        throw new AppError("Bukti pembayaran wajib diupload", 400);
      }

      const result = await this.transactionService.uploadPaymentProof(
        transactionId,
        req.file.path,
      );

      res.status(200).json({
        success: true,
        message: "Berhasil upload bukti pembayaran",
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

    const result = await this.transactionService.approveTransaction(
      transactionId,
    );

    res.status(200).json({
      success: true,
      message: "Transaksi berhasil disetujui",
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

    // sementara sebelum JWT
    const organizerId = 2;

    const result = await this.transactionService.rejectTransaction(
      transactionId,
      organizerId,
    );

    res.status(200).json({
      success: true,
      message: "Transaksi berhasil ditolak",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
}
