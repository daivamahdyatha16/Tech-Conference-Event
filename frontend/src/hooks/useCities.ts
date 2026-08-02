import { useEffect, useState } from "react";
import { getConferences } from "../api/conference.api";

export const useCities = () => {
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await getConferences({ limit: 100 });

        const uniqueCities = Array.from(
          new Set(response.data.map((conference) => conference.city))
        ).sort((a, b) => a.localeCompare(b));

        setCities(uniqueCities);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCities();
  }, []);

  return cities;
};
