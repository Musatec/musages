
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, name: true, storeId: true }
  });
  console.log("=== UTILISATEURS ENREGISTRÉS ===");
  console.table(users);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
