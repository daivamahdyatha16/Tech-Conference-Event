import { Request, Response } from "express";
import { ConferenceService } from "./conference.service";
import {
  createConferenceSchema,
  updateConferenceSchema,
} from "./conference.validation";

export class ConferenceController {
  private conferenceService = new ConferenceService();

  async create(req: Request, res: Response) {
  try {
    const organizerId = 1; 

    const dto = createConferenceSchema.parse(req.body);

    const result = await this.conferenceService.create(
      dto,
      organizerId
    );

    return res.status(201).json({
      message: "Conference berhasil dibuat",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error,
    });
  }
}

  async findAll(req: Request, res: Response) {
    try {
      const result = await this.conferenceService.findAll();

      return res.status(200).json({
        message: "Success",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
        error,
      });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const result = await this.conferenceService.findById(id);

      return res.status(200).json({
        message: "Success",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
        error,
      });
    }
  }

async update(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    const dto = updateConferenceSchema.parse(req.body);

    const result = await this.conferenceService.update(id, dto);

    return res.status(200).json({
      message: "Conference berhasil diperbarui",
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
    message: "Internal Server Error",
    error: error instanceof Error ? error.message : error,
  });
}
}
  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      await this.conferenceService.delete(id);

      return res.status(200).json({
        message: "Conference berhasil dihapus",
      });
    }catch (error) {
      return res.status(500).json({
        message:"Internal Server Error",
        error: error instanceof Error ? error.message : error,
      });
    }
  }
}