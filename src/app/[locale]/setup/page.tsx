import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SetupClient } from "@/components/modules/setup/setup-client";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SetupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }
  if (session.user.daaraId) {
    redirect(`/${locale}/dashboard`);
  }

  if (session.user.role !== "SERIGNE_DAARA") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4 text-center">
          <h1 className="text-xl font-bold">Compte en attente de rattachement</h1>
          <p className="text-sm text-muted-foreground">
            Votre compte n&apos;est pas encore rattaché à un Daara. Contactez le responsable (Serigne Daara) pour finaliser votre accès.
          </p>
          <Link
            href={`/${locale}/home`}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return <SetupClient defaultName={session.user.name || undefined} />;
}
