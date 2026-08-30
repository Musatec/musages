import { auth } from "@/auth";
import { redirect } from "next/navigation";

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
  if (session.user.daaraId) {
    redirect(`/${locale}/dashboard`);
  }

  redirect(`/${locale}/dashboard`);
}
