import { z } from "zod";

export const RegisterSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phoneNumber: z.string().min(10, "Nomor handphone minimal 10 digit"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["ATTENDEE", "ORGANIZER"]).default("ATTENDEE"),
  referredByCode: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password tidak boleh kosong"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;