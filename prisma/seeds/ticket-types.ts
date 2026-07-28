import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedTicketTypes() {
  const conferences = await prisma.conference.findMany({
    select: {
      id: true,
      isFree: true,
    },
  });

  const ticketTypes = conferences.flatMap((conference) => {
    if (conference.isFree) {
      return [
        {
          conferenceId: conference.id,
          name: "Free Pass",
          description: "Free admission ticket",
          price: 0,
          quota: 100,
          availableSeat: 100,
        },
      ];
    }

    return [
      {
        conferenceId: conference.id,
        name: "Early Bird",
        description: "Tiket masuk awal dengan harga diskon khusus",
        price: 150000,
        quota: 50,
        availableSeat: 50,
      },
      {
        conferenceId: conference.id,
        name: "Regular",
        description: "Tiket masuk standar dengan harga normal",
        price: 250000,
        quota: 100,
        availableSeat: 100,
      },
      {
        conferenceId: conference.id,
        name: "VIP",
        description: "Tiket masuk eksklusif dengan fasilitas premium dan baris depan",
        price: 500000,
        quota: 50,
        availableSeat: 50,
      },
    ];
  });

  await prisma.ticketType.createMany({
    data: ticketTypes,
    skipDuplicates: true,
  });

  console.log("✅ Ticket Types seeded.");
}