import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TuitionClient } from "@/components/modules/tuition/tuition-client";

export const dynamic = "force-dynamic";

export default async function TuitionPage({
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
  const halqas = await prisma.halqa.findMany({
    where: { daaraId },
    orderBy: { name: "asc" }
  });

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  return (
    <TuitionClient 
      tuitions={[]} 
      classes={halqas as any}
      currentMonth={currentMonth}
      currentYear={currentYear}
      schoolName={session.user.name || "Daara"}
    />
  );
}
