import { z } from "zod";

export const createTransactionSchema  = z.object({
    ticketTypeId: z.coerce.number().int().positive({error: "Jenis tiket wajib dipilih"}),
    quantity: z.coerce.number().int().positive({error:"Jumlah tiket minimal 1"}),
})