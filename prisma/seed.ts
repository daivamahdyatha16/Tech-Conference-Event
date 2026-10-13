import { PrismaClient } from "@prisma/client";
import { seedCategories } from "./seeds/categories";
import { seedUsers } from "./seeds/users";
import { seedConferences } from "./seeds/conferences";
import { seedTicketTypes } from "./seeds/ticket-types";
import { seedTransactions } from "./seeds/transactions";
import { seedRewards } from "./seeds/rewards";

const prisma = new PrismaClient();


async function main() {
  console.log("🌱 Start seeding...");

  await seedCategories();
  await seedUsers();
  await seedConferences();
  await seedTicketTypes();
  await seedTransactions();
  await seedRewards();

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
