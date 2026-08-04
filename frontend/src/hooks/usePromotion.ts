import { useEffect, useState } from "react";
import { getPromotions } from "../api/promotion.api";
import type { Promotion } from "../api/promotion.api";

/** Finds the currently-active promotion for a conference, if any (a
 * conference has at most one promotion, per business rule). Used only to
 * show a live estimated price at checkout - the backend remains the
 * authoritative source for what actually gets applied. */
export const usePromotion = (conferenceId: number) => {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotion = async () => {
      if (!conferenceId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await getPromotions(conferenceId);
        const now = new Date();
        const active = response.data.find(
          (p) => new Date(p.startDate) <= now && new Date(p.endDate) >= now
        );

        setPromotion(active ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotion();
  }, [conferenceId]);

  return { promotion, loading };
};
