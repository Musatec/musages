import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClassesClient } from "@/components/modules/classes/classes-client";

export const dynamic = "force-dynamic";

export default async function ClassesPage({
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

  // Fetch all halqas with talibes count
  const halqas = await prisma.halqa.findMany({
    where: { daaraId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { talibes: { where: { deletedAt: null } } }
      }
    }
  });

  return (
    <ClassesClient 
      classes={halqas as any}
      subjects={[]}
    />
  );
}
