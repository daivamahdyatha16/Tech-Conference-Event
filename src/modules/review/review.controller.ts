import { NextFunction, Request, Response } from "express";
import { ReviewService } from "./review.service";
import { createReviewSchema, updateReviewSchema } from "./review.validation";

export class ReviewController {
  private reviewService: ReviewService;

  constructor() {
    this.reviewService = new ReviewService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;

      const dto = createReviewSchema.parse(req.body);

      const result = await this.reviewService.create(dto, userId);

      res.status(201).json({
        message: "Review berhasil dibuat",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const conferenceId = req.query.conferenceId
        ? Number(req.query.conferenceId)
        : undefined;

      const result = await this.reviewService.findAll(
        page,
        limit,
        conferenceId
      );

      res.status(200).json({
        message: "Daftar review",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.reviewService.findById(Number(req.params.id));

      res.status(200).json({
        message: "Detail review",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const dto = updateReviewSchema.parse(req.body);

      const result = await this.reviewService.update(
        Number(req.params.id),
        dto,
        userId
      );

      res.status(200).json({
        message: "Review berhasil diupdate",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;

      await this.reviewService.delete(Number(req.params.id), userId);

      res.status(200).json({
        message: "Review berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  };
}