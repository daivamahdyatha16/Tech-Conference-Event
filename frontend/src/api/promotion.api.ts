import { api } from "./axios";

export interface CreatePromotionPayload {
  conferenceId: number;
  promotionType: "EVENT_PROMO" | "REFERRAL_CODE";
  discountType: "PERCENTAGE" | "NOMINAL";
  discountValue: number;
  quota?: number;
  startDate: string;
  endDate: string;
}

export interface Promotion {
  id: number;
  conferenceId: number;
  promotionType: string;
  discountType: string;
  discountValue: number;
  quota: number | null;
  usageCount: number;
  startDate: string;
  endDate: string;
}

export const createPromotion = async (
  payload: CreatePromotionPayload,
): Promise<{ message: string; data: Promotion }> => {
  const { data } = await api.post("/promotions", payload);

  return data;
};

export const getPromotions = async (
  conferenceId?: number,
): Promise<{ message: string; data: Promotion[] }> => {
  const { data } = await api.get("/promotions", {
    params: conferenceId ? { conferenceId } : undefined,
  });

  return data;
};
