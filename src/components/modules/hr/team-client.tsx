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

            {/* --- PAYROLL DIRECTORY: HIGH-DENSITY TABLE --- */}
            <div className="bg-card border border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl flex-1 flex flex-col min-h-[500px]">
                <div className="p-8 border-b border-border/30 bg-muted/5 flex items-center justify-between">
                    <div>
                         <h3 className="text-sm font-black text-foreground italic uppercase tracking-widest">Répertoire de Paie Protocol</h3>
                         <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] mt-1">Analyse des flux salariaux en temps réel</p>
                    </div>
                </div>
                
                {/* --- REGISTRE EXCEL PRO DE L'ÉQUIPE --- */}
                <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none">
                    {/* Barre de Titre Feuille Excel */}
                    <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs select-none">
                        <div className="flex items-center gap-2">
                            <span className="bg-[#107c41] text-white px-2 py-0.5 rounded font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-sm">
                                <span>XLSX</span>
                            </span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                                Feuille : Équipe RH & Rôles Collaborateurs
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {filteredEmployees.length} talents
                            </span>
                        </div>
                    </div>

                    {/* Grille Excel */}
                    <div className="w-full overflow-x-auto touch-pan-x">
                        <table className="w-full min-w-[750px] border-collapse text-left text-xs">
                            <thead>
                                <tr className="bg-[#107c41] text-white select-none">
                                    <th className="w-12 text-center px-2 py-2 text-[10px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50">N°</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[180px]">Talent / Identité</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[110px] text-center">Rôle</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[100px] text-center">Ancienneté</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 text-right min-w-[110px]">Salaire Brut</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 text-right min-w-[110px]">Acomptes Dûs</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-b border-emerald-600/50 text-center w-36">Contrôles RH</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-muted-foreground border-b border-slate-200 dark:border-slate-700/80 italic bg-white dark:bg-slate-900">
                                            Aucun talent identifié dans le registre.
                                        </td>
                                    </tr>
                                ) : filteredEmployees.map((emp, i) => {
                                    const joinDate = new Date(emp.createdAt);
                                    const diffTime = Math.abs(new Date().getTime() - joinDate.getTime());
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    const seniorityText = diffDays > 30 ? `${Math.floor(diffDays/30)} Mois` : `${diffDays} Jours`;

                                    return (
                                        <tr 
                                            key={emp.id} 
                                            className={cn(
                                                "transition-colors hover:bg-[#e8f4fc] dark:hover:bg-slate-800/80",
                                                i % 2 === 1 ? "bg-[#f8fafc] dark:bg-slate-900/60" : "bg-white dark:bg-slate-900"
                                            )}
                                        >
                                            <td className="w-12 text-center bg-[#f1f3f5] dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px] font-bold border-r border-b border-slate-200 dark:border-slate-700/80 select-none">
                                                {i + 1}
                                            </td>
                                            <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0">
                                                         <ShieldCheck className={cn("w-3.5 h-3.5", emp.role === 'ADMIN' ? "text-amber-600" : "text-emerald-600")} />
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-xs">{emp.firstName} {emp.lastName}</div>
                                                        <div className="text-[10px] font-mono text-muted-foreground">{emp.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-center border-r border-b border-slate-200 dark:border-slate-700/80">
                                                <span className={cn(
                                                    "inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase border",
                                                    emp.role === 'ADMIN' ? "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-200" : "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200"
                                                )}>
                                                    {emp.role}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center font-mono font-medium text-slate-700 dark:text-slate-300 border-r border-b border-slate-200 dark:border-slate-700/80">
                                                {seniorityText}
                                            </td>
                                            <td className="px-3 py-2 text-right font-mono font-bold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">
                                                {Number(emp.salary || 0).toLocaleString()} F
                                            </td>
                                            <td className="px-3 py-2 text-right font-mono font-bold border-r border-b border-slate-200 dark:border-slate-700/80">
                                                <span className={(emp.advances || 0) > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}>
                                                    -{(emp.advances || 0).toLocaleString()} F
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center border-b border-slate-200 dark:border-slate-700/80">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => setIsAdvancing(emp.id)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 transition-all" title="Verser Acompte">
                                                        <Banknote className="w-3.5 h-3.5 text-amber-600" />
                                                    </button>
                                                    <button 
                                                        onClick={async () => {
                                                            if(confirm("Réinitialiser les acomptes ?")) {
                                                                const res = await resetEmployeeAdvances(emp.id);
                                                                if(res.success) {
                                                                    setEmployees(employees.map(e => e.id === emp.id ? {...e, advances: 0} : e));
                                                                    toast.success("Acomptes réinitialisés.");
                                                                } else if (res.error) {
                                                                    toast.error(res.error);
                                                                }
                                                            }
                                                        }}
                                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 transition-all"
                                                        title="Réinitialiser les acomptes"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
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
                            <span>Affichage : {filteredEmployees.length} membres d'équipe</span>
                        </div>
                        <div className="flex items-center gap-4 font-mono">
                            <span>Masse Salariale : <strong>{filteredEmployees.reduce((acc, e) => acc + (Number(e.salary) || 0), 0).toLocaleString()} F</strong></span>
                            <span>Total Acomptes : <strong className="text-amber-600 dark:text-amber-400">-{filteredEmployees.reduce((acc, e) => acc + (Number(e.advances) || 0), 0).toLocaleString()} F</strong></span>
                        </div>
                    </div>
                </div>
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
