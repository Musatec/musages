"use client";

import { useState } from "react";
import { 
    UserPlus, 
    Search, 
    ShieldCheck, 
    BadgeCheck, 
    Mail, 
    Phone, 
    MoreVertical, 
    Trash2, 
    X, 
    Loader2,
    Crown,
    AlertCircle,
    ArrowRight,
    Banknote,
    RotateCcw
} from "lucide-react";
import { createEmployee, addEmployeeAdvance, resetEmployeeAdvances } from "@/lib/actions/hr";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";

interface TeamClientProps {
    employees: any[];
    plan: string;
    maxAllowed: number;
}

export function TeamClient({ employees: initialEmployees, plan, maxAllowed }: TeamClientProps) {
    const [employees, setEmployees] = useState(initialEmployees);
    const [isAdding, setIsAdding] = useState(false);
    const [isAdvancing, setIsAdvancing] = useState<string | null>(null);
    const [advanceAmount, setAdvanceAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const isLimitReached = employees.length >= maxAllowed && maxAllowed > 0;
    const isStarter = plan === "STARTER";

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        salary: "",
        role: "SALES" as any
    });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await createEmployee({
            ...formData,
            salary: Number(formData.salary)
        });

        if (result.success) {
            toast.success("Recrutement réussi ! 🎩");
            // @ts-ignore
            setEmployees([{ ...formData, id: result.employeeId, createdAt: new Date().toISOString(), advances: 0, salary: Number(formData.salary) }, ...employees]);
            setIsAdding(false);
            setFormData({ firstName: "", lastName: "", email: "", phone: "", salary: "", role: "SALES" });
        } else {
            toast.error(result.error);
        }
        setLoading(false);
    };

    const handleApplyAdvance = async () => {
        if (!isAdvancing || !advanceAmount) return;
        setLoading(true);
        const result = await addEmployeeAdvance(isAdvancing, Number(advanceAmount));
        if (result.success) {
            toast.success("Acompte versé avec succès ! 💸");
            // @ts-ignore
            setEmployees(employees.map(emp => emp.id === isAdvancing ? { ...emp, advances: (emp.advances || 0) + Number(advanceAmount) } : emp));
            setIsAdvancing(null);
            setAdvanceAmount("");
        } else {
            toast.error(result.error);
        }
        setLoading(false);
    };

    const filteredEmployees = employees.filter(emp => 
        emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-20">
            {/* Stats & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Rechercher un talent (nom, email)..."
                        className="w-full bg-card border border-border/50 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-primary/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => setIsAdding(true)}
                        disabled={isStarter || isLimitReached}
                        className={cn(
                            "flex-1 md:flex-none px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95",
                            (isStarter || isLimitReached) 
                                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5" 
                                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                        )}
                    >
                        <UserPlus className="w-4 h-4" />
                        Recruter
                    </button>
                </div>
            </div>

            {/* Plan Alert (Sticky) */}
            {isStarter && (
                <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-white">Le Recrutement est réservé aux Plans Superieurs</p>
                            <p className="text-[10px] font-medium text-muted-foreground">Passez au plan Growth pour ajouter vos 2 premiers employés.</p>
                        </div>
                    </div>
                    <Link href="/" className="px-6 py-2 bg-orange-500 text-black rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-orange-400 transition-all flex items-center gap-2">
                        Devenir Growth <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            )}

            {isLimitReached && !isStarter && (
               <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_20px_40px_rgba(59,130,246,0.1)]">
                 <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                         <Crown className="w-5 h-5 text-blue-500" />
                     </div>
                     <div>
                         <p className="text-xs font-black uppercase tracking-widest text-white">Quota atteint ({maxAllowed}/{maxAllowed})</p>
                         <p className="text-[10px] font-medium text-muted-foreground">Votre équipe s'agrandit ! Débloquez 5 slots avec le plan Business.</p>
                     </div>
                 </div>
                 <Link href="/" className="px-6 py-2 bg-blue-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-blue-400 transition-all flex items-center gap-2 shadow-lg">
                     Passer à l'Empire Business <ArrowRight className="w-3 h-3" />
                 </Link>
               </div>
            )}

            {/* Employee Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map((emp, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={emp.id} 
                        className="bg-card border border-border/50 rounded-[2.5rem] p-6 hover:border-primary/30 transition-all group relative overflow-hidden"
                    >
                        {/* Status Glow */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 blur-2xl rounded-full" />
                        
                        <div className="flex items-start justify-between relative z-10 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-border flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform">
                               <ShieldCheck className={cn("w-6 h-6", emp.role === 'ADMIN' ? "text-orange-500" : "text-primary")} />
                               <div className="absolute inset-0 bg-white/[0.03] animate-pulse" />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                    emp.role === 'ADMIN' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : "bg-primary/10 text-primary border-primary/20 shadow-xl"
                                )}>
                                    {emp.role}
                                </span>
                                <p className="text-[8px] font-medium text-muted-foreground mt-2 uppercase tracking-tighter">Actif</p>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <h3 className="text-lg font-black tracking-tighter text-white group-hover:text-primary transition-colors">
                                    {emp.firstName} {emp.lastName}
                                </h3>
                                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                    <BadgeCheck className="w-3 h-3 text-emerald-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest italic opacity-50 px-0.5">Certifié Mindos</span>
                                </div>
                            </div>

                            {/* Financial Stats */}
                            <div className="grid grid-cols-2 gap-3 py-4 border-y border-white/5">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Salaire Mensuel</p>
                                    <p className="text-sm font-black text-white">{Number(emp.salary || 0).toLocaleString()} <span className="text-[9px] opacity-40">FCFA</span></p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Acomptes (Dette)</p>
                                    <p className={cn("text-sm font-black", (emp.advances || 0) > 0 ? "text-orange-500" : "text-emerald-500")}>
                                        -{Number(emp.advances || 0).toLocaleString()} <span className="text-[9px] opacity-40">FCFA</span>
                                    </p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setIsAdvancing(emp.id)}
                                className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all flex items-center justify-center gap-2"
                            >
                                <Banknote className="w-3.5 h-3.5" />
                                Verser une avance
                            </button>

                            <div className="space-y-2 pt-2">
                                <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors overflow-hidden">
                                    <Mail className="w-3 h-3" />
                                    <span className="text-[10px] font-medium truncate">{emp.email}</span>
                                </div>
                                {emp.phone && (
                                    <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
                                        <Phone className="w-3 h-3" />
                                        <span className="text-[10px] font-medium">+{emp.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between text-muted-foreground border-t border-white/5 pt-4">
                           <p className="text-[8px] font-black uppercase tracking-widest opacity-30 italic">ID: #{emp.id.slice(-6)}</p>
                           <div className="flex items-center gap-4">
                                <button 
                                    onClick={async () => {
                                        if(confirm("Réinitialiser les acomptes ?")) {
                                            const res = await resetEmployeeAdvances(emp.id);
                                            if(res.success) {
                                                setEmployees(employees.map(e => e.id === emp.id ? {...e, advances: 0} : e));
                                                toast.success("Acomptes réinitialisés.");
                                            }
                                        }
                                    }}
                                    className="text-muted-foreground/40 hover:text-white transition-colors"
                                    title="Réinitialiser acomptes"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                                <button className="text-red-500/40 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                           </div>
                        </div>
                    </motion.div>
                ))}

                {filteredEmployees.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-border/30 rounded-[3rem]">
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground italic anima-pulse">Aucun talent détecté dans ce secteur.</p>
                    </div>
                )}
            </div>

            {/* Add Employee Modal */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 outline-none focus:outline-none">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAdding(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-card border border-border shadow-2xl rounded-[2.5rem] w-full max-w-lg p-8 md:p-12 relative overflow-hidden"
                        >
                            {/* Glow behind modal */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                            
                            <div className="relative z-10 space-y-8">
                                <header className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white flex items-center gap-3">
                                            Recrutement.
                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        </h2>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Forfait Actuel: {plan}</p>
                                    </div>
                                    <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground">
                                        <X className="w-5 h-5" />
                                    </button>
                                </header>

                                <form onSubmit={handleAdd} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Prénom</label>
                                            <input 
                                                required
                                                type="text" 
                                                className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-sm outline-none focus:border-primary transition-all font-bold"
                                                placeholder="Musa"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Nom</label>
                                            <input 
                                                required
                                                type="text" 
                                                className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-sm outline-none focus:border-primary transition-all font-bold"
                                                placeholder="Digital"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-full">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Salaire Mensuel Brut (FCFA)</label>
                                            <input 
                                                required
                                                type="number" 
                                                className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-sm outline-none focus:border-primary transition-all font-bold text-emerald-500"
                                                placeholder="250000"
                                                value={formData.salary}
                                                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-full">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Rôle Stratégique</label>
                                            <select 
                                                className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-sm outline-none focus:border-primary transition-all font-bold appearance-none cursor-pointer"
                                                value={formData.role}
                                                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                                            >
                                                <option value="SALES">Vendeur (POS)</option>
                                                <option value="STOCK">Gestionnaire Stock</option>
                                                <option value="MANAGER">Manager Global</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2 col-span-full">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Email Professionnel</label>
                                            <input 
                                                required
                                                type="email" 
                                                className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-sm outline-none focus:border-primary transition-all font-bold"
                                                placeholder="talent@mindos-erp.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        disabled={loading}
                                        type="submit"
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-16 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-6 h-6 animate-spin text-primary-foreground" /> : "Finaliser le Recrutement"}
                                    </button>

                                    <p className="text-[9px] text-center text-muted-foreground font-medium italic opacity-60">
                                        "L'excellence d'un empire se mesure à la qualité de son équipe."
                                    </p>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Advance Payment Modal */}
            <AnimatePresence>
                {isAdvancing && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAdvancing(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-card border border-border shadow-2xl rounded-[2.5rem] w-full max-w-sm p-8 relative z-10">
                            <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white mb-6">Verser Acompte.</h2>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Montant (FCFA)</label>
                                    <input 
                                        autoFocus
                                        type="number" 
                                        className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-xl font-black text-emerald-500 outline-none focus:border-emerald-500/50 transition-all font-mono"
                                        placeholder="0"
                                        value={advanceAmount}
                                        onChange={(e) => setAdvanceAmount(e.target.value)}
                                    />
                                </div>
                                <button 
                                    onClick={handleApplyAdvance}
                                    disabled={loading || !advanceAmount}
                                    className="w-full bg-emerald-500 text-black h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-emerald-400 disabled:opacity-50 transition-all"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Banknote className="w-4 h-4" /> Confirmer le Versement</>}
                                </button>
                                <button onClick={() => setIsAdvancing(null)} className="w-full text-[9px] font-black text-muted-foreground uppercase py-2">Annuler</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
