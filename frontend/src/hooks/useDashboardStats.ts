import { useEffect, useState } from "react";
import { getStats } from "../api/dashboard.api";
import type { DashboardStats } from "../api/dashboard.api";

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalTicketsSold: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refetchIndex, setRefetchIndex] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getStats();

        setStats(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refetchIndex]);

  return {
    stats,
    loading,
    error,
    refetch: () => setRefetchIndex((index) => index + 1),
  };
};
