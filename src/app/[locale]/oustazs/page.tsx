import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OustazsClient } from "@/components/modules/oustazs/oustazs-client";
import { DAARA_MANAGER_ROLES, hasAnyRole } from "@/lib/action-context";

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
  if (!hasAnyRole(session.user.role, DAARA_MANAGER_ROLES)) redirect(`/${locale}/home`);

  const daaraId = session.user.daaraId;
  if (!daaraId) redirect(`/${locale}/setup`);

  // Récupération des informations du Daara
  const daara = await prisma.daara.findUnique({
    where: { id: daaraId }
  });

  // Récupération des Halqas et des Oustazs (strictement Espace Daara)
  const halqas = await prisma.halqa.findMany({
    where: { daaraId, space: "daara" },
    orderBy: { name: "asc" },
    include: {
      talibes: {
        where: { deletedAt: null, space: "daara" }
      },
      _count: {
        select: { talibes: { where: { deletedAt: null, space: "daara" } } }
      }
    }
  });

  // Récupération des comptes utilisateurs Oustazs (strictement Espace Daara)
  const oustazUsers = await prisma.user.findMany({
    where: { daaraId, space: "daara", role: "OUSTAZ", deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });

  return (
    <OustazsClient 
      daaraName={daara?.name || "LES OUSTAZ DU DAARA IBNOUL KHAYIM AL DIAWZIYA"}
      halqas={halqas as any}
      oustazUsers={oustazUsers as any}
    />
  );
}
