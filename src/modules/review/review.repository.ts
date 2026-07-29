import { prisma } from "../../configs/prisma";
import { Prisma } from "@prisma/client";

export class ReviewRepository {
  async create(data: Prisma.ReviewCreateInput) {
    return prisma.review.create({
      data,
    });
  }

  async findMany(skip: number, take: number) {
    return prisma.review.findMany({
      skip,
      take,
      include: {
        user: true,
        conference: true,
      },
    });
  }

  async findById(id: number) {
    return prisma.review.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
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