import { DiscountType, PromotionType } from "@prisma/client";
import { z } from "zod";

// Promo form only ever collects plain dates (no time-of-day) - endDate is
// pushed to the end of that day so a promotion is active for the whole day
// it's set to end on, not just its first midnight instant.
const toEndOfDay = (date: Date) => {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
};

export const promotionSchema = z.object({
  conferenceId: z.coerce.number().int().positive(),

  promotionType: z.nativeEnum(PromotionType),

  discountType: z.nativeEnum(DiscountType),

  discountValue: z.coerce
    .number()
    .positive("Discount value must be greater than 0"),

  quota: z.coerce.number().int().positive().optional(),

  startDate: z.coerce.date({
    message: "Invalid start date",
  }),

  endDate: z.coerce
    .date({
      message: "Invalid end date",
    })
    .transform(toEndOfDay),
});

export const createPromotionSchema = promotionSchema.refine(
  (data) => data.endDate >= data.startDate,
  {
    message: "End date cannot be before start date",
    path: ["endDate"],
  }
);

export const updatePromotionSchema = promotionSchema
  .partial()
  .refine(
    (data) =>
      !data.startDate ||
      !data.endDate ||
      data.endDate >= data.startDate,
    {
      message: "End date cannot be before start date",
      path: ["endDate"],
    }
  );