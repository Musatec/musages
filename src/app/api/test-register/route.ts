
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const email = `debug_${Date.now()}@test.com`;
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("[DEBUG] Attempting to create user:", email);

    const user = await prisma.user.create({
      data: {
        email,
        name: "Debug User",
        password: hashedPassword,
        role: "ADMIN",
        subscriptionStatus: "TRIALING",
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("[DEBUG] Create User Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      meta: error.meta
    }, { status: 500 });
  }
}
