import { api } from "./axios";

export const getCategories = async () => {
  const { data } = await api.get("/categories");
  return data;
};