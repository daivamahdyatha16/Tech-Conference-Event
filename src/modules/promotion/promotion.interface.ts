import { DiscountType, PromotionType } from "@prisma/client";

export interface CreatePromotionDTO {
    conferenceId: number;
    promotionType: PromotionType;
    discountType: DiscountType;
    discountValue: number;
    quota?: number;
    startDate: Date;
    endDate: Date;
}

export interface UpdatePromotionDTO {
    promotionType?: PromotionType;
    discountType?: DiscountType;
    discountValue?: number; 
    quota?: number;
    startDate?: Date;
    endDate?: Date;

}