import { api } from "./axios";

export interface CreateTransactionPayload {
  ticketTypeId: number;
  quantity: number;
}

export interface Transaction {
  id: number;
  userId: number;
  conferenceId: number;
  ticketTypeId: number;
  couponId: number | null;
  quantity: number;
  subtotal: number;
  discount: number;
  pointUsed: number;
  totalPrice: number;
  paymentProof: string | null;
  paymentDate: string | null;
  expiresAt: string;
  status: string;
  createdAt: string;
}

export const createTransaction = async (
  payload: CreateTransactionPayload,
): Promise<{ success: boolean; message: string; data: Transaction }> => {
  const { data } = await api.post("/transactions", payload);

  return data;
};
