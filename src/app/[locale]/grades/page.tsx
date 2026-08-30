import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GradesClient } from "@/components/modules/grades/grades-client";

export const dynamic = "force-dynamic";

export default async function GradesPage({
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

  // Fetch all halqas for filtering
  const halqasRaw = await prisma.halqa.findMany({
    where: { daaraId },
    orderBy: { name: "asc" }
  });

  const allTalibes = await prisma.talibe.findMany({
    where: { daaraId, deletedAt: null },
    orderBy: { firstName: "asc" }
  });

  const classes = halqasRaw.map(c => ({
    ...c,
    students: allTalibes.filter(s => s.halqaId === c.id)
  }));

  return (
    <GradesClient 
      classes={classes as any}
      subjects={[]}
      recentGrades={[]}
      schoolName={session.user.name || "Daara"}
    />
  );
}
