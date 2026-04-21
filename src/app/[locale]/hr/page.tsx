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
    const [search, setSearch] = useState("");
    const [openAdd, setOpenAdd] = useState(false);

    const [formData, setFormData] = useState<EmployeeFormData>({ firstName: "", lastName: "", email: "", phone: "", salary: "" });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getEmployees() as unknown as HRData;
            setData(res);
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

                {/* --- STAFF DIRECTORY TABLE --- */}
                <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden min-h-[300px] md:min-h-[500px] flex flex-col">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm border-separate border-spacing-0">
                            <thead className="bg-muted/10 text-muted-foreground text-xs font-semibold border-b border-border">
                                <tr>
                                    <th className="px-6 py-4">Collaborateur</th>
                                    <th className="px-6 py-4">Date Recrutement</th>
                                    <th className="px-6 py-4">Salaire Base</th>
                                    <th className="px-6 py-4">Acomptes</th>
                                    <th className="px-6 py-4">Reste à payer</th>
                                    <th className="px-6 py-4 text-center">Statut Paie</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredEmployees?.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center text-muted-foreground italic">Aucun membre d'équipe enregistré.</td>
                                    </tr>
                                ) : filteredEmployees?.map((employee) => {
                                    const net = employee.salary - employee.advances;
                                    const advPercent = Math.min(100, (employee.advances / employee.salary) * 100);

                                    return (
                                        <tr key={employee.id} className="group hover:bg-muted/20 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0 shadow-sm transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                        <UserIcon className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h3 className="font-bold text-foreground text-sm uppercase truncate mb-0.5">{employee.firstName} {employee.lastName}</h3>
                                                        <p className="text-[10px] text-muted-foreground font-mono uppercase truncate opacity-60">{employee.phone || "Non renseigné"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                                                {new Date(employee.startDate).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-foreground">
                                                {formatMoney(employee.salary)} F
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 w-32">
                                                    <div className="flex justify-between items-end mb-1">
                                                        <span className="text-xs font-bold text-amber-600">-{formatMoney(employee.advances)} F</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                                        <div className={cn("h-full transition-all duration-700", advPercent > 70 ? "bg-red-500" : "bg-amber-500")} style={{ width: `${advPercent}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn("text-sm font-bold", net > 0 ? "text-emerald-600" : "text-muted-foreground italic opacity-40")}>
                                                    {net > 0 ? formatMoney(net) + " F" : "SOLDÉ"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-md text-[10px] font-bold border block w-fit mx-auto shadow-sm",
                                                    net <= 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                )}>
                                                    {net <= 0 ? "PAYÉ" : "EN ATTENTE"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleAdvance(employee.id, employee.firstName)} className="p-2 bg-background border border-border rounded-lg hover:bg-amber-500 hover:text-white transition-colors shadow-sm" title="Verser acompte">
                                                        <Wallet className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleSalaryPayment(employee.id, employee.firstName, net)} disabled={net <= 0} className={cn("p-2 bg-background border border-border rounded-lg transition-colors shadow-sm", net <= 0 ? "opacity-20 cursor-not-allowed" : "hover:bg-primary hover:text-primary-foreground")}>
                                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <div className="group-hover:hidden text-muted-foreground">
                                                    <MoreHorizontal className="w-4 h-4 ml-auto" />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-border/20">
                        {filteredEmployees?.length === 0 ? (
                            <div className="py-20 text-center text-muted-foreground italic">Aucun collaborateur trouvé.</div>
                        ) : filteredEmployees?.map((employee) => {
                            const net = employee.salary - employee.advances;
                            return (
                                <div key={employee.id} className="p-4 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                                            <UserIcon className="w-4 h-4 opacity-40" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h3 className="font-bold text-foreground text-sm uppercase truncate">{employee.firstName} {employee.lastName}</h3>
                                            <p className="text-[10px] text-muted-foreground font-mono uppercase">{employee.phone || "Non renseigné"}</p>
                                        </div>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[8px] font-black uppercase border",
                                            net <= 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                        )}>
                                            {net <= 0 ? "Payé" : "Paie"}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest">Salaire Net</p>
                                            <p className="text-sm font-black italic">{formatMoney(employee.salary)} F</p>
                                        </div>
                                        <div className="space-y-0.5 text-right">
                                            <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest">Solde Actuel</p>
                                            <p className={cn("text-sm font-black italic", net > 0 ? "text-primary" : "text-emerald-500")}>{formatMoney(net)} F</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 pt-2">
                                        <button onClick={() => handleAdvance(employee.id, employee.firstName)} className="px-4 py-2 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Acompte</button>
                                        <button onClick={() => handleSalaryPayment(employee.id, employee.firstName, net)} disabled={net <= 0} className={cn("px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-primary/10", net <= 0 && "opacity-20")}>Payer Solde</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
