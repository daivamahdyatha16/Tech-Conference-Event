import { PrismaClient } from "@prisma/client";
import { seedCategories } from "./seeds/categories";
import { seedUsers } from "./seeds/users";
import { seedConferences } from "./seeds/conferences";
import { seedTicketTypes } from "./seeds/ticket-types";
import { seedTransactions } from "./seeds/transactions";

const prisma = new PrismaClient();


async function main() {
  console.log("🌱 Start seeding...");

  await seedCategories();
  await seedUsers();
  await seedConferences();
  await seedTicketTypes();
  await seedTransactions();

  console.log("✅ Seed finished.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
