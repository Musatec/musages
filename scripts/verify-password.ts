import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
    const hashedPassword = await bcrypt.hash("password123", 10);

    // 1. Ensure Daara Demo User
    let daara = await prisma.daara.findFirst({ where: { name: "Daara Ibnoul Khayim Al Diawziya" } });
    if (!daara) {
        daara = await prisma.daara.create({
            data: {
                name: "Daara Ibnoul Khayim Al Diawziya",
                plan: "PRO",
                config: {
                    logo: "/logo-daara-ibnoul-khayim.png",
                    slogan: "L'Excellence Coranique."
                }
            }
        });
    }

    let daaraUser = await prisma.user.findUnique({ where: { email: "admin@taleem.app" } });
    if (!daaraUser) {
        await prisma.user.create({
            data: {
                email: "admin@taleem.app",
                name: "El Hadji Mouhamadou Fall",
                password: hashedPassword,
                role: "SERIGNE_DAARA",
                daaraId: daara.id
            }
        });
    } else {
        await prisma.user.update({
            where: { email: "admin@taleem.app" },
            data: { password: hashedPassword, daaraId: daara.id }
        });
    }

    // 2. Ensure École Pathé Pogne User
    let patheUser = await prisma.user.findUnique({ where: { email: "directeur@pathepogne.sn" } });
    if (!patheUser) {
        await prisma.user.create({
            data: {
                email: "directeur@pathepogne.sn",
                name: "Directeur Pathé Pogne",
                password: hashedPassword,
                role: "SERIGNE_DAARA",
                daaraId: daara.id
            }
        });
        console.log("Created demo user: directeur@pathepogne.sn");
    } else {
        await prisma.user.update({
            where: { email: "directeur@pathepogne.sn" },
            data: { password: hashedPassword }
        });
        console.log("Updated demo user: directeur@pathepogne.sn");
    }

    console.log("✅ Demo accounts initialized with password123!");
}

main().finally(() => prisma.$disconnect());
