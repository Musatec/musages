
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const email = "musatech0000@gmail.com";
    const password = "MusaProjet2026";
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Assurer qu'une boutique existe
    let store = await prisma.store.findFirst();
    if (!store) {
      store = await prisma.store.create({
        data: {
          name: "MindOS HQ",
          address: "Plateau, Abidjan",
          plan: "BUSINESS"
        }
      });
    }

    // 2. Créer l'utilisateur dans la table publique
    const user = await prisma.user.upsert({
      where: { email },
      update: { 
        password: hashedPassword,
        storeId: store.id,
        role: "ADMIN" 
      },
      create: {
        email,
        name: "Musa Admin",
        password: hashedPassword,
        role: "ADMIN",
        storeId: store.id
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Utilisateur synchronisé avec succès !",
      email: user.email,
      password: "MusaProjet2026 (Utilisez celui-ci)"
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
