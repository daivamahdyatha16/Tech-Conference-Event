import { ConferenceStatus } from "@prisma/client";
import {
  ConferenceQuery,
  CreateConferenceDTO,
  UpdateConferenceDTO,
} from "./conference.interface";
import { ConferenceRepository } from "./conference.repository";
import { NotFoundError } from "../../errors/NotFoundError";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../configs/prisma";

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
      thumbnail: dto.thumbnail,
      status: ConferenceStatus.PUBLISHED,

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

     
    if (dto.isFree) {
      return prisma.$transaction(async (tx) => {
        const conference = await tx.conference.create({ data });

        await tx.ticketType.create({
          data: {
            name: "General Admission",
            price: 0,
            quota: dto.availableSeats as number,
            availableSeat: dto.availableSeats as number,
            conference: {
              connect: { id: conference.id },
            },
          },
        });

        return conference;
      });
    }

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
      throw new NotFoundError("Conference not found");
    }

    return conference;
  }

  async update(id: number, dto: UpdateConferenceDTO, organizerId: number) {
    const conference = await this.findById(id);

    if (conference.organizerId !== organizerId) {
      throw new AppError(
        "You do not have permission to update this conference",
        403,
      );
    }

    if (dto.isFree === true && !conference.isFree) {
      const transactionCount = await prisma.transaction.count({
        where: { conferenceId: id },
      });

      if (transactionCount > 0) {
        throw new AppError(
          "This conference cannot be switched to a free event because it already has transactions",
          400,
        );
      }
    }

    const data = {
      title: dto.title,
      description: dto.description,
      city: dto.city,
      venue: dto.venue,
      startDate: dto.startDate,
      endDate: dto.endDate,
      isFree: dto.isFree,
      thumbnail: dto.thumbnail,
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

  async delete(id: number, organizerId: number) {
    const conference = await this.findById(id);

    if (conference.organizerId !== organizerId) {
      throw new AppError(
        "You do not have permission to delete this conference",
        403,
      );
    }

    const transactionCount = await prisma.transaction.count({
      where: { conferenceId: id },
    });

    if (transactionCount > 0) {
      throw new AppError(
        "This conference cannot be deleted because it already has transactions",
        400,
      );
    }

    return this.conferenceRepository.delete(id);
  }
}
