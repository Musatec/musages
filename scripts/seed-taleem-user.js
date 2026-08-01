const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const prisma = new PrismaClient();

async function seedTaleem() {
  console.log("🚀 Création du compte de test Directeur TaleemApp...");
  
  const email = "directeur@taleem.sn";
  const password = "password123";
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // 1. Créer l'école de test
    let school = await prisma.school.findFirst({
      where: { name: "Complexe Éducatif Franco-Arabe Taleem" }
    });

    if (!school) {
      school = await prisma.school.create({
        data: {
          name: "Complexe Éducatif Franco-Arabe Taleem",
          address: "Dakar, Sénégal",
          phone: "+221 77 123 45 67",
          plan: "BUSINESS"
        }
      });
      console.log("✅ École créée:", school.id);
    }

    // 2. Créer ou mettre à jour le directeur
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        name: "Directeur Mamadou Diallo",
        role: "DIRECTEUR",
        schoolId: school.id,
        hasSeenOnboarding: true,
      },
      create: {
        email,
        password: hashedPassword,
        name: "Directeur Mamadou Diallo",
        role: "DIRECTEUR",
        schoolId: school.id,
        hasSeenOnboarding: true,
      }
    });

    console.log("✅ Directeur créé avec succès:", user.email);

    // 3. Créer une classe de test
    let testClass = await prisma.class.findFirst({
      where: { schoolId: school.id, name: "CM2 Franco-Arabe" }
    });

    if (!testClass) {
      testClass = await prisma.class.create({
        data: {
          schoolId: school.id,
          name: "CM2 Franco-Arabe",
          level: "ELEMENTAIRE",
          monthlyFee: 35000
        }
      });
      console.log("✅ Classe créée:", testClass.name);
    }

    // 4. Créer 2 élèves de test avec numéros WhatsApp parents
    const existingStudent = await prisma.student.findFirst({
      where: { schoolId: school.id }
    });

    if (!existingStudent) {
      await prisma.student.create({
        data: {
          schoolId: school.id,
          classId: testClass.id,
          matricule: "MAT-2026-001",
          firstName: "Ousmane",
          lastName: "Ndiaye",
          parentName: "Mme Ndiaye",
          parentPhone: "+221770000000"
        }
      });

      await prisma.student.create({
        data: {
          schoolId: school.id,
          classId: testClass.id,
          matricule: "MAT-2026-002",
          firstName: "Aïssatou",
          lastName: "Sow",
          parentName: "M. Sow",
          parentPhone: "+221770000001"
        }
      });

      console.log("✅ Élèves de test créés");
    }

    console.log("\n=================================");
    console.log("🔑 IDENTIFIANTS DE TEST TALEEMAPP :");
    console.log(`📧 Email    : ${email}`);
    console.log(`🔐 Password : ${password}`);
    console.log("=================================\n");

  } catch (error) {
    console.error("❌ Erreur seed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTaleem();
