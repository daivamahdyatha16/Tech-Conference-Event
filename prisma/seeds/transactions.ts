import { PrismaClient, TransactionStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedTransactions() {
  console.log("🌱 Seeding transactions...");

  // 1. Cari user ATTENDEE manapun yang ada di DB (bisa user hasil register-mu)
  const attendee = await prisma.user.findFirst({
    where: { role: UserRole.ATTENDEE },
  });

  // 2. Cari conference manapun yang ada di DB
  const conference = await prisma.conference.findFirst();

  if (!attendee || !conference) {
    console.log("⚠️ Attendee atau Conference tidak ditemukan, skipping transaction seed.");
    return;
  }

  // 3. Cari ticketType milik conference tersebut
  const ticketType = await prisma.ticketType.findFirst({
    where: { conferenceId: conference.id },
  });

  if (!ticketType) {
    console.log("⚠️ TicketType tidak ditemukan, skipping transaction seed.");
    return;
  }

  // 4. Buat transaksi dummy berstatus APPROVED
  await prisma.transaction.createMany({
    data: [
      {
        userId: attendee.id,
        conferenceId: conference.id,
        ticketTypeId: ticketType.id,
        quantity: 2,
        subtotal: 500000,
        discount: 0,
        pointUsed: 0,
        totalPrice: 500000,
        status: TransactionStatus.APPROVED,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        paymentDate: new Date(),
      },
      {
        userId: attendee.id,
        conferenceId: conference.id,
        ticketTypeId: ticketType.id,
        quantity: 1,
        subtotal: 250000,
        discount: 0,
        pointUsed: 0,
        totalPrice: 250000,
        status: TransactionStatus.APPROVED,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        paymentDate: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Transactions seeded.");
}