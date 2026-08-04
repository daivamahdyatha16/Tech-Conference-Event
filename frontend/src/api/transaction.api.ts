import { api } from "./axios";

export interface CreateTransactionPayload {
  ticketTypeId: number;
  quantity: number;
  couponId?: number;
  pointUsed?: number;
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
  conference?: { title: string };
  ticketType?: { name: string };
  user?: { fullName: string; email: string };
}

export const createTransaction = async (
  payload: CreateTransactionPayload,
): Promise<{ success: boolean; message: string; data: Transaction }> => {
  const { data } = await api.post("/transactions", payload);

  return data;
};

export const getMyTransactions = async (): Promise<{
  success: boolean;
  message: string;
  data: Transaction[];
}> => {
  const { data } = await api.get("/transactions/me");

  return data;
};

export const uploadPaymentProof = async (
  id: number,
  file: File,
): Promise<{ success: boolean; message: string; data: Transaction }> => {
  const formData = new FormData();
  formData.append("paymentProof", file);

  const { data } = await api.patch(
    `/transactions/${id}/upload-proof`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return data;
};

export const approveTransaction = async (
  id: number,
): Promise<{ success: boolean; message: string; data: Transaction }> => {
  const { data } = await api.patch(`/transactions/${id}/approve`);

  return data;
};

export const rejectTransaction = async (
  id: number,
): Promise<{ success: boolean; message: string; data: Transaction }> => {
  const { data } = await api.patch(`/transactions/${id}/reject`);

  return data;
};
