import { NextFunction, Request, Response } from "express";

import {
  createTicketTypeSchema,
  updateTicketTypeSchema,
} from "./ticket-type.validation";
import { TicketTypeService } from "./ticket-type.service";

export class TicketTypeController {
  private ticketTypeService = new TicketTypeService();

  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const conferenceId = Number(req.params.conferenceId);
      const organizerId = (req as any).user.id;

      const body = createTicketTypeSchema.parse(req.body);

      const result = await this.ticketTypeService.create(
        conferenceId,
        body,
        organizerId
      );

      res.status(201).json({
        message: "Jenis tiket berhasil dibuat",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async findAllByConference(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const conferenceId = Number(req.params.conferenceId);

      const result = await this.ticketTypeService.findAllByConference(
        conferenceId,
        req.query
      );

      res.status(200).json({
        message: "Berhasil mendapatkan data jenis tiket",
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = Number(req.params.id);

      const result = await this.ticketTypeService.findById(id);

      res.status(200).json({
        message: "Berhasil mendapatkan detail jenis tiket",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = Number(req.params.id);
      const organizerId = (req as any).user.id;

      const body = updateTicketTypeSchema.parse(req.body);

      const result = await this.ticketTypeService.update(
        id,
        body,
        organizerId
      );

      res.status(200).json({
        message: "Jenis tiket berhasil diperbarui",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = Number(req.params.id);
      const organizerId = (req as any).user.id;

      await this.ticketTypeService.delete(id, organizerId);

      res.status(200).json({
        message: "Jenis tiket berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  }
}