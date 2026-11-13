import dotenv from "dotenv";
dotenv.config();
import { prisma } from "../src/lib/prisma";

async function renameAdmin() {
  const email = (process.env.ADMIN_EMAIL || "petitmessi2020@gmail.com").trim().toLowerCase();
  const updated = await prisma.user.update({
    where: { email },
    data: { name: "Direction Générale" }
  });
  console.log("RENAME_SUCCESS:", updated.email, "=>", updated.name);
}

renameAdmin()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
