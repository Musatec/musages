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

  // Fetch daara info & all halqas with their talibes
  const daara = await prisma.daara.findUnique({
    where: { id: daaraId }
  });

  let halqas = await prisma.halqa.findMany({
    where: { daaraId },
    orderBy: { name: "asc" },
    include: {
      talibes: {
        where: { deletedAt: null },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }]
      },
      _count: {
        select: { talibes: { where: { deletedAt: null } } }
      }
    }
  });

  // Auto-seed default 7 Halqas if missing
  const defaultHalqas = [
    { name: "حلقة أستاذ محمد انضاو (Coran / القرآن)", level: "MÉMORISATION (Hifz)", oustazName: "Mouhamed Ndaw", daaraId },
    { name: "حلقة أستاذ موسى انضاو (Coran / القرآن)", level: "MÉMORISATION (Hifz)", oustazName: "Moussa Ndaw", daaraId },
    { name: "حلقة عمر بن الخطاب (أستاذ أمل)", level: "MÉMORISATION (Hifz)", oustazName: "Moustapha Amar", daaraId },
    { name: "حلقة أستاذ محمد توبر (Coran / القرآن)", level: "MÉMORISATION (Hifz)", oustazName: "Mouhamed Top", daaraId },
    { name: "حلقة أستاذ إمباي جِي (Initiation / التهجي)", level: "DÉBUTANT (Tahajji)", oustazName: "Mbaye Dieye", daaraId },
    { name: "حلقة سيدة مَام بَوصَ دَياخَاتِ (Coran / القرآن)", level: "MÉMORISATION (Hifz)", oustazName: "Mame Bousso Diakhate", daaraId },
    { name: "حلقة سيدة حوا دَياخَاتِ (Initiation / التهجي)", level: "DÉBUTANT (Tahajji)", oustazName: "Awa Diakhate", daaraId },
  ];

  let hasCreated = false;
  for (const h of defaultHalqas) {
    const exists = halqas.some(
      (ex) => ex.oustazName?.toLowerCase() === h.oustazName.toLowerCase() || ex.name.includes(h.oustazName)
    );
    if (!exists) {
      await prisma.halqa.create({ data: h });
      hasCreated = true;
    }
  }

  if (hasCreated) {
    halqas = await prisma.halqa.findMany({
      where: { daaraId },
      orderBy: { name: "asc" },
      include: {
        talibes: {
          where: { deletedAt: null },
          orderBy: [{ lastName: "asc" }, { firstName: "asc" }]
        },
        _count: {
          select: { talibes: { where: { deletedAt: null } } }
        }
      }
    });
  }

  return (
    <ClassesClient 
      daaraName={daara?.name || "مدرسة ابن قيم الجوزية لتحفيظ القرآن الكريم والدراسات الإسلامية"}
      classes={halqas as any}
      subjects={[]}
    />
  );
}
