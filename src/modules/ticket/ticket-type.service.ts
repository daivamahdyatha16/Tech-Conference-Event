import { ConferenceRepository } from "../conference/conference.repository";

import {
  CreateTicketTypeDTO,
  TicketTypeQuery,
  UpdateTicketTypeDTO,
} from "./ticket-type.interface";
import { TicketTypeRepository } from "./ticket-type.repository";

export class TicketTypeService {
  private ticketTypeRepository = new TicketTypeRepository();
  private conferenceRepository = new ConferenceRepository();

  async create(
    conferenceId: number,
    dto: CreateTicketTypeDTO
  ) {
    const conference = await this.conferenceRepository.findById(conferenceId);

    if (!conference) {
      throw new Error("Conference tidak ditemukan");
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
      throw new Error("Jenis tiket tidak ditemukan");
    }

    return ticket;
  }

  async update(
    id: number,
    dto: UpdateTicketTypeDTO
  ) {
    await this.findById(id);

    return await this.ticketTypeRepository.update(id, dto);
  }

  async delete(id: number) {
    await this.findById(id);

    return await this.ticketTypeRepository.delete(id);
  }
}