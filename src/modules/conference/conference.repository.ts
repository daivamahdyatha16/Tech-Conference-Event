import { Prisma } from "@prisma/client";
import { prisma } from "../../configs/prisma";
import { ConferenceQuery } from "./conference.interface";

export class ConferenceRepository {
  async create(data: Prisma.ConferenceCreateInput) {
    return prisma.conference.create({
      data,
    });
  }
  async findById(id: number) {
    return prisma.conference.findUnique({
      where: {
        id,
      },
    });
  }
  async findAll(query: ConferenceQuery & { skip: number }) {
    const where: Prisma.ConferenceWhereInput = {};
    if (query.search) {
      where.title = {
        contains: query.search,
        mode: "insensitive",
      };
    }
    if (query.city) {
      where.city = {
        equals: query.city,
        mode: "insensitive",
      };
    }
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.isFree !== undefined) {
      where.isFree = query.isFree;
    }

    return prisma.conference.findMany({
      where,
      skip: query.skip,
      take: query.limit,
      orderBy: {
        createdAt: "desc",
      },
    });
  }
  async update(id: number, data: Prisma.ConferenceUpdateInput) {
    return prisma.conference.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: number) {
    return prisma.conference.delete({
      where: {
        id,
      },
    });
  }
}

// export default new ConferenceRepository();
