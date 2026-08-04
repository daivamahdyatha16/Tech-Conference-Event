import { z } from "zod";

export const ticketTypeSchema = z.object({
    name: z.string().trim().min(1, "Ticket name is required").min(3, "Ticket name must be at least 3 characters").max(100,"Ticket name must be at most 100 characters"),
    description: z.string().trim().min(1,"Ticket description cannot be empty").min(10, "Ticket description must be at least 10 characters").max(500, "Ticket description must be at most 500 characters").optional(),
    price: z.coerce.number().nonnegative("Ticket price cannot be negative"),
    quota: z.coerce.number().int().min(1,"Ticket quota must be at least 1"),
});

export const createTicketTypeSchema = ticketTypeSchema;
export const updateTicketTypeSchema = ticketTypeSchema.partial()
.refine(
    (data) => Object.keys(data).length > 0,
    {
    message: "At least one field must be filled",
});