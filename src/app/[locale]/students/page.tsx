import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentsClient } from "@/components/modules/students/students-client";

export const dynamic = "force-dynamic";

export default async function StudentsPage({
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

  // Fetch all halqas
  const halqas = await prisma.halqa.findMany({
    where: { daaraId },
    orderBy: { name: "asc" }
  });

  // Fetch all talibes
  const talibes = await prisma.talibe.findMany({
    where: { daaraId, deletedAt: null },
    include: { halqa: true },
    orderBy: [
      { lastName: "asc" }
    ]
  });

  return (
    <StudentsClient 
      classes={halqas as any}
      students={talibes as any}
    />
  );
}
