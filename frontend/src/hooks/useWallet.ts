import { useEffect, useState } from "react";
import { getProfile } from "../api/auth.api";
import type { Coupon } from "../api/auth.api";
import { useAuth } from "./useAuth";

export const useWallet = () => {
  const { isAuthenticated } = useAuth();
  const [pointBalance, setPointBalance] = useState(0);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [refetchIndex, setRefetchIndex] = useState(0);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!isAuthenticated) {
        setPointBalance(0);
        setCoupons([]);
        return;
      }

      try {
        setLoading(true);

        const response = await getProfile();

        setPointBalance(response.data.pointBalance);
        setCoupons(response.data.coupons);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [isAuthenticated, refetchIndex]);

  return {
    pointBalance,
    coupons,
    loading,
    refetch: () => setRefetchIndex((index) => index + 1),
  };
};
