import { useEffect, useState } from "react";
import { getMyTransactions } from "../api/transaction.api";
import type { Transaction } from "../api/transaction.api";
import { useAuth } from "./useAuth";

export const useMyTransactions = () => {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refetchIndex, setRefetchIndex] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isAuthenticated) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getMyTransactions();

        setTransactions(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [isAuthenticated, refetchIndex]);

  return {
    transactions,
    loading,
    error,
    refetch: () => setRefetchIndex((index) => index + 1),
  };
};
