import { api } from "./axios";
import type { Conference, ConferenceResponse } from "../types/conference";

export interface ConferenceParams {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  categoryId?: number;
  isFree?: boolean;
  sortBy?: "startDate" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface CreateConferencePayload {
  title: string;
  description: string;
  city: string;
  venue: string;
  startDate: string;
  endDate: string;
  isFree: boolean;
  categoryId: number;

}


export const getConferences = async (
  params?: ConferenceParams,
): Promise<ConferenceResponse> => {
  const { data } = await api.get("/conferences", {
    params,
  });

  return data;
};

export const getConferenceById = async (id: number) => {
  const { data } = await api.get(`/conferences/${id}`);

  return data;
};

export const createConference = async (
  payload: CreateConferencePayload,
): Promise<{ message: string; data: Conference }> => {
  const { data } = await api.post("/conferences", payload);

  return data;
};

export const updateConference = async (
  id: number,
  payload: Partial<CreateConferencePayload>,
) => {
  const { data } = await api.patch(
    `/conferences/${id}`,
    payload,
  );

  return data;
};

export const deleteConference = async (id: number) => {
  const { data } = await api.delete(`/conferences/${id}`);

  return data;
};