import { NextFunction, Request, Response } from "express";
import { ConferenceService } from "./conference.service";
import {
  createConferenceSchema,
  updateConferenceSchema,
} from "./conference.validation";
import { ConferenceQuery } from "./conference.interface";

export class ConferenceController {
  private conferenceService = new ConferenceService();

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const organizerId = (req as any).user.id;

      const dto = createConferenceSchema.parse(req.body);

      const result = await this.conferenceService.create(dto, organizerId);

      return res.status(201).json({
        message: "Conference berhasil dibuat",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const sortBy =
        req.query.sortBy === "startDate" || req.query.sortBy === "createdAt"
          ? req.query.sortBy
          : undefined;

      const sortOrder =
        req.query.sortOrder === "asc" || req.query.sortOrder === "desc"
          ? req.query.sortOrder
          : undefined;

      const query: ConferenceQuery = {
        search: req.query.search as string,
        city: req.query.city as string,
        categoryId: req.query.categoryId
          ? Number(req.query.categoryId)
          : undefined,
        isFree: req.query.isFree ? req.query.isFree === "true" : undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        sortBy,
        sortOrder,
      };
      const result = await this.conferenceService.findAll(query);

      return res.status(200).json({
        message: "Success",
        data: result.data,
        meta: result.meta
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);

      const result = await this.conferenceService.findById(id);

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

      const dto = updateConferenceSchema.parse(req.body);

      const result = await this.conferenceService.update(id, dto);

      return res.status(200).json({
        message: "Conference berhasil diperbarui",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);

      await this.conferenceService.delete(id);

      return res.status(200).json({
        message: "Conference berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  }
}
