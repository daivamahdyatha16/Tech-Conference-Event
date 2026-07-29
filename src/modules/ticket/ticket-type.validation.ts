import { z } from "zod";

export const ticketTypeSchema = z.object({
    name: z.string().trim().min(1, "Nama tiket wajib diisi").min(3, "Nama tiket minimal 3 karakter").max(100,"Nama tiket maksimal 100 karakter"),
    description: z.string().trim().min(1,"Deskripsi tiket tidak boleh kosong").min(10, "Deskripsi tiket minimal 10 karakter").max(500, "Deskripsi tiket maksimal 500 karakter").optional(),
    price: z.coerce.number().nonnegative("Harga tiket tidak boleh negatif"),
    quota: z.coerce.number().int().min(1,"Kuota tiket tidak minimal 1"),
});

export const createTicketTypeSchema = ticketTypeSchema;
export const updateTicketTypeSchema = ticketTypeSchema.partial()
.refine(
    (data) => Object.keys(data).length > 0, 
    {
    message: "Setidaknya satu field harus diisi",
});