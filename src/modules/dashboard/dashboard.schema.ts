import { z } from "zod";

export const getDashboardStatsSchema = z.object({
  conferenceId: z.coerce.number().positive().optional(),
  year: z.coerce.number().min(2000).max(2100).optional(),
  month: z.coerce.number().min(1).max(12).optional(),
  day: z.coerce.number().min(1).max(31).optional(),
});

export const getEventsSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
});

export const getChartSchema = z.object({
  year: z.coerce.number().min(2000).max(2100).optional().default(new Date().getFullYear()),
});