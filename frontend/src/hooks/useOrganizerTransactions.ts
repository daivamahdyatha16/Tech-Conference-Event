import { useEffect, useState } from "react";
import { getOrganizerTransactions } from "../api/dashboard.api";
import type { Transaction } from "../api/transaction.api";

export const useOrganizerTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refetchIndex, setRefetchIndex] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getOrganizerTransactions();

        setTransactions(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch organizer transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [refetchIndex]);

  return {
    transactions,
    loading,
    error,
    refetch: () => setRefetchIndex((index) => index + 1),
  };
};
