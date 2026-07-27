/// <reference types="node" />

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedCategories() {
  await prisma.category.createMany({
    data: [
      { name: "Artificial Intelligence" },
      { name: "Software Engineering" },
      { name: "Cyber Security" },
      { name: "Data Science" },
      { name: "Cloud Computing" },
      { name: "Machine Learning" },
      { name: "Fullstack Development" },
      { name: "Game Development" },
      { name: "Mobile Development" },
      { name: "Blockchain & Web3" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Categories seeded.");
}

async function main() {
  console.log("🌱 Start seeding...");

  await seedCategories();

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