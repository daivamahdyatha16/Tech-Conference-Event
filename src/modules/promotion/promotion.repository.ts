import { Promotion} from "@prisma/client";
import { prisma } from "../../configs/prisma";
import { CreatePromotionDTO, UpdatePromotionDTO } from "./promotion.interface"; 

export class PromotionRepository {
  async create(data: CreatePromotionDTO): Promise<Promotion> {
    return prisma.promotion.create({
      data,
    });
  }

  async findAll(conferenceId?: number): Promise<Promotion[]> {
    return prisma.promotion.findMany({
      where: conferenceId ? { conferenceId } : undefined,
      include: {
        conference: true,
      },
      orderBy: {
        id: "desc",
      },
    });
  }

  async findById(id: number) {
    return prisma.promotion.findUnique({
      where: { id },
      include: {
        conference: true,
      },
    });
  }

  async update(
    id: number,
    data: UpdatePromotionDTO
  ): Promise<Promotion> {
    return prisma.promotion.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Promotion> {
    return prisma.promotion.delete({
      where: { id },
    });
  }
}

export const promotionRepository = new PromotionRepository();