import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClassesClient } from "@/components/modules/classes/classes-client";
import { DAARA_MANAGER_ROLES, getActiveSpace, hasAnyRole } from "@/lib/action-context";

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
  if (!hasAnyRole(session.user.role, DAARA_MANAGER_ROLES)) redirect(`/${locale}/home`);

  const daaraId = session.user.daaraId;
  if (!daaraId) redirect(`/${locale}/setup`);
  const space = await getActiveSpace();

  // Fetch daara info & all halqas/classes for the active space in parallel
  const [daara, halqas] = await Promise.all([
    prisma.daara.findUnique({
      where: { id: daaraId },
      select: { name: true }
    }),
    prisma.halqa.findMany({
      where: { daaraId, space },
      orderBy: { name: "asc" },
      include: {
        talibes: {
          where: { deletedAt: null, space },
          orderBy: [{ lastName: "asc" }, { firstName: "asc" }]
        },
        _count: {
          select: { talibes: { where: { deletedAt: null, space } } }
        }
      }
    })
  ]);

  return (
    <ClassesClient
      daaraName={daara?.name || "مدرسة ابن قيم الجوزية لتحفيظ القرآن الكريم والدراسات الإسلامية"}
      classes={halqas as any}
      subjects={[]}
    />
  );
}
