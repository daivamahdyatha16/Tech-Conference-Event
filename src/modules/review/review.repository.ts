import { prisma } from "../../configs/prisma";
import { Prisma } from "@prisma/client";

export class ReviewRepository {
  async create(data: Prisma.ReviewCreateInput) {
    return prisma.review.create({
      data,
    });
  }

  async findMany(skip: number, take: number, conferenceId?: number) {
    const where: Prisma.ReviewWhereInput = conferenceId
      ? { conferenceId }
      : {};

    return prisma.review.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  async findById(id: number) {
    return prisma.review.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
        conference: true,
      },
    });
  }

  async findUserReview(userId: number, conferenceId: number) {
    return prisma.review.findFirst({
      where: {
        userId,
        conferenceId,
      },
    });
  }

  async update(id: number, data: Prisma.ReviewUpdateInput) {
    return prisma.review.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: number) {
    return prisma.review.delete({
      where: {
        id,
      },
    });
  }
}