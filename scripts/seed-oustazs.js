const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const db = new Database(dbPath);
const adapter = new PrismaBetterSqlite3({ db, url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const oustazs = [
  {
    name: "OUSTAZ MOUHAMED NDAW",
    oustazName: "أستاذ : Mouhamed Ndaw",
    halqaName: "حلقة أستاذ محمد انضاو (Coran / القرآن)",
    phone: "78 190 01 53",
    level: "MÉMORISATION (Hifz / القرآن)",
    status: "INTERNE"
  },
  {
    name: "OUSTAZ MOUSSA NDAW",
    oustazName: "أستاذ : Moussa Ndaw",
    halqaName: "حلقة أستاذ موسى انضاو (Coran / القرآن)",
    phone: "76 763 28 64",
    level: "MÉMORISATION (Hifz / القرآن)",
    status: "INTERNE"
  },
  {
    name: "OUSTAZ MOUSTAPHA AMAR",
    oustazName: "أستاذ : Moustapha Amar",
    halqaName: "حلقة عمر بن الخطاب (أستاذ أمل / AMAR)",
    phone: "75 740 10 70",
    level: "MÉMORISATION (Hifz / القرآن)",
    status: "INTERNE"
  },
  {
    name: "OUSTAZ MOUHAMED TOP",
    oustazName: "أستاذ : Mouhamed Top",
    halqaName: "حلقة أستاذ محمد توبر (Coran / القرآن)",
    phone: "77 953 72 76",
    level: "MÉMORISATION (Hifz / القرآن)",
    status: "INTERNE"
  },
  {
    name: "OUSTAZ MBAYE DIEYE",
    oustazName: "أستاذ : Mbaye Dieye",
    halqaName: "حلقة أستاذ إمباي جِي (Initiation / التهجي)",
    phone: "70 688 95 70",
    level: "DÉBUTANT (Tahajji / التهجي)",
    status: "EXTERNE"
  },
  {
    name: "SEYDA MAME BOUSSO DIAKHATE",
    oustazName: "سيدة : Mame Bousso Diakhate",
    halqaName: "حلقة سيدة حوا حجي (Coran / القرآن)",
    phone: "78 317 06 80",
    level: "MÉMORISATION (Hifz / القرآن)",
    status: "INTERNE"
  },
  {
    name: "SEYDA AWA DIAKHATE",
    oustazName: "سيدة : Awa Diakhate",
    halqaName: "حلقة سيدة حوا (Initiation / التهجي)",
    phone: "78 117 09 26",
    level: "DÉBUTANT (Tahajji / التهجي)",
    status: "INTERNE"
  }
];

async function main() {
  console.log("🌱 Début du peuplement des 7 Oustazs & Halqas du Daara Ibnoul Khayim...");

  // Récupérer le Daara démo ou le premier Daara
  let daara = await prisma.daara.findFirst();
  if (!daara) {
    daara = await prisma.daara.create({
      data: {
        id: "daara_demo_123",
        name: "مدرسة ابن قيم الجوزية لتحفيظ القرآن الكريم والدراسات الإسلامية",
        city: "Touba",
        country: "Sénégal"
      }
    });
  }

  const daaraId = daara.id;
  console.log(`📌 Daara cible ID: ${daaraId}`);

  for (const item of oustazs) {
    // 1. Créer ou mettre à jour la Halqa
    const existingHalqa = await prisma.halqa.findFirst({
      where: {
        daaraId,
        oustazName: item.oustazName
      }
    });

    let halqaId;
    if (existingHalqa) {
      halqaId = existingHalqa.id;
      await prisma.halqa.update({
        where: { id: halqaId },
        data: {
          name: item.halqaName,
          level: item.level,
        }
      });
      console.log(`✅ Halqa mise à jour: ${item.halqaName}`);
    } else {
      const newHalqa = await prisma.halqa.create({
        data: {
          daaraId,
          name: item.halqaName,
          level: item.level,
          oustazName: item.oustazName
        }
      });
      halqaId = newHalqa.id;
      console.log(`🎉 Halqa créée: ${item.halqaName}`);
    }

    // 2. Créer ou mettre à jour l'utilisateur Oustaz
    const email = `${item.name.toLowerCase().replace(/[^a-z]/g, "")}@daara.net`;
    const existingUser = await prisma.user.findFirst({
      where: { email }
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          name: item.name,
          email,
          phone: item.phone,
          role: "OUSTAZ",
          daaraId
        }
      });
      console.log(`👤 Utilisateur Oustaz créé: ${item.name} (${item.phone})`);
    }
  }

  console.log("✨ Peuplement des 7 Oustazs et Halqas terminé avec succès !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du peuplement:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
