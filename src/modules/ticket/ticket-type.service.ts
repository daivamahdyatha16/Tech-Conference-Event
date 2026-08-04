import { ConferenceRepository } from "../conference/conference.repository";

import {
  CreateTicketTypeDTO,
  TicketTypeQuery,
  UpdateTicketTypeDTO,
} from "./ticket-type.interface";
import { TicketTypeRepository } from "./ticket-type.repository";
import { AppError } from "../../errors/AppError";
import { NotFoundError } from "../../errors/NotFoundError";

export class TicketTypeService {
  private ticketTypeRepository = new TicketTypeRepository();
  private conferenceRepository = new ConferenceRepository();

  async create(
    conferenceId: number,
    dto: CreateTicketTypeDTO,
    organizerId: number
  ) {
    const conference = await this.conferenceRepository.findById(conferenceId);

    if (!conference) {
      throw new NotFoundError("Conference not found");
    }

    if (conference.organizerId !== organizerId) {
      throw new AppError(
        "You do not have permission to add tickets to this conference",
        403
      );
    }

    return await this.ticketTypeRepository.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      quota: dto.quota,
      availableSeat: dto.quota,

      conference: {
        connect: {
          id: conferenceId,
        },
      },
    });
  }

  async findAllByConference(
    conferenceId: number,
    query: TicketTypeQuery
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const skip = (page - 1) * limit;

    const result = await this.ticketTypeRepository.findAllByConference(
      conferenceId,
      {
        ...query,
        limit,
        skip,
      }
    );

    return {
      data: result.data,
      meta: {
        page,
        limit,
        totalData: result.total,
        totalPage: Math.ceil(result.total / limit),
      },
    };
  }

  async findById(id: number) {
    const ticket = await this.ticketTypeRepository.findById(id);

    if (!ticket) {
      throw new NotFoundError("Ticket type not found");
    }

    return ticket;
  }

  private async assertOwnership(conferenceId: number, organizerId: number) {
    const conference = await this.conferenceRepository.findById(conferenceId);

    if (!conference) {
      throw new NotFoundError("Conference not found");
    }

    if (conference.organizerId !== organizerId) {
      throw new AppError(
        "You do not have permission to update this ticket",
        403
      );
    }
  }

  async update(
    id: number,
    dto: UpdateTicketTypeDTO,
    organizerId: number
  ) {
    const ticket = await this.findById(id);
    await this.assertOwnership(ticket.conferenceId, organizerId);

    return await this.ticketTypeRepository.update(id, dto);
  }

  async delete(id: number, organizerId: number) {
    const ticket = await this.findById(id);
    await this.assertOwnership(ticket.conferenceId, organizerId);

    return await this.ticketTypeRepository.delete(id);
  }
}