"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { 
    Users, Plus, Search, 
    TrendingUp, Wallet, Banknote, 
    Clock, Phone, Mail, 
    CreditCard, ArrowUpRight, ArrowDownRight,
    Loader2, X, MoreVertical, ShieldCheck, 
    UserIcon, Trash2, ChevronRight, UserPlus
} from "lucide-react";
import { 
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger 
} from "@/components/ui/sheet";
import { getEmployees, createEmployee, giveAdvance, payRestSalary } from "@/lib/actions/hr";
import { TopLoader } from "@/components/ui/top-loader";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function HRPage() {
    const [loading, setLoading] = useState(true);
    const [isActionPending, setIsActionPending] = useState(false);
    const [data, setData] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [openAdd, setOpenAdd] = useState(false);

    const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "", salary: "" });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getEmployees();
            setData(res);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const formatMoney = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsActionPending(true);
        try {
            const res = await createEmployee({ ...formData, salary: Number(formData.salary) });
            if (res.success) {
                toast.success("Talent recruté ! ✨");
                setOpenAdd(false);
                setFormData({ firstName: "", lastName: "", email: "", phone: "", salary: "" });
                fetchData();
            } else toast.error(res.error);
        } finally { setIsActionPending(false); }
    };

    const handleAdvance = async (eId: string, name: string) => {
        const amount = prompt(`💸 Acompte à verser pour ${name} :`);
        if (!amount || isNaN(Number(amount))) return;
        setIsActionPending(true);
        try {
            const res = await giveAdvance(eId, Number(amount));
            if (res.success) { toast.success(`Acompte versé ! ✨💸`); fetchData(); }
            else toast.error(res.error);
        } finally { setIsActionPending(false); }
    };

    const handleSalaryPayment = async (eId: string, name: string, net: number) => {
        if (!confirm(`👤 Finaliser la paie de ${name} ? (${formatMoney(net)} F)`)) return;
        setIsActionPending(true);
        try {
            const res = await payRestSalary(eId);
            if (res.success) { toast.success(`Salaire soldé ! ✨🏁`); fetchData(); }
            else toast.error(res.error);
        } finally { setIsActionPending(false); }
    };

    const filteredEmployees = useMemo(() => {
        return data?.employees?.filter((e: any) => (e.firstName + " " + e.lastName).toLowerCase().includes(search.toLowerCase()));
    }, [data, search]);

    return (
        <div className="p-6 md:p-8 space-y-8 bg-background text-foreground transition-colors duration-500 overflow-y-auto custom-scrollbar">
            {loading && <TopLoader />}

            {/* --- COMPACT HEADER --- */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/50 pb-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-foreground">
                        Gestion <span className="text-primary">Équipe.</span>
                    </h1>
                    <p className="text-[9px] text-muted-foreground/50 font-black tracking-[0.2em] uppercase">HUMAN RESOURCES | {data?.metrics?.count || 0} COLLABORATEURS</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 p-1.5 bg-muted/20 border border-border rounded-xl group focus-within:ring-1 ring-primary/20 transition-all">
                        <Search className="w-4 h-4 ml-2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="RECHERCHER..." className="bg-transparent border-none outline-none py-2 px-1 w-40 text-[9px] uppercase font-black tracking-widest placeholder:text-muted-foreground/20" />
                    </div>
                    <Sheet open={openAdd} onOpenChange={setOpenAdd}>
                        <SheetTrigger asChild>
                            <button className="bg-primary text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg italic">
                                <UserPlus className="w-4 h-4" /> Recruter
                            </button>
                        </SheetTrigger>
                        <SheetContent className="w-[450px] bg-card border-l border-border p-10 flex flex-col shadow-2xl rounded-l-[2.5rem]">
                            <SheetHeader className="mb-10 text-left">
                                <SheetTitle className="text-2xl font-black italic tracking-tighter uppercase text-foreground leading-none">Nouvel <span className="text-primary">Talent.</span></SheetTitle>
                                <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.3em] font-sans">MINDOS INTEGRATION PROTOCOL</p>
                            </SheetHeader>
                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                     <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-muted/10 border-transparent rounded-xl px-5 py-4 text-xs font-black shadow-inner" placeholder="PRENOM" />
                                     <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-muted/10 border-transparent rounded-xl px-5 py-4 text-xs font-black shadow-inner" placeholder="NOM" />
                                </div>
                                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-muted/10 border-transparent rounded-xl px-5 py-4 text-xs font-black shadow-inner" placeholder="WHATSAPP (+221...)" />
                                <div className="p-8 bg-muted/5 border border-border rounded-[2rem] space-y-4">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-primary text-center block leading-none">Salaire Mensuel Fixe</label>
                                    <input required type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full bg-background border border-primary/20 rounded-xl py-6 text-3xl font-black text-primary text-center" />
                                </div>
                                <button disabled={isActionPending} className="w-full py-6 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-4 italic mt-10">
                                    {isActionPending ? <Loader2 className="animate-spin w-6 h-6" /> : "Intégrer à l'équipe"}
                                </button>
                            </form>
                        </SheetContent>
                    </Sheet>
                </div>
            </header>

            {/* Metrics Compact Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                    { label: "Masse Salariale", value: data?.metrics?.totalPayroll, icon: Users, color: "text-primary" },
                    { label: "Acomptes Versés", value: data?.metrics?.totalAdvances, icon: Wallet, color: "text-amber-500" },
                    { label: "Solde Restant", value: data?.metrics?.netToPay, icon: ShieldCheck, color: "text-emerald-500" },
                    { label: "Effectif Total", value: data?.metrics?.count, icon: UserIcon, color: "text-muted-foreground", suffix: " Pers" }
                ].map((m, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group">
                        <div className="flex flex-col gap-2 relative z-10">
                            <div className={cn("inline-flex items-center gap-2", m.color)}>
                                <m.icon className="w-4 h-4" />
                                <p className="text-[8px] font-black uppercase tracking-widest leading-none">{m.label}</p>
                            </div>
                            <h2 className="text-xl font-black text-foreground italic tracking-tight uppercase leading-none">
                                {typeof m.value === 'number' ? formatMoney(m.value) : m.value}
                                <span className="text-[10px] opacity-20 ml-1 font-black">{m.suffix || ' F'}</span>
                            </h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* Team Grid Compact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredEmployees?.map((employee: any) => {
                    const net = employee.salary - employee.advances;
                    const advPercent = Math.min(100, (employee.advances / employee.salary) * 100);

                    return (
                        <div key={employee.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between h-full min-h-[300px]">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="w-10 h-10 bg-muted/40 rounded-xl flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-white transition-all shadow-inner shrink-0">
                                        <UserIcon className="w-5 h-5 opacity-30 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[8px] font-black text-primary italic uppercase tracking-widest">Actif ✅</span>
                                        <p className="text-[7px] text-muted-foreground/30 font-black uppercase tracking-widest mt-1">Ref: {employee.id.slice(-4).toUpperCase()}</p>
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-lg font-black text-foreground tracking-tight uppercase italic leading-none">{employee.firstName} <span className="opacity-30">{employee.lastName}</span></h3>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">{employee.phone || "Pas de contact"}</p>
                                </div>
                                {/* Financial Mini Bar */}
                                <div className="space-y-2 pt-2">
                                    <div className="flex justify-between items-center text-[7px] font-black uppercase text-muted-foreground/40 italic">
                                        <span>Acomptes versés</span>
                                        <span>{formatMoney(employee.advances)} F</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted/20 rounded-full border border-border overflow-hidden">
                                        <div className={cn("h-full transition-all duration-1000", advPercent > 50 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${advPercent}%` }} />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 grid grid-cols-2 gap-3 border-t border-border/40 mt-4">
                                <button onClick={() => handleAdvance(employee.id, employee.firstName)} className="bg-muted/10 border border-border hover:bg-amber-500 hover:text-white transition-all py-3 px-2 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm active:scale-95 flex items-center justify-center gap-2">
                                    <Wallet className="w-3.5 h-3.5" /> Acompte
                                </button>
                                <button onClick={() => handleSalaryPayment(employee.id, employee.firstName, net)} disabled={net <= 0} className={cn("py-3 px-2 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm active:scale-95 flex items-center justify-center gap-2 transition-all", net <= 0 ? "bg-muted text-muted-foreground opacity-20" : "bg-primary text-white hover:scale-105")}>
                                    <ArrowUpRight className="w-4 h-4 stroke-[3]" /> SOLDE
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
