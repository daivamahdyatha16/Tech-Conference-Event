import { Request, Response, NextFunction } from "express";
import { DashboardService } from "./dashboard.service";
import {
  getDashboardStatsSchema,
  getEventsSchema,
  getChartSchema,
} from "./dashboard.schema";

export class DashboardController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const organizerId = (req as any).user.id;
      const parsedQuery = getDashboardStatsSchema.parse(req.query);

      const stats = await DashboardService.getDashboardStats(
        organizerId,
        parsedQuery
      );

      return res.status(200).json({
        success: true,
        message: "Dashboard stats retrieved successfully",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getChart(req: Request, res: Response, next: NextFunction) {
    try {
      const organizerId = (req as any).user.id;
      const { year } = getChartSchema.parse(req.query);

      const chartData = await DashboardService.getMonthlyChartData(
        organizerId,
        year
      );

      return res.status(200).json({
        success: true,
        message: "Chart data retrieved successfully",
        data: chartData,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const organizerId = (req as any).user.id;
      const parsedQuery = getEventsSchema.parse(req.query);

      const result = await DashboardService.getOrganizerEvents(
        organizerId,
        parsedQuery
      );

      return res.status(200).json({
        success: true,
        message: "Organizer events retrieved successfully",
        data: result.events,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async exportTransactionCsv(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const organizerId = (req as any).user.id;
      const filters = getDashboardStatsSchema.parse(req.query);

      const transactions = await DashboardService.getDetailedTransactions(
        organizerId,
        filters
      );

      let csvData =
        "Transaction ID,Conference Title,Quantity,Total Price,Status,Date\n";

      transactions.forEach((tx) => {
        csvData += `${tx.id},"${tx.conference.title}",${tx.quantity},${
          tx.totalPrice
        },${tx.status},${tx.createdAt.toISOString()}\n`;
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="sales_report_${Date.now()}.csv"`
      );

      return res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  }
}