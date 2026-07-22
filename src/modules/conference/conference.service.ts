import { ConferenceStatus } from "@prisma/client";
import { CreateConferenceDTO } from "./conference.interface";
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

  async findAll() {
    return this.conferenceRepository.findAll();
  }

  async findById(id: number) {
    return this.conferenceRepository.findById(id);
  }

  async update() {}

  async delete() {}
}