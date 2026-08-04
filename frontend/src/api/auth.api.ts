import { api } from "./axios";

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: "ATTENDEE" | "ORGANIZER";
  referralCode: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role?: "ATTENDEE" | "ORGANIZER";
  referredByCode?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
}

export interface Coupon {
  id: number;
  discountType: "PERCENTAGE" | "NOMINAL";
  discountValue: number;
  expiredAt: string;
}

export interface UserProfile extends AuthUser {
  createdAt: string;
  pointBalance: number;
  coupons: Coupon[];
}

export const login = async (
  payload: LoginPayload,
): Promise<AuthResponse> => {
  const { data } = await api.post("/auth/login", payload);

  return data;
};

export const register = async (
  payload: RegisterPayload,
): Promise<{ success: boolean; message: string; data: AuthUser }> => {
  const { data } = await api.post("/auth/register", payload);

  return data;
};

export const getProfile = async (): Promise<{
  success: boolean;
  message: string;
  data: UserProfile;
}> => {
  const { data } = await api.get("/auth/me");

  return data;
};
