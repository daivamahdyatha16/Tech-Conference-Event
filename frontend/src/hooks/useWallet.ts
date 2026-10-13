import { useEffect, useState } from "react";
import { getProfile } from "../api/auth.api";
import type { Coupon, PointBatch, PointHistoryItem } from "../api/auth.api";
import { useAuth } from "./useAuth";
import { getErrorMessage } from "../utils/error";

export const useWallet = () => {
  const { isAuthenticated } = useAuth();
  const [pointBalance, setPointBalance] = useState(0);
  const [pointBatches, setPointBatches] = useState<PointBatch[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pointHistory, setPointHistory] = useState<PointHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!isAuthenticated) {
        setPointBalance(0);
        setPointBatches([]);
        setCoupons([]);
        setPointHistory([]);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data } = await getProfile();

        setPointBalance(data.pointBalance ?? 0);
        setPointBatches(data.pointBatches ?? []);
        setCoupons(data.coupons ?? []);
        setPointHistory(data.pointHistory ?? []);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load wallet."));
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [isAuthenticated, refetchIndex]);

  return {
    pointBalance,
    pointBatches,
    coupons,
    pointHistory,
    loading,
    error,
    refetch: () => setRefetchIndex((index) => index + 1),
  };
};
