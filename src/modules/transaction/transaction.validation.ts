import { z } from "zod";

export const createTransactionSchema  = z.object({
    ticketTypeId: z.coerce.number().int().positive({error: "Ticket type is required"}),
    quantity: z.coerce.number().int().positive({error:"Ticket quantity must be at least 1"}),
    couponId: z.coerce.number().int().positive({error: "Invalid coupon"}).optional(),
    pointUsed: z.coerce.number().int().min(0, {error: "Invalid point amount"}).optional(),
})