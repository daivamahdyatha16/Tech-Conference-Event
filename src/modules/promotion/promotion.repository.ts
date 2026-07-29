import { Promotion} from "@prisma/client";
import { prisma } from "../../configs/prisma";
import { CreatePromotionDTO, UpdatePromotionDTO } from "./promotion.interface"; 

export class PromotionRepository {
  async create(data: CreatePromotionDTO): Promise<Promotion> {
    return prisma.promotion.create({
      data,
    });
  }

  async findAll(): Promise<Promotion[]> {
    return prisma.promotion.findMany({
      include: {
        conference: true,
      },
      orderBy: {
        id: "desc",
      },
    });
  }

  async findById(id: number): Promise<Promotion | null> {
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