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
      const dto = createPromotionSchema.parse(req.body);

      const result = await this.promotionService.create(dto);

      return res.status(201).json({
        message: "Promosi berhasil dibuat",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.promotionService.findAll();

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

      const dto = updatePromotionSchema.parse(req.body);

      const result = await this.promotionService.update(id, dto);

      return res.status(200).json({
        message: "Promosi berhasil diperbarui",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);

      await this.promotionService.delete(id);

      return res.status(200).json({
        message: "Promosi berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  }
}