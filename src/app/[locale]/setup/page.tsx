import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { StoreOnboarding } from "@/components/modules/store/store-onboarding";

export default async function SetupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  if (!session) {
    redirect(`/${locale}/login`);
  }

  if (session.user.storeId) {
    redirect(`/${locale}/dashboard`);
  }

  return <StoreOnboarding />;
}
