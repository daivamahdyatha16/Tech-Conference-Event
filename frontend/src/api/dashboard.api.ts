import { api } from "./axios";
import type { Transaction } from "./transaction.api";
import type { TicketType } from "../types/ticket";

export interface DashboardStats {
  totalRevenue: number;
  totalTicketsSold: number;
}

export interface DashboardEvent {
  id: number;
  title: string;
  city: string;
  venue: string;
  thumbnail: string | null;
  startDate: string;
  endDate: string;
  isFree: boolean;
  status: string;
  category: { name: string };
  ticketTypes: TicketType[];
  _count: { transactions: number };
}

export interface DashboardEventsResponse {
  success: boolean;
  message: string;
  data: DashboardEvent[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalEvents: number;
    limit: number;
  };
}

export const getStats = async (): Promise<{
  success: boolean;
  message: string;
  data: DashboardStats;
}> => {
  const { data } = await api.get("/dashboard/stats");

  return data;
};

export const getEvents = async (
  limit = 100,
): Promise<DashboardEventsResponse> => {
  const { data } = await api.get("/dashboard/events", { params: { limit } });

  return data;
};

export const getOrganizerTransactions = async (): Promise<{
  success: boolean;
  message: string;
  data: Transaction[];
}> => {
  const { data } = await api.get("/dashboard/transactions");

  return data;
};


export const exportTransactionCsvApi = async (
  conferenceId?: string | number
): Promise<Blob> => {
  const { data } = await api.get("/dashboard/transactions/export", {
    params: { 
      conferenceId: conferenceId || undefined
    },
    responseType: "blob",
  });

  return data;
};
