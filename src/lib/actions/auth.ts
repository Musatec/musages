"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

export async function register(data: z.infer<typeof RegisterSchema>) {
  try {
    const validated = RegisterSchema.parse(data);
    const { email, password, name } = validated;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Cet email est déjà utilisé." };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "ADMIN", // First user is likely the admin/owner
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Erreur lors de l'inscription." };
  }
}
