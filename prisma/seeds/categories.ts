import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedCategories() {
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

