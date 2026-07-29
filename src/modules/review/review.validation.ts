import { z } from "zod";

export const reviewSchema = z.object({
  conferenceId: z.coerce.number().int().positive(),
  rating: z.coerce.number().int().min(1, "Rating minimal 1").max(5, "Rating maksimal 5"),
  comment: z.string().trim().min(1, "Komentar tidak boleh kosong"),
});

export const createReviewSchema = reviewSchema;
export const updateReviewSchema = reviewSchema.partial()
  .omit({ conferenceId: true })
  .partial();
