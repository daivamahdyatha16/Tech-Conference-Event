import { ConferenceStatus, Prisma } from "@prisma/client";
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
      include: {
        category: true,
        organizer: {
          select: { fullName: true },
        },
      },
    });
  }

  async findAll(query: ConferenceQuery & { skip: number }) {
    // GET /conferences is a public endpoint — only PUBLISHED conferences may appear.
    const where: Prisma.ConferenceWhereInput = {
      status: ConferenceStatus.PUBLISHED,
    };

    if (query.search) {
      where.OR = [
        {
          title: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          city: {
            contains: query.search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (query.city) {
      where.city = {
        equals: query.city,
        mode: "insensitive",
      };
    }

    if (query.categoryId) {
      where.categoryId = Number(query.categoryId);
    }

    if (query.isFree !== undefined) {
      where.isFree = query.isFree;
    }

    const [data, total] = await prisma.$transaction([
      prisma.conference.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: {
          [query.sortBy ?? "startDate"]: query.sortOrder ?? "asc",
        },
        include: {
          category: true,
          organizer: {
            select: { fullName: true },
          },
          promotions: true,
        },
      }),

      prisma.conference.count({
        where,
      }),
    ]);

    return {
      data,
      total,
    };
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