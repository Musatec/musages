import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { 
    Package, History, 
    ArrowUpRight, ArrowDownRight, 
    User as UserIcon, Calendar,
    RefreshCcw,
    Activity,
    ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ElitePageHeader } from "@/components/ui/page-header";

export default async function InventoryMovementsPage() {
    const session = await auth();
    if (!session?.user?.storeId) redirect("/login");

    const storeId = session.user.storeId;

    // Fetching the last 50 stock movements with absolute safety types
    const movements = await (prisma.stockMovement as any).findMany({
        where: { storeId },
        include: {
            product: true,
            user: true
        },
        orderBy: { createdAt: "desc" },
        take: 50
    });

    return (
        <div className="flex-1 flex flex-col h-full bg-background transition-all duration-300 overflow-y-auto p-6 md:p-8 space-y-4 text-foreground">
            
            <ElitePageHeader 
                title="Traçabilité & Flux Systèmes."
                subtitle="Audit Logistique"
                description="Historique détaillé des mouvements de stock, traçabilité des opérateurs et monitoring des flux opérationnels en temps réel."
                actions={
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm italic">
                        <Activity className="w-4 h-4 text-primary animate-pulse" /> 
                        Monitoring Temps Réel
                    </div>
                }
            />

            {/* --- MAIN AUDIT LOG TABLE --- */}
            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden min-h-[600px] flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-separate border-spacing-0">
                        <thead className="bg-muted/10 text-muted-foreground text-[10px] font-bold uppercase tracking-widest border-b border-border">
                            <tr>
                                <th className="px-6 py-4">Horodatage</th>
                                <th className="px-6 py-4">Article</th>
                                <th className="px-6 py-4 text-center">Flux</th>
                                <th className="px-6 py-4">Description / Motif</th>
                                <th className="px-6 py-4 text-right">Opérateur</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {movements.map((m: any) => {
                                const isPositive = m.quantity > 0;
                                return (
                                    <tr key={m.id} className="group hover:bg-muted/20 transition-all">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-foreground text-xs">{new Date(m.createdAt).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono uppercase opacity-50">{new Date(m.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                 <div className="w-9 h-9 bg-muted border border-border rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                     <Package className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                                                 </div>
                                                 <div className="overflow-hidden">
                                                    <span className="text-sm font-bold uppercase tracking-tight text-foreground block truncate max-w-[250px]">{m.product?.name || "Produit Inconnu"}</span>
                                                    <p className="text-[9px] text-muted-foreground uppercase opacity-40 font-mono">ID: {m.productId?.slice(-6).toUpperCase() || "..."}</p>
                                                 </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col items-center gap-2">
                                                 <div className={cn(
                                                     "px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight flex items-center gap-2 shadow-sm border",
                                                     isPositive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                                 )}>
                                                     {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                                     <span className="font-bold text-base italic tabular-nums">{isPositive ? "+" : ""}{m.quantity}</span>
                                                 </div>
                                                 <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">{isPositive ? "Entrée Stock" : "Sortie Stock"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[11px] font-bold uppercase tracking-tight text-foreground">{m.reason}</span>
                                                <div className="h-[1px] w-8 bg-border" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                 <div className="text-right">
                                                     <p className="text-xs font-bold text-foreground uppercase tracking-tight">{m.user?.name || "Système"}</p>
                                                     <p className="text-[9px] text-muted-foreground uppercase font-bold opacity-30">Administrateur</p>
                                                 </div>
                                                 <div className="w-8 h-8 bg-muted border border-border rounded-full flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                                     {m.user?.name?.slice(0,2).toUpperCase() || "SY"}
                                                 </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {movements.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-32 text-center text-muted-foreground italic">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <ClipboardList className="w-12 h-12" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest letter-spacing-widest">Aucun flux logistique enregistré.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <footer className="pt-6 border-t border-border/50 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30 flex items-center justify-between">
                <span>Système d'Audit Intégré MINDOS</span>
                <span>Flux Opérationnels : {movements.length} / 50</span>
            </footer>
        </div>
    );
}
