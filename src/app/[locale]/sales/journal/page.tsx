import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getDailyMetrics } from "@/lib/actions/sales";
import SalesJournalClient from "../../../../components/modules/sales/sales-journal-client";

export default async function SalesJournalPage() {
    const session = await auth();
    const storeId = session?.user?.storeId;

    if (!storeId) {
        return <div className="p-20 text-center font-black uppercase opacity-20">Store non identifié</div>;
    }

    const initialSales = await prisma.sale.findMany({
        where: { storeId, deletedAt: null },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
        take: 50
    });

    const dailyMetrics = await getDailyMetrics();

    return (
        <SalesJournalClient 
            initialSales={JSON.parse(JSON.stringify(initialSales))} 
            dailyMetrics={dailyMetrics} 
        />
    );
}
