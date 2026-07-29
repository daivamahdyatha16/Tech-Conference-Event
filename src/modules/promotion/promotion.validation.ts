import { DiscountType, PromotionType } from "@prisma/client";
import { z } from "zod";

export const promotionSchema = z.object({
  conferenceId: z.coerce.number().int().positive(),

  promotionType: z.nativeEnum(PromotionType),

  discountType: z.nativeEnum(DiscountType),

  discountValue: z.coerce
    .number()
    .positive("Nilai diskon harus lebih dari 0"),

  quota: z.coerce.number().int().positive().optional(),

  startDate: z.coerce.date({
    message: "Tanggal mulai tidak valid",
  }),

  endDate: z.coerce.date({
    message: "Tanggal selesai tidak valid",
  }),
});

export const createPromotionSchema = promotionSchema.refine(
  (data) => data.endDate > data.startDate,
  {
    message: "Tanggal selesai harus setelah tanggal mulai",
    path: ["endDate"],
  }
);

export const updatePromotionSchema = promotionSchema
  .partial()
  .refine(
    (data) =>
      !data.startDate ||
      !data.endDate ||
      data.endDate > data.startDate,
    {
      message: "Tanggal selesai harus setelah tanggal mulai",
      path: ["endDate"],
    }
  );