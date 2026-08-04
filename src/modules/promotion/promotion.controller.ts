import { NextFunction, Request, Response } from "express";
import { PromotionService } from "./promotion.service";
import {
  createPromotionSchema,
  updatePromotionSchema,
} from "./promotion.validation";

export class PromotionController {
  private promotionService = new PromotionService();

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const organizerId = (req as any).user.id;

      const dto = createPromotionSchema.parse(req.body);

      const result = await this.promotionService.create(dto, organizerId);

      return res.status(201).json({
        message: "Promotion created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const conferenceId = req.query.conferenceId
        ? Number(req.query.conferenceId)
        : undefined;

      const result = await this.promotionService.findAll(conferenceId);

      return res.status(200).json({
        message: "Success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);

      const result = await this.promotionService.findById(id);

      return res.status(200).json({
        message: "Success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const organizerId = (req as any).user.id;

      const dto = updatePromotionSchema.parse(req.body);

      const result = await this.promotionService.update(id, dto, organizerId);

      return res.status(200).json({
        message: "Promotion updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const organizerId = (req as any).user.id;

      await this.promotionService.delete(id, organizerId);

      return res.status(200).json({
        message: "Promotion deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}