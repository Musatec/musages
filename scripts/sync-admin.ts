import dotenv from "dotenv";
dotenv.config();
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function syncAdmin() {
  const email = (process.env.ADMIN_EMAIL || "petitmessi2020@gmail.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Password123!";
  const hashedPassword = await bcrypt.hash(password, 10);

  let daara = await prisma.daara.findFirst({
    where: { name: { contains: "Ibnoul Khayim" } }
  });
  if (!daara) {
    daara = await prisma.daara.findFirst();
  }
  if (!daara) {
    daara = await prisma.daara.create({
      data: {
        name: "Daara Ibnoul Khayim Al Jawziya",
        plan: "STARTER",
        type: "TRADITIONNEL"
      }
    });
  } else if (!daara.name.includes("Ibnoul Khayim")) {
    daara = await prisma.daara.update({
      where: { id: daara.id },
      data: { name: "Daara Ibnoul Khayim Al Jawziya" }
    });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        password: hashedPassword,
        emailVerified: new Date(),
        daaraId: daara.id,
        role: "SERIGNE_DAARA",
        deletedAt: null
      }
    });
    console.log("SUCCESS_UPDATE:", updated.email, "Daara:", daara.name);
  } else {
    const created = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: "Direction Générale",
        emailVerified: new Date(),
        daaraId: daara.id,
        role: "SERIGNE_DAARA"
      }
    });
    console.log("SUCCESS_CREATE:", created.email, "Daara:", daara.name);
  }
}

syncAdmin()
  .catch((err) => {
    console.error("SYNC_ERROR:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
