"use client";

import { useState } from "react";
import { 
    Plus, Loader2, DollarSign, FileText, User as UserIcon, Tag,
    TrendingDown, ChevronRight
} from "lucide-react";
import { 
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger 
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { createExpense } from "@/lib/actions/expenses";
import { toast } from "sonner";

const CATEGORIES = [
    "Transport / Essence",
    "Loyer / Charges",
    "Salaires / Bonus",
    "Repas / Boissons",
    "Achat Matériel",
    "Réparation / Maintenance",
    "Marketing / Pub",
    "Autre / Divers"
];

export function NewExpenseSheet({ trigger }: { trigger: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [amount, setAmount] = useState("");
    const [motif, setMotif] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [author, setAuthor] = useState("");

    const handleFinalize = async () => {
        if (!amount || !motif) {
            toast.error("Veuillez remplir le montant et le motif");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await createExpense({
                amount: Number(amount),
                category,
                description: motif,
                author: author || undefined
            });

            if (res.success) {
                toast.success("Dépense enregistrée avec succès ! ✨");
                setAmount("");
                setMotif("");
                setAuthor("");
                setOpen(false);
            } else {
                toast.error(res.error || "Erreur lors de l'enregistrement");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {trigger}
            </SheetTrigger>
            <SheetContent className="w-[480px] bg-background border-border p-0 flex flex-col shadow-2xl rounded-l-[3.5rem] transition-colors duration-500">
                <SheetHeader className="p-12 border-b border-border/50 bg-card/10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                            <TrendingDown className="w-8 h-8 text-white" />
                        </div>
                        <div className="space-y-1">
                            <SheetTitle className="text-3xl font-black uppercase tracking-tighter text-foreground italic leading-none">Nouvelle Dépense</SheetTitle>
                            <p className="text-[10px] font-black tracking-[0.4em] uppercase text-muted-foreground/60 leading-none">Operation Outcome Core</p>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
                    
                    {/* Amount Input */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 ml-4">Montant de la sortie</label>
                        <div className="relative group">
                            <input 
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                                className="w-full bg-card border-none focus:ring-2 focus:ring-primary/20 rounded-[2.5rem] py-10 px-12 text-5xl font-black text-primary transition-all placeholder:text-muted-foreground/30 text-center shadow-inner"
                            />
                            <span className="absolute right-12 top-1/2 -translate-y-1/2 text-sm font-black opacity-10 tracking-widest uppercase">FCFA</span>
                        </div>
                    </div>

                    <div className="space-y-10">
                        {/* Motif */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 ml-4">Description / Motif</label>
                            <div className="relative group">
                                <FileText className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                                <input 
                                    value={motif}
                                    onChange={e => setMotif(e.target.value)}
                                    placeholder="Ex: Facture électricité"
                                    className="w-full bg-card border-none focus:ring-2 focus:ring-primary/20 rounded-[1.5rem] py-6 pl-16 pr-8 font-black text-sm transition-all text-foreground placeholder:text-muted-foreground/40"
                                />
                            </div>
                        </div>

                        {/* Category Selector */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 ml-4">Catégorie de dépense</label>
                            <div className="grid grid-cols-2 gap-3">
                                {CATEGORIES.map(cat => (
                                    <button 
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={cn(
                                            "px-5 py-4 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all duration-300 text-center",
                                            category === cat 
                                                ? "bg-primary text-white border-transparent shadow-xl shadow-primary/20 scale-105" 
                                                : "bg-card border-transparent text-muted-foreground hover:border-primary/20"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Author */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 ml-4">Auteur du mouvement</label>
                            <div className="relative group">
                                <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                                <input 
                                    value={author}
                                    onChange={e => setAuthor(e.target.value)}
                                    placeholder="Nom dynamique (Optionnel)"
                                    className="w-full bg-card border-none focus:ring-2 focus:ring-primary/20 rounded-[1.5rem] py-6 pl-16 pr-8 font-black text-sm transition-all text-foreground placeholder:text-muted-foreground/40"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Submit */}
                <div className="p-12 border-t border-border/50 bg-card/20">
                    <button 
                        onClick={handleFinalize}
                        disabled={isSubmitting}
                        className="w-full py-8 bg-primary text-white rounded-[2rem] text-[14px] font-black uppercase tracking-[0.5em] transition-all shadow-3xl active:scale-95 flex items-center justify-center gap-5 shadow-primary/40 italic"
                    >
                        {isSubmitting ? <Loader2 className="w-7 h-7 animate-spin" /> : (
                            <>
                                <span>Valider l'opération</span>
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
