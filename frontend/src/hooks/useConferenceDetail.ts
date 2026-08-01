import { useEffect, useState } from "react";
import { getConferenceById } from "../api/conference.api";
import type { Conference } from "../types/conference";

export const useConferenceDetail = (id: number) => {
  const [conference, setConference] = useState<Conference | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConference = async () => {
      try {
        const response = await getConferenceById(id);

        setConference(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch conference");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchConference();
    }
  }, [id]);

  return {
    conference,
    loading,
    error,
  };
};  