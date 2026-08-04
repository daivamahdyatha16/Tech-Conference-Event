import { CreatePromotionDTO, UpdatePromotionDTO } from "./promotion.interface";
import { PromotionRepository } from "./promotion.repository";
import { AppError } from "../../errors/AppError";
import { NotFoundError } from "../../errors/NotFoundError";
import { prisma } from "../../configs/prisma";

export class PromotionService {
    private promotionRepository = new PromotionRepository();

    async create(dto: CreatePromotionDTO, organizerId: number) {
    const conference = await prisma.conference.findUnique({
      where: { id: dto.conferenceId },
    });

    if (!conference) {
      throw new AppError("Conference not found", 404);
    }

    if (conference.organizerId !== organizerId) {
      throw new AppError(
        "You do not have permission to create a promotion for this conference",
        403,
      );
    }

    const existingPromotion = await prisma.promotion.findFirst({
      where: { conferenceId: dto.conferenceId },
    });

    if (existingPromotion) {
      throw new AppError(
        "This conference already has a promotion. A conference can only have one promotion",
        400,
      );
    }

    return await this.promotionRepository.create(dto);
    }


    async findAll(conferenceId?: number) {
        return this.promotionRepository.findAll(conferenceId);
    }

    async findById (id: number) {
        const promotion = await this.promotionRepository.findById(id);

        if (!promotion) {
            throw new NotFoundError("Promotion not found.")
        }
        return promotion;
    }

    async update(
        id: number,
        dto: UpdatePromotionDTO,
        organizerId: number,
    ) {
        const promotion = await this.findById(id);

        if (promotion.conference.organizerId !== organizerId) {
            throw new AppError(
                "You do not have permission to update this promotion",
                403,
            );
        }

        return await this.promotionRepository.update(id, dto)
    }

    async delete (id: number, organizerId: number){
        const promotion = await this.findById(id);

        if (promotion.conference.organizerId !== organizerId) {
            throw new AppError(
                "You do not have permission to delete this promotion",
                403,
            );
        }

        return await this.promotionRepository.delete(id);
    }
}