import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CasSociauxClient } from "@/components/modules/cas-sociaux/cas-sociaux-client";
import { getSocialCases } from "@/lib/actions/cas-sociaux";
import { DAARA_MANAGER_ROLES, hasAnyRole } from "@/lib/action-context";

export const dynamic = "force-dynamic";

export default async function CasSociauxPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }
  if (!hasAnyRole(session.user.role, DAARA_MANAGER_ROLES)) {
    redirect(`/${locale}/home`);
  }
  if (!session.user.daaraId) {
    redirect(`/${locale}/setup`);
  }

  const data = await getSocialCases();
  return (
    <div className="space-y-6 w-full max-w-full">
      <CasSociauxClient 
        initialSocialCases={data.socialCases || []} 
        initialStats={data.stats}
      />
    </div>
  );
}
