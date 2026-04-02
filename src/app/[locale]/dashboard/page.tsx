import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/modules/dashboard/dashboard-client";

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

  const [
    salesAggregate,
    stockAlerts,
    activeInventory,
    incomeAggregate,
    expenseAggregate,
    totalEmployees,
    recentSales,
    auditLogs
  ] = await Promise.all([
    // 1. Total Sales (Aggregated)
    prisma.sale.aggregate({
        where: { storeId, createdAt: { gte: startOfMonth }, status: "COMPLETED" },
        _sum: { totalAmount: true }
    }),
    // 2. Stock Alerts
    prisma.stock.count({
        where: { storeId, quantity: { lte: 5 } }
    }),
    // 3. Active Inventory
    prisma.product.count({
        where: { storeId, deletedAt: null }
    }),
    // 4. Income Aggregate
    prisma.transaction.aggregate({
        where: { storeId, type: "INCOME" },
        _sum: { amount: true }
    }),
    // 5. Expense Aggregate
    prisma.transaction.aggregate({
        where: { storeId, type: "EXPENSE" },
        _sum: { amount: true }
    }),
    // 6. Employees
    prisma.employee.count({
        where: { storeId, deletedAt: null }
    }),
    // 7. Recent Sales
    prisma.sale.findMany({
        where: { storeId, status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 5,
    }),
    // 8. Audit Logs
    prisma.auditLog.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        take: 8,
    })
  ]);

  const totalSalesValue = salesAggregate._sum.totalAmount || 0;
  const netCashflow = (incomeAggregate._sum.amount || 0) - (expenseAggregate._sum.amount || 0);

  const stats = {
    totalSales: totalSalesValue,
    salesGrowth: 12, 
    activeInventory,
    stockAlerts,
    totalEmployees,
    netCashflow,
  };

  // Serialize to avoid Date object issues
  const serializedRecentSales = recentSales.map(sale => ({
    ...sale,
    createdAt: sale.createdAt.toISOString(),
  }));

  const serializedAuditLogs = auditLogs.map(log => ({
    ...log,
    createdAt: log.createdAt.toISOString(),
  }));

  return (
    <DashboardClient 
      metrics={stats} 
      recentSales={serializedRecentSales as any} 
    />
  );
}
