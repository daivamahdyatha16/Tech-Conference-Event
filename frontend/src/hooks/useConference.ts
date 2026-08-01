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
) => {
  const [conferences, setConferences] = useState<Conference[]>([]);

  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit: 9,
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
          limit: 9,
          search,
          categoryId,
          isFree,
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
  }, [page, search, categoryId, isFree]);

  return {
    conferences,
    meta,
    loading,
    error,
  };
};
