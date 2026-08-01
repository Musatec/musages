import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const email = "directeur@taleem.sn";
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultSchoolId = "school_demo_123";

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        name: "Directeur Mamadou Diallo",
        role: "ADMIN",
        schoolId: defaultSchoolId,
        storeId: defaultSchoolId,
        hasSeenOnboarding: true,
      },
      create: {
        email,
        password: hashedPassword,
        name: "Directeur Mamadou Diallo",
        role: "ADMIN",
        schoolId: defaultSchoolId,
        storeId: defaultSchoolId,
        hasSeenOnboarding: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Compte Démo TaleemApp prêt !",
      email: user.email,
      schoolId: user.schoolId
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      errorMsg: error.message || String(error)
    }, { status: 200 });
  }
}
