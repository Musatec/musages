import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const email = "admin@taleem.app";
        const password = "password123";
        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Create a default school
        const school = await prisma.school.create({
            data: {
                name: "TaleemApp École Démo",
                plan: "BUSINESS"
            }
        });

        // 2. Create the user
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                schoolId: school.id,
                role: "SUPER_ADMIN",
                plan: "BUSINESS"
            },
            create: {
                email,
                name: "Directeur Taleem",
                password: hashedPassword,
                role: "SUPER_ADMIN",
                plan: "BUSINESS",
                schoolId: school.id
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
