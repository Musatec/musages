"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { cn, formatMoney } from "@/lib/utils";
import { 
    Users, Plus, Search, 
    Wallet, Banknote, 
    Clock, Phone, 
    ShieldCheck, 
    UserIcon, Trash2, UserPlus,
    MoreHorizontal,
    ArrowUpRight,
    RefreshCcw,
    Filter,
    Loader2
} from "lucide-react";
import { 
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger 
} from "@/components/ui/sheet";
import { getEmployees, createEmployee, giveAdvance, payRestSalary } from "@/lib/actions/hr";
import { HRData, EmployeeFormData } from "@/types/hr";
import { TopLoader } from "@/components/ui/top-loader";
import { toast } from "sonner";
import { EliteMetricCard } from "@/components/ui/metric-card";
import { ElitePageHeader } from "@/components/ui/page-header";

export default function HRPage() {
    const [loading, setLoading] = useState(true);
    const [isActionPending, setIsActionPending] = useState(false);
    const [data, setData] = useState<HRData | null>(null);
    const [moduleUnavailable, setModuleUnavailable] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [openAdd, setOpenAdd] = useState(false);

    const [formData, setFormData] = useState<EmployeeFormData>({ firstName: "", lastName: "", email: "", phone: "", salary: "" });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getEmployees();
            if (!res.success) {
                setData(null);
                setModuleUnavailable(res.error || "Le registre RH n'est pas disponible.");
                return;
            }
            setData(res as unknown as HRData);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);


    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsActionPending(true);
        try {
            const res = await createEmployee({ ...formData, salary: Number(formData.salary) });
            if (res.success) {
                toast.success("Nouveau collaborateur enregistré !");
                setOpenAdd(false);
                setFormData({ firstName: "", lastName: "", email: "", phone: "", salary: "" });
                fetchData();
            } else toast.error(res.error);
        } finally { setIsActionPending(false); }
    };

    const handleAdvance = async (eId: string, name: string) => {
        const amount = prompt(`Montant de l'acompte pour ${name} :`);
        if (!amount || isNaN(Number(amount))) return;
        setIsActionPending(true);
        try {
            const res = await giveAdvance(eId, Number(amount));
            if (res.success) { toast.success(`Acompte enregistré.`); fetchData(); }
            else toast.error(res.error);
        } finally { setIsActionPending(false); }
    };

    const handleSalaryPayment = async (eId: string, name: string, net: number) => {
        if (!confirm(`Confirmer le paiement du solde de salaire pour ${name} ? (${formatMoney(net)} F)`)) return;
        setIsActionPending(true);
        try {
            const res = await payRestSalary(eId);
            if (res.success) { toast.success(`Salaire soldé.`); fetchData(); }
            else toast.error(res.error);
        } finally { setIsActionPending(false); }
    };

    const filteredEmployees = useMemo(() => {
        return data?.employees?.filter((e: any) => (e.firstName + " " + e.lastName).toLowerCase().includes(search.toLowerCase()));
    }, [data, search]);

    if (loading && !moduleUnavailable) {
        return <div className="p-8"><TopLoader /><p className="text-sm text-muted-foreground">Chargement du registre RH…</p></div>;
    }

    if (moduleUnavailable) {
        return (
            <div className="flex-1 p-6 md:p-8">
                <div className="max-w-3xl mx-auto space-y-6">
                    <h1 className="text-2xl font-bold">Ressources humaines</h1>
                    <div role="status" className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-sm text-muted-foreground">
                        {moduleUnavailable}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-background transition-all duration-300 overflow-y-auto p-6 md:p-8 space-y-4">
            {loading && <TopLoader />}

            <div className="max-w-[1600px] mx-auto w-full space-y-4">
                
                <ElitePageHeader 
                    title="Gestion de l'Équipe."
                    subtitle="Capital Humain"
                    description="Gérez vos collaborateurs, supervisez les acomptes et validez les salaires en un clic."
                    actions={
                        <div className="flex items-center gap-3">
                            <div className="relative group w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <input 
                                    value={search} 
                                    onChange={(e) => setSearch(e.target.value)} 
                                    placeholder="Rechercher un collaborateur..." 
                                    className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/40 shadow-sm"
                                />
                            </div>

                            <Sheet open={openAdd} onOpenChange={setOpenAdd}>
                                <SheetTrigger asChild>
                                    <button className="h-10 px-6 bg-primary text-primary-foreground rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                                        <Plus className="w-4 h-4" /> Recruter
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="right" className="sm:max-w-md bg-card border-l border-border p-8 flex flex-col shadow-2xl">
                                    <SheetHeader className="mb-10 text-left">
                                        <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl w-fit mb-4">
                                            <UserPlus className="w-5 h-5 text-primary" />
                                        </div>
                                        <SheetTitle className="text-2xl font-black italic uppercase tracking-tighter">Nouveau <span className="text-primary">Collaborateur.</span></SheetTitle>
                                    </SheetHeader>

                                    <form onSubmit={handleCreate} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Prénom</label>
                                                <input 
                                                    required
                                                    value={formData.firstName}
                                                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                                                    className="w-full bg-muted/20 border border-border rounded-xl p-4 text-sm font-bold focus:border-primary/50 outline-none"
                                                    placeholder="Jean"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Nom</label>
                                                <input 
                                                    required
                                                    value={formData.lastName}
                                                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                                                    className="w-full bg-muted/20 border border-border rounded-xl p-4 text-sm font-bold focus:border-primary/50 outline-none"
                                                    placeholder="Dupont"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Téléphone</label>
                                            <input 
                                                required
                                                value={formData.phone}
                                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                                className="w-full bg-muted/20 border border-border rounded-xl p-4 text-sm font-bold focus:border-primary/50 outline-none"
                                                placeholder="77 000 00 00"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Salaire Mensuel (NET)</label>
                                            <div className="relative">
                                                <input 
                                                    required
                                                    type="number"
                                                    value={formData.salary}
                                                    onChange={e => setFormData({...formData, salary: e.target.value})}
                                                    className="w-full bg-muted/20 border border-border rounded-xl p-5 text-2xl font-black focus:border-primary/50 outline-none pr-12"
                                                    placeholder="150000"
                                                />
                                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">F</span>
                                            </div>
                                        </div>

                                        <button 
                                            disabled={isActionPending}
                                            type="submit"
                                            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/10 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95"
                                        >
                                            {isActionPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Enregistrer le contrat</>}
                                        </button>
                                    </form>
                                </SheetContent>
                            </Sheet>
                        </div>
                    }
                />

                {/* --- METRICS GRID (Elite SaaS) --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <EliteMetricCard 
                        label="Masse Salariale" 
                        value={`${formatMoney(data?.metrics?.totalPayroll || 0)} F`} 
                        icon={Users} 
                        variant="blue"
                        sub="Budget mensuel"
                    />
                    <EliteMetricCard 
                        label="Acomptes (Total)" 
                        value={`${formatMoney(data?.metrics?.totalAdvances || 0)} F`} 
                        icon={Wallet} 
                        variant="amber"
                        sub="Dettes employés"
                    />
                    <EliteMetricCard 
                        label="Solde à Verser" 
                        value={`${formatMoney(data?.metrics?.netToPay || 0)} F`} 
                        icon={ShieldCheck} 
                        variant="emerald"
                        sub="Restant à payer"
                    />
                    <EliteMetricCard 
                        label="Effectif Total" 
                        value={data?.metrics?.count || 0} 
                        icon={UserPlus} 
                        variant="purple"
                        sub="Collaborateurs actifs"
                    />
                </div>

                {/* --- REGISTRE EXCEL PRO DU PERSONNEL & SALAIRES --- */}
                <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none">
                    {/* Barre de Titre Feuille Excel */}
                    <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs select-none">
                        <div className="flex items-center gap-2">
                            <span className="bg-[#107c41] text-white px-2 py-0.5 rounded font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-sm">
                                <span>XLSX</span>
                            </span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                                Feuille : Registre des Salaires RH & Collaborateurs
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {filteredEmployees?.length || 0} collaborateurs
                            </span>
                        </div>
                    </div>

                    {/* Grille Excel */}
                    <div className="w-full overflow-x-auto touch-pan-x">
                        <table className="w-full min-w-[760px] border-collapse text-left text-xs">
                            <thead>
                                <tr className="bg-[#107c41] text-white select-none">
                                    <th className="w-12 text-center px-2 py-2 text-[10px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50">N°</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[180px]">Collaborateur (Nom & Prénom)</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[120px]">Contact</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[100px] text-center">Recrutement</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 text-right min-w-[120px]">Salaire Base</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 text-right min-w-[110px]">Acomptes</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 text-right min-w-[120px]">Solde Net</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 text-center min-w-[90px]">Statut</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-b border-emerald-600/50 text-center w-36">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees?.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-10 text-center text-muted-foreground border-b border-slate-200 dark:border-slate-700/80 italic bg-white dark:bg-slate-900">
                                            Aucun membre d'équipe enregistré.
                                        </td>
                                    </tr>
                                ) : filteredEmployees?.map((employee: any, idx: number) => {
                                    const salary = Number(employee.salary) || 0;
                                    const advances = Number(employee.advances) || 0;
                                    const net = salary - advances;
                                    const displayName = employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || "Collaborateur";

                                    return (
                                        <tr 
                                            key={employee.id} 
                                            className={cn(
                                                "transition-colors hover:bg-[#e8f4fc] dark:hover:bg-slate-800/80",
                                                idx % 2 === 1 ? "bg-[#f8fafc] dark:bg-slate-900/60" : "bg-white dark:bg-slate-900"
                                            )}
                                        >
                                            <td className="w-12 text-center bg-[#f1f3f5] dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px] font-bold border-r border-b border-slate-200 dark:border-slate-700/80 select-none">
                                                {idx + 1}
                                            </td>
                                            <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">
                                                {displayName}
                                            </td>
                                            <td className="px-3 py-2 font-mono text-[11px] text-slate-600 dark:text-slate-400 border-r border-b border-slate-200 dark:border-slate-700/80">
                                                {employee.phone || "—"}
                                            </td>
                                            <td className="px-3 py-2 text-center font-mono text-xs text-slate-600 dark:text-slate-400 border-r border-b border-slate-200 dark:border-slate-700/80">
                                                {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString('fr-FR') : "—"}
                                            </td>
                                            <td className="px-3 py-2 text-right font-mono font-bold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">
                                                {formatMoney(salary)} F
                                            </td>
                                            <td className="px-3 py-2 text-right font-mono font-bold text-amber-600 dark:text-amber-400 border-r border-b border-slate-200 dark:border-slate-700/80">
                                                {advances > 0 ? `-${formatMoney(advances)} F` : "0 F"}
                                            </td>
                                            <td className="px-3 py-2 text-right font-mono font-bold text-sm border-r border-b border-slate-200 dark:border-slate-700/80">
                                                <span className={net > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500"}>
                                                    {formatMoney(net)} F
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center border-r border-b border-slate-200 dark:border-slate-700/80">
                                                <span className={cn(
                                                    "inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase border",
                                                    net <= 0 
                                                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300" 
                                                        : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                                                )}>
                                                    {net <= 0 ? "Payé" : "À Payer"}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center border-b border-slate-200 dark:border-slate-700/80">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button 
                                                        onClick={() => handleAdvance(employee.id, displayName)} 
                                                        className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-700 text-[10px] font-bold transition-all"
                                                        title="Verser un acompte"
                                                    >
                                                        Acompte
                                                    </button>
                                                    <button 
                                                        onClick={() => handleSalaryPayment(employee.id, displayName, net)} 
                                                        disabled={net <= 0} 
                                                        className={cn(
                                                            "px-2 py-0.5 rounded border text-[10px] font-bold transition-all",
                                                            net <= 0 
                                                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-40" 
                                                                : "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-700 shadow-sm"
                                                        )}
                                                        title="Payer le solde du mois"
                                                    >
                                                        Payer Solde
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Barre d'état Excel */}
                    <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium select-none">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-emerald-800 dark:text-emerald-400">PRÊT</span>
                            <span>•</span>
                            <span>Affichage : {filteredEmployees?.length || 0} collaborateurs</span>
                        </div>
                        <div className="flex items-center gap-4 font-mono">
                            <span>Masse Salariale Base : <strong>{formatMoney(filteredEmployees?.reduce((acc: number, e: any) => acc + (Number(e.salary) || 0), 0) || 0)} F</strong></span>
                            <span>Total Net Restant : <strong className="text-emerald-700 dark:text-emerald-400">{formatMoney(filteredEmployees?.reduce((acc: number, e: any) => acc + (Math.max(0, (Number(e.salary) || 0) - (Number(e.advances) || 0))), 0) || 0)} F</strong></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
