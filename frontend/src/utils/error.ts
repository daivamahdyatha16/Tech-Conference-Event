import { isAxiosError } from "axios";

export const getErrorMessage = (err: unknown, fallback: string): string => {
  if (isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message || fallback;
  }

  return fallback;
};
