import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedUsers() {
  const password = await bcrypt.hash("password123", 10);

  await prisma.user.createMany({
    data: [
      {
        fullName: "Nusantara Tech Solutions",
        email: "contact@nusantaratech.id",
        password,
        role: UserRole.ORGANIZER,
        phoneNumber: "081111111111",
      },
      {
        fullName: "Garuda Digital Labs",
        email: "hello@garudadigital.id",
        password,
        role: UserRole.ORGANIZER,
        phoneNumber: "082222222222",
      },
      {
        fullName: "Inovasi Teknologi Indonesia",
        email: "info@inovasitech.id",
        password,
        role: UserRole.ORGANIZER,
        phoneNumber: "083333333333",
      },

      {
        fullName: "Andi Pratama",
        email: "andi.pratama@mail.com",
        password,
        role: UserRole.ATTENDEE,
        referralCode: "ANDI001",
        phoneNumber: "081234567890",
      },
      {
        fullName: "Budi Santoso",
        email: "budi.santoso@mail.com",
        password,
        role: UserRole.ATTENDEE,
        referralCode: "BUDI001",
        phoneNumber: "082345678901",
      },
      {
        fullName: "Citra Lestari",
        email: "citra.lestari@mail.com",
        password,
        role: UserRole.ATTENDEE,
        referralCode: "CITRA001",
        phoneNumber: "083456789012",
      },
      {
        fullName: "Dewi Anggraini",
        email: "dewi.anggraini@mail.com",
        password,
        role: UserRole.ATTENDEE,
        referralCode: "DEWI001",
        phoneNumber: "084567890123",
      },
      {
        fullName: "Eka Putri",
        email: "eka.putri@mail.com",
        password,
        role: UserRole.ATTENDEE,
        referralCode: "EKA001",
        phoneNumber: "085678901234",
      },
    ],
    skipDuplicates: true,
  });

  const andi = await prisma.user.findUniqueOrThrow({
    where: { email: "andi.pratama@mail.com" },
  });

  await prisma.user.updateMany({
    where: {
      email: { in: ["budi.santoso@mail.com", "eka.putri@mail.com"] },
      referredById: null,
    },
    data: { referredById: andi.id },
  });

  console.log("✅ Users seeded.");
}

