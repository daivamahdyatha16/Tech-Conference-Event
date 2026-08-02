import axiosInstance from './axiosInstance';

export interface LoginPayload {
  email: string;
  password: string;
}

export const loginApi = async (payload: LoginPayload) => {
  const response = await axiosInstance.post('/auth/login', payload);
  return response.data;
};