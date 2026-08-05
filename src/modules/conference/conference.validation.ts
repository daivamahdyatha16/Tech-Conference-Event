import { z } from "zod";

export const conferenceSchema = z.object({
    title: z.string().trim().min(1, "Title is required").min(3, "Conference title must be at least 3 characters").max(100,"Conference title must be at most 100 characters"),
    description: z.string().trim().min(1, "Description is required").min(20, "Conference description must be at least 20 characters").max(2000, "Conference description must be at most 2000 characters"),
    city: z.string().trim().min(1, "City is required"),
    venue: z.string().trim().min(1,"Venue is required").min(5, "Venue name must be at least 5 characters").max(150, "Venue name must be at most 150 characters"),
    startDate: z.coerce.date({message: "Invalid start date"}),
    endDate: z.coerce.date({message: "Invalid end date"}),
    
    isFree: z.preprocess(
      (value) => (typeof value === "string" ? value === "true" : value),
      z.boolean(),
    ),
    categoryId: z.coerce.number().int().positive("Category is required"),
    availableSeats: z.coerce.number().int().positive().optional(),

});
export const createConferenceSchema = conferenceSchema
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date cannot be before start date",
    path: ["endDate"],
  })
  .refine((data) => !data.isFree || data.availableSeats !== undefined, {
    message: "Available seats is required for a free event",
    path: ["availableSeats"],
  });
export const updateConferenceSchema = conferenceSchema
  .partial()
  .refine(
    (data) =>
      !data.startDate || !data.endDate || data.endDate >= data.startDate,
    {
      message: "End date cannot be before start date",
      path: ["endDate"],
    }
  )
  .refine((data) => !data.isFree || data.availableSeats !== undefined, {
    message: "Available seats is required for a free event",
    path: ["availableSeats"],
  });