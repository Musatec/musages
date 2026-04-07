
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, name: true, storeId: true }
  });
  console.log("\n=== UTILISATEURS DÉTECTÉS DANS LA BASE ===");
  users.forEach(u => {
    console.log(`- Email: ${u.email} | Nom: ${u.name || 'N/A'} | StoreID: ${u.storeId || 'N/A'}`);
  });
  console.log("==========================================\n");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
