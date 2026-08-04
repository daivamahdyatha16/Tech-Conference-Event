import { prisma } from "../../configs/prisma";
import { Prisma } from "@prisma/client";

export class TransactionRepository {
  async create(data: Prisma.TransactionCreateInput) {
    return prisma.transaction.create({
      data,
    });
  }

  async findById(id: number) {
    return prisma.transaction.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
        conference: true,
        ticketType: true,
        coupon: true,
      },
    });
  }

  async findByUserId(userId: number) {
    return prisma.transaction.findMany({
      where: {
        userId,
      },
      include: {
        conference: {
          select: { title: true },
        },
        ticketType: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async update(id: number,data:Prisma.TransactionUpdateInput) {
    return prisma.transaction.update({
      where:{
        id,
      },
      data,
    });
  }
}