import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getDailyMetrics } from "@/lib/actions/sales";
import SalesJournalClient from "../../../../components/modules/sales/sales-journal-client";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SalesJournalPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const dateQuery = typeof searchParams.date === 'string' ? searchParams.date : undefined;
    const targetDate = dateQuery ? new Date(dateQuery) : new Date();
    
    const dayStart = new Date(targetDate);
    dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23,59,59,999);

    const session = await auth();
    const storeId = session?.user?.storeId;

    if (!storeId) {
        return <div className="p-20 text-center font-black uppercase opacity-20">Store non identifié</div>;
    }

    const initialSales = await prisma.sale.findMany({
        where: { 
            storeId, 
            deletedAt: null,
            createdAt: { gte: dayStart, lte: dayEnd }
        },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: "desc" }
    });

    const dailyMetrics = await getDailyMetrics(targetDate);

    return (
        <SalesJournalClient 
            initialSales={JSON.parse(JSON.stringify(initialSales))} 
            dailyMetrics={dailyMetrics} 
            currentDate={targetDate.toISOString()}
        />
    );
}
