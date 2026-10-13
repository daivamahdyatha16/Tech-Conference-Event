import { NextFunction, Request, Response } from "express";
import { timingSafeEqual } from "crypto";
import { AppError } from "../../errors/AppError";
import { TransactionService } from "../transaction/transaction.service";

const transactionService = new TransactionService();

const isAuthorizedCron = (header: string | undefined) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || !header) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header);
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
};

export class JobController {
  static async expireTransactions(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!isAuthorizedCron(req.headers.authorization)) {
        throw new AppError("Unauthorized", 401);
      }

      const expired = await transactionService.expireAllDueTransactions();

      return res.status(200).json({
        success: true,
        message: "Due transactions expired",
        data: { expired },
      });
    } catch (error) {
      next(error);
    }
  }
}
