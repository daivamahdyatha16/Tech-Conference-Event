import { Request, Response } from "express";
import { ConferenceService } from "./conference.service";

export class ConferenceController {
  private conferenceService = new ConferenceService();

  async create(req: Request, res: Response) {
    try {
      const organizerId = 1; // sementara hardcode dulu

      const result = await this.conferenceService.create(
        req.body,
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

  async update(req: Request, res: Response) {}

  async delete(req: Request, res: Response) {}
}