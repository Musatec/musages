
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = "musatech0000@gmail.com";
  const password = "MusaProjet2026";
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Trouver ou créer une boutique par défaut
  let store = await prisma.store.findFirst();
  if (!store) {
    store = await prisma.store.create({
      data: {
        name: "Ma Boutique Elite",
        address: "Abidjan, CI",
      }
    });
    console.log("Boutique créée:", store.id);
  }

  // 2. Créer ou mettre à jour l'utilisateur
  const user = await prisma.user.upsert({
    where: { email },
    update: { 
      password: hashedPassword,
      storeId: store.id,
      role: 'ADMIN'
    },
    create: {
      email,
      name: "Musa Tech",
      password: hashedPassword,
      storeId: store.id,
      role: 'ADMIN'
    }
  });

  console.log("\n✅ UTILISATEUR DÉBLOQUÉ :");
  console.log(`Email: ${user.email}`);
  console.log(`Mot de passe: ${password}`);
  console.log("==========================\n");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
