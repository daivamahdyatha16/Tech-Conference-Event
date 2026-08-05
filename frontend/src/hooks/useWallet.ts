import { useEffect, useState } from "react";
import { getProfile } from "../api/auth.api";
import type { Coupon, PointHistoryItem } from "../api/auth.api";
import { useAuth } from "./useAuth";

export const useWallet = () => {
  const { isAuthenticated } = useAuth();
  const [pointBalance, setPointBalance] = useState(0);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pointHistory, setPointHistory] = useState<PointHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refetchIndex, setRefetchIndex] = useState(0);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!isAuthenticated) {
        setPointBalance(0);
        setCoupons([]);
        setPointHistory([]);
        return;
      }

      try {
        setLoading(true);

        const response = await getProfile();
        const balance = response.data.pointBalance ?? 0;
        
        const rawData = response.data as any;
        const historyFromApi: PointHistoryItem[] =
          rawData.pointHistory || rawData.point_history || rawData.pointTransactions || [];

        setPointBalance(balance);
        setCoupons(response.data.coupons ?? []);

        if (historyFromApi.length === 0 && balance > 0) {
          const createdDate = new Date(response.data.createdAt || Date.now());
          const expiryDate = new Date(createdDate);
          expiryDate.setMonth(expiryDate.getMonth() + 3);

          setPointHistory([
            {
              id: "fallback-ref-bonus",
              type: "EARNED",
              amount: balance,
              description: "Referral Code Sign-up Bonus",
              createdAt: createdDate.toISOString(),
              expiredAt: expiryDate.toISOString(),
            },
          ]);
        } else {
          setPointHistory(historyFromApi);
        }
      } catch (err) {
        console.error("Failed to fetch wallet profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [isAuthenticated, refetchIndex]);

  return {
    pointBalance,
    coupons,
    pointHistory,
    loading,
    refetch: () => setRefetchIndex((index) => index + 1),
  };
};