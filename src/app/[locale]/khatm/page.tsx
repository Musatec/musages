import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getKhatmRecords } from "@/lib/actions/khatm";
import { KhatmClient } from "@/components/modules/khatm/khatm-client";

export const dynamic = "force-dynamic";

export default async function KhatmPage({
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

  // Fetch Khatm records and Daara info
  const { records, daara } = await getKhatmRecords();

  // Fetch all Talibes in the Daara for the modal selection
  const talibes = await prisma.talibe.findMany({
    where: { daaraId, deletedAt: null },
    select: { id: true, firstName: true, lastName: true, matricule: true },
    orderBy: { lastName: "asc" }
  });

  const talibeOptions = talibes.map((t) => ({
    id: t.id,
    name: `${t.firstName} ${t.lastName}`,
    matricule: t.matricule
  }));

  return (
    <div className="space-y-6 w-full max-w-full">
      <KhatmClient 
        initialRecords={records as any} 
        talibeOptions={talibeOptions}
        daaraInfo={daara}
      />
    </div>
  );
}
