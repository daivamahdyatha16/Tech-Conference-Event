import { CreatePromotionDTO, UpdatePromotionDTO } from "./promotion.interface";
import { PromotionRepository } from "./promotion.repository";

export class PromotionService {
    private promotionRepository = new PromotionRepository();

    async create(dto: CreatePromotionDTO) {
    return await this.promotionRepository.create(dto);
    }


    async findAll() {
        return this.promotionRepository.findAll();
    }

    async findById (id: number) {
        const promotion = await this.promotionRepository.findById(id);

        if (!promotion) {
            throw new Error("Promo tidak ditemukan")
        }
        return promotion;
    }

    async update(
        id: number,
        dto: UpdatePromotionDTO 
    ) {
        await this.findById(id);

        return await this.promotionRepository.update(id, dto)
    }

    async delete (id: number){
        await this.findById(id);

        return await this.promotionRepository.delete(id);
    }
}