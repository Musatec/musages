import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getDailyMetrics } from "@/lib/actions/sales";
import SalesJournalClient from "@/components/modules/sales/sales-journal-client";

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

    let initialSales = [];
    try {
        initialSales = await prisma.sale.findMany({
            where: { 
                storeId, 
                deletedAt: null,
                createdAt: { gte: dayStart, lte: dayEnd }
            },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: "desc" }
        });
    } catch (error: any) {
        console.error("PRISMA ERROR:", error.code, error.message);
        // On log dans un fichier pour que je puisse le lire
        const fs = require('fs');
        fs.appendFileSync('prisma-error.log', `[${new Date().toISOString()}] ${error.code}: ${error.message}\n`);
        return <div className="p-20 text-center">
            <h1 className="text-red-500 font-black">ERREUR BASE DE DONNÉES</h1>
            <p className="text-xs opacity-50 italic">{error.message}</p>
        </div>;
    }

    const dailyMetrics = await getDailyMetrics(targetDate);

    return (
        <SalesJournalClient 
            key={targetDate.toISOString()}
            initialSales={JSON.parse(JSON.stringify(initialSales))} 
            dailyMetrics={dailyMetrics} 
            currentDate={targetDate.toISOString()}
        />
    );
}
