import { useEffect, useState } from "react";
import { getConferences } from "../api/conference.api";
import type { Conference } from "../types/conference";

export const useConference = () => {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        const response = await getConferences();

        console.log("FULL RESPONSE:", response);
        console.log("DATA:", response.data);
        console.log("IS ARRAY:", Array.isArray(response.data));

        setConferences(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch conferences");
      } finally {
        setLoading(false);
      }
    };

    fetchConferences();
  }, []);

  return {
    conferences,
    loading,
    error,
  };
};