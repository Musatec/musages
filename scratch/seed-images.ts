
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING SIMPLE IMAGE INJECTION ---');
  
  // Generic update for all products with a nice electronic placeholder
  const result = await prisma.product.updateMany({
      where: { deletedAt: null },
      data: { image: 'https://images.unsplash.com/photo-1526733158173-e6b7a7247a6c?q=80&w=500&auto=format&fit=crop' }
  });

  console.log(`Updated ${result.count} products with generic images.`);
  console.log('--- IMAGE INJECTION COMPLETE ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
