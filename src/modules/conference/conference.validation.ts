import { z } from "zod";

export const CreateConferenceSchema = z.object({
    title: z.string().trim().min(1, "Judul wajib diisi").min(3, "Judul konferensi minimal 3 karakter").max(100,"Judul konferensi maksimal 100 karakter"),
    description: z.string().trim().min(1, "Deskripsi wajib diisi").min(20, "Deskripsi konferensi minimal 20 karakter").max(2000, "Deskripsi konferensi maksimal 2000 karakter"),
    city: z.string().trim().min(1, "Kota wajib dipilih"),
    venue: z.string().trim().min(1,"Venue wajib diisi").min(5, "Nama venue minimal 5 karakter").max(150, "Nama venue maksimal 150 karakter"),
    startDate: z.coerce.date({message: "Tanggal mulai tidak valid"}),
    endDate: z.coerce.date({message: "Tanggal selesai tidak valid"}),
    isFree: z.boolean(),
    categoryId: z.coerce.number().int().positive("Kategori wajib dipilih"),

}).refine(
    (data) => data.endDate > data.startDate,
    {
      message: "Tanggal selesai harus setelah tanggal mulai",
      path: ["endDate"],
    }
  );