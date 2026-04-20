import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { 
    LayoutDashboard, 
    Users, 
    ShieldCheck, 
    TrendingUp, 
    AlertTriangle, 
    Activity, 
    ShieldAlert,
    Server,
    Zap,
    Lock,
    Download,
    FileSpreadsheet,
    Globe
} from "lucide-react";
import { cn, formatMoney } from "@/lib/utils";

import Link from "next/link";
import { AdminControls } from "@/components/modules/admin/admin-controls";
import { EliteMetricCard } from "@/components/ui/metric-card";
import { ElitePageHeader } from "@/components/ui/page-header";

export default async function AdminDashboardPage() {
    const session = await auth();
    const CEO_EMAIL = "musatech0000@gmail.com";
    
    // Safety check for access
    if (!session?.user?.id) {
        redirect("/login");
    }

    // --- AUTO-PROMOTION & ROLE CHECK ---
    let userRole = session.user.role;
    const isCEO = session.user.email === CEO_EMAIL;

    if (isCEO && userRole !== "SUPER_ADMIN") {
        try {
            await prisma.user.update({
                where: { email: CEO_EMAIL },
                data: { role: "SUPER_ADMIN" }
            });
            userRole = "SUPER_ADMIN";
            console.log("[ADMIN] CEO promoted to SUPER_ADMIN on-the-fly.");
        } catch (e) {
            console.error("[ADMIN] Failed to auto-promote CEO:", e);
        }
    }

    // Only SUPER_ADMIN or ADMIN can access this page
    if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
        redirect("/dashboard");
    }

    const storeId = session.user.storeId;
    const isSuperAdmin = userRole === "SUPER_ADMIN";
    
    if (!storeId && !isSuperAdmin) {
        return (
            <div className="flex-1 flex items-center justify-center p-20 text-center opacity-20 uppercase font-black tracking-[0.5em]">
                Boutique non identifiée
            </div>
        );
    }

    // --- ADMINISTRATIVE AUDIT DATA (Sequential for stability) ---
    let totalEmployees = 0;
    let auditLogs: any[] = [];
    let stockAlerts = 0;
    let totalSales: any[] = [];
    let totalExpenses: any[] = [];
    
    // --- GLOBAL SAAS METRICS ---
    let globalStoresCount = 0;
    let globalRevenue = 0;
    let globalUsersCount = 0;
    let recentStores: any[] = [];

    try {
        // Local metrics
        totalEmployees = await prisma.employee.count({ 
            where: { 
                storeId: isSuperAdmin ? undefined : storeId as string, 
                deletedAt: null 
            } 
        });
        
        // Logs: Global if SuperAdmin, Local if Admin
        auditLogs = await prisma.auditLog.findMany({
            where: isSuperAdmin ? {} : { storeId: storeId as string },
            include: { 
                user: { select: { name: true } },
                store: { select: { name: true } } // Added store name for global view
            },
            orderBy: { createdAt: "desc" },
            take: 12
        });

        stockAlerts = await prisma.product.count({ 
            where: { 
                storeId: isSuperAdmin ? undefined : storeId as string, 
                deletedAt: null,
                stocks: { 
                    some: { 
                        quantity: { lte: 5 } 
                    } 
                } 
            } 
        });

        const salesAggregate = await prisma.sale.aggregate({
            where: { 
                storeId: isSuperAdmin ? undefined : storeId as string, 
                status: "COMPLETED", 
                deletedAt: null 
            },
            _sum: { totalAmount: true }
        });
        totalSalesAmount = salesAggregate._sum.totalAmount || 0;

        const expensesAggregate = await prisma.transaction.aggregate({
            where: { 
                storeId: isSuperAdmin ? undefined : storeId as string, 
                type: "EXPENSE" 
            },
            _sum: { amount: true }
        });
        totalExpensesAmount = expensesAggregate._sum.amount || 0;

        // --- GLOBAL SAAS METRICS ---
        globalStoresCount = await prisma.store.count({ where: { deletedAt: null } });
        globalUsersCount = await prisma.user.count({ where: { deletedAt: null } });
        
        const globalRevenueAggregate = await prisma.sale.aggregate({
            where: { status: "COMPLETED", deletedAt: null },
            _sum: { totalAmount: true }
        });
        globalRevenue = globalRevenueAggregate._sum.totalAmount || 0;

        recentStores = await prisma.store.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 5
        });

    } catch (e: any) {
        console.error("ADMIN DATA FETCH ERROR:", e.message);
    }

    const stats = [
        { label: "Masse Salariale", value: totalEmployees, icon: Users, color: "text-blue-500", desc: "Collaborateurs actifs" },
        { label: "Points de Rupture", value: stockAlerts, icon: AlertTriangle, color: "text-amber-500", desc: "Articles sous le seuil" },
        { label: "Volume d'Affaires", value: `${formatMoney(totalSalesAmount)} F`, icon: TrendingUp, color: "text-primary", desc: "Total historique" },
        { label: "Dépenses Totales", value: `${formatMoney(totalExpensesAmount)} F`, icon: Zap, color: "text-red-500", desc: "Charges opérationnelles" }
    ];

    return (
        <div className="flex-1 flex flex-col h-full bg-background transition-all duration-500 overflow-y-auto p-6 md:p-10 pb-32">
            <div className="max-w-[1400px] mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                <ElitePageHeader 
                    title={isSuperAdmin ? "Console Propriétaire SaaS." : "Audit & Infrastructure."}
                    subtitle={isSuperAdmin ? "Pilotage & Noyau Infrastructure" : "Console de Haute Direction"}
                    description={isSuperAdmin 
                        ? "Maîtrise totale de l'écosystème Musages. Supervisez toutes les boutiques, les revenus consolidés et l'état de l'infrastructure globale."
                        : "Supervisez l'intégrité du système, gérez les accès critiques et analysez les performances globales de l'infrastructure."
                    }
                    actions={
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-muted/20 border border-border rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-muted/40 transition-all">
                                 <ShieldAlert className="w-4 h-4 text-primary" /> Sécurité
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                                 <Download className="w-4 h-4" /> Rapport Global
                            </button>
                        </div>
                    }
                />

                {/* --- GLOBAL SAAS CONTROL CENTER --- */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary italic flex items-center gap-3 px-4">
                        <Globe className="w-4 h-4" /> Supervision Réseau SaaS
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <EliteMetricCard 
                            label="Boutiques Actives" 
                            value={globalStoresCount} 
                            icon={Server} 
                            variant="blue"
                            sub="Enseignes connectées"
                        />
                        <EliteMetricCard 
                            label="Revenus Consolidés" 
                            value={`${formatMoney(globalRevenue)} F`} 
                            icon={TrendingUp} 
                            variant="emerald"
                            sub="CA global du réseau"
                        />
                        <EliteMetricCard 
                            label="Écosystème Utilisateurs" 
                            value={globalUsersCount} 
                            icon={Users} 
                            variant="purple"
                            sub="Comptes actifs"
                        />
                        <EliteMetricCard 
                            label="État du Cloud" 
                            value="Stable" 
                            icon={Zap} 
                            variant="orange"
                            sub="Infrastructure Musages"
                        />
                    </div>
                </div>

                <div className="h-[1px] bg-white/5 mx-10" />

                {/* --- LOCAL STORE OVERVIEW --- */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/60 italic flex items-center gap-3 px-4">
                        <Activity className="w-4 h-4" /> Analyse Direction Locale
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <EliteMetricCard 
                            label="Masse Salariale" 
                            value={totalEmployees} 
                            icon={Users} 
                            variant="blue"
                            sub="Personnel actif"
                        />
                        <EliteMetricCard 
                            label="Points de Rupture" 
                            value={stockAlerts} 
                            icon={AlertTriangle} 
                            variant="amber"
                            sub="Stock critique"
                        />
                        <EliteMetricCard 
                            label="Volume d'Affaires" 
                            value={`${formatMoney(totalSalesAmount)} F`} 
                            icon={TrendingUp} 
                            variant="orange"
                            sub="Total historique"
                        />
                        <EliteMetricCard 
                            label="Charges Locales" 
                            value={`${formatMoney(totalExpensesAmount)} F`} 
                            icon={ShieldAlert} 
                            variant="red"
                            sub="Dépenses enregistrées"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Pulsations Système (Audit Logs) */}
                    <div className="lg:col-span-8 space-y-6">
                         <div className="flex items-center justify-between px-4">
                             <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground italic flex items-center gap-3">
                                 <Activity className="w-4 h-4 text-primary" /> Journal d'Audit Système
                             </h3>
                             <Link href="/inventory/movements" className="text-[10px] font-black uppercase text-primary italic underline underline-offset-4 cursor-pointer hover:opacity-70 transition-opacity">Voir l'Archive Complète</Link>
                         </div>
                         
                         <div className="bg-card border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl p-4">
                             <div className="divide-y divide-white/5">
                                 {auditLogs.map((log) => (
                                     <div key={log.id} className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-all group">
                                         <div className="flex items-center gap-6">
                                             <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[10px] font-black text-primary group-hover:bg-primary group-hover:text-black transition-all">
                                                 {log.user?.name?.slice(0,2).toUpperCase()}
                                             </div>
                                             <div className="space-y-1">
                                                 <p className="text-[11px] font-black uppercase italic tracking-tighter text-foreground group-hover:text-primary transition-colors">
                                                      {log.action.replace(/_/g, " ")} 
                                                      <span className="text-muted-foreground/40 normal-case italic font-medium ml-2">— {JSON.stringify(log.details)}</span>
                                                  </p>
                                                  <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground/20 uppercase tracking-widest">
                                                      <Users className="w-3 h-3" /> {log.user?.name} 
                                                      {isSuperAdmin && (
                                                          <>
                                                              <span className="mx-2 text-primary/30">•</span>
                                                              <Server className="w-3 h-3 text-primary/40" /> 
                                                              <span className="text-primary/60">{log.store?.name}</span>
                                                          </>
                                                      )}
                                                      <span className="mx-2">•</span>
                                                      {new Date(log.createdAt).toLocaleTimeString()}
                                                  </div>
                                             </div>
                                         </div>
                                         <ShieldCheck className="w-4 h-4 text-emerald-500/20 group-hover:text-emerald-500 transition-colors" />
                                     </div>
                                 ))}
                                 {auditLogs.length === 0 && (
                                     <div className="py-20 text-center text-[10px] font-black uppercase tracking-widest opacity-20 italic">Aucune activité enregistrée.</div>
                                 )}
                             </div>
                         </div>
                    </div>

                    {/* Power Controls */}
                    <div className="lg:col-span-4 space-y-8">
                         <div className="bg-gradient-to-br from-primary to-orange-700 p-8 rounded-[3rem] shadow-2xl shadow-primary/20 space-y-6 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
                             
                             <div className="flex items-center gap-3 text-black/60">
                                 <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                                 <span className="text-[10px] font-black uppercase tracking-[0.4em]">Maintenance & Noyau</span>
                             </div>

                             <AdminControls />
                             
                             <p className="text-[9px] font-black uppercase text-black/40 leading-relaxed text-center px-4 tracking-widest">
                                 Attention : Toute action sur le noyau peut entraîner une déconnexion massive des terminaux.
                             </p>
                             </div>
                             
                            <div className="p-8 bg-card border border-white/5 rounded-[3rem] space-y-6">
                             <div className="flex items-center justify-between">
                                 <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Centrales Connectées</h3>
                                 <Link href="/admin/stores" className="text-[9px] font-bold text-primary hover:underline italic">Gérer</Link>
                             </div>
                             <div className="space-y-3">
                                 {recentStores.map((store) => (
                                     <div key={store.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                                         <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                                 {store.name.slice(0,2).toUpperCase()}
                                             </div>
                                             <div className="space-y-0.5">
                                                 <p className="text-[10px] font-bold text-foreground group-hover:text-primary transition-colors">{store.name}</p>
                                                 <p className="text-[8px] font-medium text-muted-foreground uppercase tracking-widest">{store.plan}</p>
                                             </div>
                                         </div>
                                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                     </div>
                                 ))}
                                 {recentStores.length === 0 && (
                                     <div className="py-4 text-center text-[9px] font-black uppercase opacity-20 italic">Aucune boutique.</div>
                                 )}
                             </div>
                         </div>

                         <div className="p-8 bg-card border border-white/5 rounded-[3rem] space-y-6">
                             <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Infrastructures Réseau</h3>
                             <div className="space-y-4">
                                 <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
                                      <div className="flex items-center gap-3">
                                          <Server className="w-4 h-4 text-primary" />
                                          <span className="text-[9px] font-black uppercase tracking-[0.1em]">Bases de Données</span>
                                      </div>
                                      <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest italic">Stable</span>
                                 </div>
                                 <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
                                      <div className="flex items-center gap-3">
                                          <Zap className="w-4 h-4 text-primary" />
                                          <span className="text-[9px] font-black uppercase tracking-[0.1em]">API Intel Gemini</span>
                                      </div>
                                      <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest italic">Sync</span>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
