import { useEffect, useState } from "react";
import { getTicketTypesByConference } from "../api/ticket.api";
import type { TicketType } from "../types/ticket";

export const useTicketTypes = (conferenceId: number) => {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refetchIndex, setRefetchIndex] = useState(0);

  useEffect(() => {
    const fetchTicketTypes = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getTicketTypesByConference(conferenceId);

        setTicketTypes(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch ticket types");
      } finally {
        setLoading(false);
      }
    };

    if (conferenceId) {
      fetchTicketTypes();
    }
  }, [conferenceId, refetchIndex]);

  return {
    ticketTypes,
    loading,
    error,
    refetch: () => setRefetchIndex((index) => index + 1),
  };
};
