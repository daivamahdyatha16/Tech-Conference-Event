import { NextFunction, Request, Response } from "express";
import { CategoryService } from "./category.service";

export class CategoryController {
  private categoryService = new CategoryService();

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.categoryService.findAll();

      res.status(200).json({
        message: "Success",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
