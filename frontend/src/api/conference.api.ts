import { api } from "./axios";

interface ConferenceParams {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  categoryId?: number;
  isFree?: boolean;
}

export const getConferences = async (params?: ConferenceParams) => {
  const { data } = await api.get("/conferences", {
    params,
  });

  return data;
};

export const getConferenceById = async (id: number) => {
  const { data } = await api.get(`/conferences/${id}`);

  return data;
};