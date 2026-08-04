import { z } from "zod";

export const reviewSchema = z.object({
  conferenceId: z.coerce.number().int().positive(),
  rating: z.coerce.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().trim().min(1, "Comment cannot be empty"),
});

export const createReviewSchema = reviewSchema;
export const updateReviewSchema = reviewSchema.partial()
  .omit({ conferenceId: true })
  .partial();
