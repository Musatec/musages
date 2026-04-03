"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getFinancialReport } from "@/lib/actions/reports";
import { ReportsClient } from "@/components/modules/reports/reports-client";

export default async function ReportsPage({ params }: { params: Promise<{ locale: string }> }) {
    const session = await auth();
    const { locale } = await params;

    if (!session?.user?.storeId) {
        redirect(`/${locale}/login`);
    }

    const reportData = await getFinancialReport();

    if (reportData.error) {
        return (
            <div className="flex-1 flex items-center justify-center p-20 text-center opacity-20 uppercase font-black tracking-[0.5em]">
                {reportData.error}
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-hidden bg-background">
            <ReportsClient initialData={reportData as any} />
        </div>
    );
}
