import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const email = "admin@taleem.app";
        const password = "password123";
        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Create a default Daara
        const daara = await prisma.daara.create({
            data: {
                name: "Daara Démo Taleem",
                plan: "BUSINESS"
            }
        });

        // 2. Create the user
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                daaraId: daara.id,
                role: "SUPER_ADMIN",
                plan: "BUSINESS"
            },
            create: {
                email,
                name: "Serigne Daara Taleem",
                password: hashedPassword,
                role: "SUPER_ADMIN",
                plan: "BUSINESS",
                daaraId: daara.id
            }
        });

        return NextResponse.json({
            message: "Compte admin créé avec succès !",
            credentials: {
                email: "admin@taleem.app",
                password: "password123"
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
