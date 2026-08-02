import { useEffect, useState } from "react";
import { getConferences } from "../api/conference.api";
import type { Conference } from "../types/conference";

interface Meta {
  page: number;
  limit: number;
  totalData: number;
  totalPage: number;
}

export const useConference = (
  page = 1,
  search = "",
  categoryId?: number,
  isFree?: boolean,
  city?: string,
  sortBy?: "startDate" | "createdAt",
  sortOrder?: "asc" | "desc",
  limit = 9,
) => {
  const [conferences, setConferences] = useState<Conference[]>([]);

  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit,
    totalData: 0,
    totalPage: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getConferences({
          page,
          limit,
          search,
          categoryId,
          isFree,
          city,
          sortBy,
          sortOrder,
        });

        setConferences(response.data);
        setMeta(response.meta);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch conferences");
      } finally {
        setLoading(false);
      }
    };

    fetchConferences();
  }, [page, search, categoryId, isFree, city, sortBy, sortOrder, limit]);

  return {
    conferences,
    meta,
    loading,
    error,
  };
};
