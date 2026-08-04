import { useEffect, useState } from "react";
import { getEvents } from "../api/dashboard.api";
import type { DashboardEvent } from "../api/dashboard.api";

export const useDashboardEvents = () => {
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refetchIndex, setRefetchIndex] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getEvents();

        setEvents(response.data);
        setTotalEvents(response.meta.totalEvents);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch organizer events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [refetchIndex]);

  return {
    events,
    totalEvents,
    loading,
    error,
    refetch: () => setRefetchIndex((index) => index + 1),
  };
};
