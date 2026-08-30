import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create a demo user for testing
  const hashedPassword = await hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@budgetin.id" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@budgetin.id",
      password: hashedPassword,
    },
  });

  console.log("✅ Seed complete. Demo user:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
