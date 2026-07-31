import { api } from "./axios";

export const getConferences = async (
  page = 1,
  limit = 9,
  search = ""
) => {
  const response = await api.get("/conferences", {
    params: {
      page,
      limit,
      search,
    },
  });

  console.log("AXIOS RESPONSE:", response);

  return response.data;
};