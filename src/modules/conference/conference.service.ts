import { ConferenceStatus } from "@prisma/client";
import {
  ConferenceQuery,
  CreateConferenceDTO,
  UpdateConferenceDTO,
} from "./conference.interface";
import { ConferenceRepository } from "./conference.repository";

export class ConferenceService {
  private conferenceRepository = new ConferenceRepository();

  async create(dto: CreateConferenceDTO, organizerId: number) {
    const data = {
      title: dto.title,
      description: dto.description,
      city: dto.city,
      venue: dto.venue,
      startDate: dto.startDate,
      endDate: dto.endDate,
      isFree: dto.isFree,
      status: ConferenceStatus.DRAFT,

      organizer: {
        connect: {
          id: organizerId,
        },
      },

      category: {
        connect: {
          id: dto.categoryId,
        },
      },
    };

    return this.conferenceRepository.create(data);
  }

  async findAll(query: ConferenceQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const skip = (page - 1) * limit;

    return this.conferenceRepository.findAll({...query, page, limit, skip });
  }

  async findById(id: number) {
    return this.conferenceRepository.findById(id);
  }

  async update(id: number, dto: UpdateConferenceDTO) {
    const conference = await this.conferenceRepository.findById(id);

    if (!conference) {
      throw new Error("Conference tidak ditemukan");
    }

    const data = {
      title: dto.title,
      description: dto.description,
      city: dto.city,
      venue: dto.venue,
      startDate: dto.startDate,
      endDate: dto.endDate,
      isFree: dto.isFree,
      category: dto.categoryId
        ? {
            connect: {
              id: dto.categoryId,
            },
          }
        : undefined,
    };

    return this.conferenceRepository.update(id, data);
  }
  async delete(id: number) {
    const conference = await this.conferenceRepository.findById(id);

    if (!conference) {
      throw new Error("Conference tidak ditemukan");
    }

    return this.conferenceRepository.delete(id);
  }
}
