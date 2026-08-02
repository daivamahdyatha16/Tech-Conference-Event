import { ConferenceStatus } from "@prisma/client";
import {
  ConferenceQuery,
  CreateConferenceDTO,
  UpdateConferenceDTO,
} from "./conference.interface";
import { ConferenceRepository } from "./conference.repository";
import { NotFoundError } from "../../errors/NotFoundError";

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
      status: dto.isFree ? ConferenceStatus.PUBLISHED : ConferenceStatus.DRAFT,

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

    const result = await this.conferenceRepository.findAll({
      ...query,
      skip,
      limit,
    });
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
    const conference = await this.conferenceRepository.findById(id);

    if (!conference) {
      throw new NotFoundError("Conference tidak ditemukan");
    }

    return conference;
  }

  async update(id: number, dto: UpdateConferenceDTO) {
    await this.findById(id);

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
    await this.findById(id);

    return this.conferenceRepository.delete(id);
  }
}
