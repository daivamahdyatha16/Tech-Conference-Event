import { useEffect, useState } from "react";
import { getReviewsByConference } from "../api/review.api";
import type { Review } from "../types/review";

export const useReviews = (conferenceId: number) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refetchIndex, setRefetchIndex] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getReviewsByConference(conferenceId);

        setReviews(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch reviews");
      } finally {
        setLoading(false);
      }
    };

    if (conferenceId) {
      fetchReviews();
    }
  }, [conferenceId, refetchIndex]);

  return {
    reviews,
    loading,
    error,
    refetch: () => setRefetchIndex((index) => index + 1),
  };
};
