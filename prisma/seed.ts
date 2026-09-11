import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Début du remplissage de la base de données locale...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Créer un Daara par défaut
  let daara = await prisma.daara.findFirst();
  if (!daara) {
    daara = await prisma.daara.create({
      data: {
        name: "Daara Al-Nour • Touba",
        plan: "STARTER",
        type: "TRADITIONNEL",
      }
    });
    console.log("✅ Daara par défaut créé :", daara.name);
  }

  // 2. Créer l'utilisateur Administrateur / Serigne Daara par défaut
  const demoEmail = "admin@taleem.app";
  let user = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: demoEmail,
        password: hashedPassword,
        name: "El Hadji Mouhamadou Fall",
        role: "SERIGNE_DAARA",
        plan: "STARTER",
        daaraId: daara.id,
      }
    });
    console.log("✅ Compte Démo créé :", demoEmail, "| Mot de passe: password123");
  } else {
    // Mettre à jour le mot de passe s'il n'existait pas
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        daaraId: daara.id
      }
    });
    console.log("✅ Compte Démo mis à jour :", demoEmail);
  }

  // 3. Créer un deuxième compte de test
  const demoEmail2 = "daara@tahfiz.sn";
  const user2 = await prisma.user.findUnique({ where: { email: demoEmail2 } });
  if (!user2) {
    await prisma.user.create({
      data: {
        email: demoEmail2,
        password: hashedPassword,
        name: "Oustaz Cheikh Diallo",
        role: "SERIGNE_DAARA",
        plan: "STARTER",
        daaraId: daara.id,
      }
    });
    console.log("✅ Compte Démo 2 créé :", demoEmail2, "| Mot de passe: password123");
  }

  console.log("🎉 Seeding terminé avec succès ! La connexion fonctionnera immédiatement.");
}

main()
  .catch(e => console.error("❌ Erreur Seeding:", e))
  .finally(() => prisma.$disconnect());
