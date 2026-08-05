import { useEffect, useState } from "react";
import { getConferences } from "../api/conference.api";

export const useCities = () => {
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response: any = await getConferences({ limit: 100 });
        const rawList = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

        const cityNames: string[] = rawList
          .map((conf: any) => conf?.city)
          .filter((city: any): city is string => typeof city === "string" && city.trim() !== "");

          const uniqueCities = Array.from(new Set(cityNames)).sort((a, b) =>
          a.localeCompare(b)
        );

        setCities(uniqueCities);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCities();
  }, []);

  return cities;
};