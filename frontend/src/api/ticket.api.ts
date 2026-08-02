import { api } from "./axios";
import type { TicketType } from "../types/ticket";

export interface CreateTicketTypePayload {
  name: string;
  description?: string;
  price: number;
  quota: number;
}

export type UpdateTicketTypePayload = Partial<CreateTicketTypePayload>;

export const getTicketTypesByConference = async (
  conferenceId: number,
): Promise<{
  message: string;
  data: TicketType[];
  meta: { page: number; limit: number; totalData: number; totalPage: number };
}> => {
  const { data } = await api.get(
    `/tickets/conferences/${conferenceId}/tickets`,
    { params: { limit: 100 } },
  );

  return data;
};

export const createTicketType = async (
  conferenceId: number,
  payload: CreateTicketTypePayload,
): Promise<{ message: string; data: TicketType }> => {
  const { data } = await api.post(
    `/tickets/conferences/${conferenceId}/tickets`,
    payload,
  );

  return data;
};

export const updateTicketType = async (
  id: number,
  payload: UpdateTicketTypePayload,
): Promise<{ message: string; data: TicketType }> => {
  const { data } = await api.patch(`/tickets/${id}`, payload);

  return data;
};

export const deleteTicketType = async (id: number) => {
  const { data } = await api.delete(`/tickets/${id}`);

  return data;
};
