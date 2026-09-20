import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OustazsClient } from "@/components/modules/oustazs/oustazs-client";

export const dynamic = "force-dynamic";

export default async function OustazsDirectoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;
  
  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  const daaraId = session.user.daaraId || session.user.id || "daara_demo_123";

  // Récupération des informations du Daara
  const daara = await prisma.daara.findUnique({
    where: { id: daaraId }
  });

  // Récupération des Halqas et des Oustazs
  const halqas = await prisma.halqa.findMany({
    where: { daaraId },
    orderBy: { name: "asc" },
    include: {
      talibes: {
        where: { deletedAt: null }
      },
      _count: {
        select: { talibes: { where: { deletedAt: null } } }
      }
    }
  });

  // Récupération des comptes utilisateurs Oustazs
  const oustazUsers = await prisma.user.findMany({
    where: { daaraId, role: "OUSTAZ" },
    orderBy: { name: "asc" }
  });

  return (
    <OustazsClient 
      daaraName={daara?.name || "LES OUSTAZ DU DAARA IBNOUL KHAYIM AL DIAWZIYA"}
      halqas={halqas as any}
      oustazUsers={oustazUsers as any}
    />
  );
}
