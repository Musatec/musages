import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "test@mindos.com";
  const password = "password123";
  const name = "Musa Test";
  const enterpriseName = "Boutique de Test";

  console.log(`🚀 Création du compte de test : ${email}...`);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        name,
        role: "ADMIN",
      },
      create: {
        email,
        password: hashedPassword,
        name,
        role: "ADMIN",
      },
    });

    console.log(`✅ Utilisateur créé/mis à jour : ${user.id}`);

    // Create or find store
    let store = await prisma.store.findFirst({
      where: { ownerId: user.id }
    });

    if (!store) {
      store = await prisma.store.create({
        data: {
          name: enterpriseName,
          ownerId: user.id,
          plan: "BUSINESS", // Give full access for testing
        }
      });
      console.log(`✅ Store créé : ${store.id}`);

      // Link user to store
      await prisma.user.update({
        where: { id: user.id },
        data: { storeId: store.id }
      });
    }

    console.log("\n--- IDENTIFIANTS DE TEST ---");
    console.log(`📍 Email : ${email}`);
    console.log(`🔑 Password : ${password}`);
    console.log("----------------------------\n");

  } catch (error) {
    console.error("❌ Erreur lors de la création du compte :", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
