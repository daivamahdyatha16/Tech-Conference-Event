import { api } from "./axios";
import type { Review } from "../types/review";

export interface CreateReviewPayload {
  conferenceId: number;
  rating: number;
  comment: string;
}

export const getReviewsByConference = async (
  conferenceId: number,
): Promise<{ message: string; data: Review[] }> => {
  const { data } = await api.get("/reviews", {
    params: { conferenceId, limit: 100 },
  });

  return data;
};

export const createReview = async (
  payload: CreateReviewPayload,
): Promise<{ message: string; data: Review }> => {
  const { data } = await api.post("/reviews", payload);

  return data;
};
