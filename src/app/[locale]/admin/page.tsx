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
    Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

import Link from "next/link";
import { AdminControls } from "@/components/modules/admin/admin-controls";

export default async function AdminDashboardPage() {
    const session = await auth();
    if (!session?.user?.storeId || session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const storeId = session.user.storeId;

    // --- ADMINISTRATIVE AUDIT DATA ---
    const [
        totalEmployees,
        auditLogs,
        stockAlerts,
        totalSales,
        totalExpenses
    ] = await Promise.all([
        prisma.employee.count({ where: { storeId, deletedAt: null } }),
        prisma.auditLog.findMany({
            where: { storeId },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
            take: 12
        }),
        prisma.stock.count({ where: { storeId, quantity: { lte: 5 } } }),
        prisma.sale.aggregate({
            where: { storeId, status: "COMPLETED" },
            _sum: { totalAmount: true }
        }),
        prisma.transaction.aggregate({
            where: { storeId, type: "EXPENSE" },
            _sum: { amount: true }
        })
    ]);

    const stats = [
        { label: "Masse Salariale", value: totalEmployees, icon: Users, color: "text-blue-500", desc: "Collaborateurs actifs" },
        { label: "Points de Rupture", value: stockAlerts, icon: AlertTriangle, color: "text-amber-500", desc: "Articles sous le seuil" },
        { label: "Volume d'Affaires", value: `${(totalSales._sum.totalAmount || 0).toLocaleString()} F`, icon: TrendingUp, color: "text-primary", desc: "Total historique" },
        { label: "Dépenses Totales", value: `${(totalExpenses._sum.amount || 0).toLocaleString()} F`, icon: Zap, color: "text-red-500", desc: "Charges opérationnelles" }
    ];

    return (
        <div className="flex-1 flex flex-col h-full bg-background transition-all duration-500 overflow-y-auto p-6 md:p-10 pb-32">
            <div className="max-w-[1400px] mx-auto w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-0.5 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Console d'Haute Direction</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter italic uppercase text-foreground">
                            Audit & <span className="text-primary italic">Infrastructures.</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-6 py-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Système Opérationnel</span>
                        </div>
                    </div>
                </header>

                {/* --- STRATEGIC OVERVIEW --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-card border border-white/5 p-8 rounded-[2.5rem] hover:border-primary/20 transition-all group overflow-hidden relative">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full" />
                             <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", s.color)}>
                                 <s.icon className="w-6 h-6" />
                             </div>
                             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">{s.label}</p>
                             <h2 className="text-2xl font-black italic tracking-tighter uppercase">{s.value}</h2>
                             <p className="text-[9px] font-bold text-muted-foreground/20 mt-2 uppercase tracking-widest">{s.desc}</p>
                        </div>
                    ))}
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
