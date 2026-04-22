import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/modules/dashboard/dashboard-client";
import { getSubscriptionData } from "@/lib/actions/subscription";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;
  
  if (!session) {
    redirect(`/${locale}/login`);
  }

  // Redirect to setup if no store is associated
  if (!session.user.storeId) {
    redirect(`/${locale}/setup`);
  }

  const storeId = session.user.storeId;

  // --- OPTIMIZED PARALLEL FETCHING ---
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // --- SAFE INDIVIDUAL FETCHING ---
  // On utilise des fonctions anonymes auto-exécutées pour isoler les erreurs de chaque bloc
  const fetchSafe = async (fn: () => Promise<any>, defaultValue: any) => {
    try {
      return await fn();
    } catch (e) {
      console.warn("[DASHBOARD_FETCH_ERROR]", e);
      return defaultValue;
    }
  };

  const salesAggregate = await fetchSafe(() => prisma.sale.aggregate({
    where: { storeId, createdAt: { gte: startOfMonth }, status: "COMPLETED" },
    _sum: { totalAmount: true }
  }), { _sum: { totalAmount: 0 } });

  const stockAlerts = await fetchSafe(() => prisma.stock.count({
    where: { storeId, quantity: { lte: 5 } }
  }), 0);

  const activeInventory = await fetchSafe(() => prisma.product.count({
    where: { storeId, deletedAt: null }
  }), 0);

  const incomeAggregate = await fetchSafe(() => prisma.transaction.aggregate({
    where: { storeId, type: "INCOME" },
    _sum: { amount: true }
  }), { _sum: { amount: 0 } });

  const expenseAggregate = await fetchSafe(() => prisma.transaction.aggregate({
    where: { storeId, type: "EXPENSE" },
    _sum: { amount: true }
  }), { _sum: { amount: 0 } });

  const totalEmployees = await fetchSafe(() => prisma.employee.count({
    where: { storeId, deletedAt: null }
  }), 0);

  const recentSales = await fetchSafe(() => prisma.sale.findMany({
    where: { storeId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    take: 5,
  }), []);

  const auditLogs = await fetchSafe(() => prisma.auditLog.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    take: 8,
  }), []);

  const totalSalesValue = salesAggregate._sum.totalAmount || 0;
  const netCashflow = (incomeAggregate._sum.amount || 0) - (expenseAggregate._sum.amount || 0);

  // --- TOP PRODUCTS ANALYSIS ---
  const topProductItems = await fetchSafe(() => prisma.saleItem.groupBy({
    by: ['productId'],
    where: { sale: { storeId, status: "COMPLETED" } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  }), []);

  const topProducts = await Promise.all(
    topProductItems.map(async (item: any) => {
        if (!item.productId) {
            return {
                name: "Article Manuel",
                image: null,
                quantity: item._sum.quantity || 0,
                revenue: 0
            };
        }
        const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { name: true, image: true, price: true }
        });
        return {
            name: product?.name || "Inconnu",
            image: product?.image || null,
            quantity: item._sum.quantity || 0,
            revenue: (item._sum.quantity || 0) * (product?.price || 0)
        };
    })
  );

  const stats = {
    totalSales: totalSalesValue,
    salesGrowth: 12, 
    activeInventory,
    stockAlerts,
    totalEmployees,
    netCashflow,
  };

  const store = await prisma.store.findUnique({
      where: { id: storeId }
  });

  // Serialize to avoid Date object issues
  const serializedRecentSales = (recentSales as any[]).map((sale: any) => ({
    ...sale,
    createdAt: sale.createdAt instanceof Date ? sale.createdAt.toISOString() : sale.createdAt,
  }));

  const metadata = {
      userName: session.user.name || "DG",
      enterpriseName: store?.name || "Votre Entreprise",
      topProducts: topProducts
  };

  const userSubscription = await getSubscriptionData();

  return (
    <DashboardClient 
      metadata={metadata}
      metrics={stats} 
      recentSales={serializedRecentSales as any} 
      userRole={session.user.role}
      userSubscription={userSubscription as any}
    />
  );
}
