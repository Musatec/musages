"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSupabase } from "@/components/providers/supabase-provider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { Transaction } from "@/types/capital";

const CATEGORIES = [
    'Sponsoring', 'Matériel', 'Logiciels', 'Transport', 'Réseaux Sociaux', 'Salaire', 'Autre'
];

interface NewTransactionSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    transactionToEdit?: Transaction | null;
}

export function NewTransactionSheet({ open, onOpenChange, onSuccess, transactionToEdit }: NewTransactionSheetProps) {
    const { user } = useSupabase();
    const [loading, setLoading] = useState(false);

    // Form State
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState(CATEGORIES[2]); // Default: Logiciels
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Effect to populate form when editing
    useEffect(() => {
        if (open && transactionToEdit) {
            setType(transactionToEdit.type);
            setAmount(transactionToEdit.amount.toString());
            setCategory(transactionToEdit.category);
            setDescription(transactionToEdit.description);
            setDate(transactionToEdit.date);
        } else if (open && !transactionToEdit) {
            // Reset for creation mode
            setAmount("");
            setDescription("");
            setCategory(CATEGORIES[2]);
            setDate(new Date().toISOString().split('T')[0]);
            setType('EXPENSE');
        }
    }, [open, transactionToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !amount || !description) return;

        setLoading(true);
        try {
            if (transactionToEdit) {
                // UPDATE
                const { error } = await supabase.from('transactions')
                    .update({
                        amount: Math.abs(parseFloat(amount)),
                        type,
                        category,
                        description,
                        date
                    })
                    .eq('id', transactionToEdit.id);

                if (error) throw error;
                toast.success("Transaction modifiée !");
            } else {
                // CREATE
                const { error } = await supabase.from('transactions').insert({
                    user_id: user.id,
                    amount: Math.abs(parseFloat(amount)),
                    type,
                    category,
                    description,
                    date
                });

                if (error) throw error;
                toast.success(type === 'INCOME' ? "Revenu enregistré ! 🤑" : "Dépense enregistrée 💸");
            }

            onSuccess?.();
            onOpenChange(false);

            // Reset form
            if (!transactionToEdit) {
                setAmount("");
                setDescription("");
                setCategory(CATEGORIES[2]);
                setDate(new Date().toISOString().split('T')[0]);
            }
        } catch (error: any) {
            toast.error("Erreur : " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!transactionToEdit) return;
        if (!confirm("Voulez-vous vraiment supprimer cette transaction ?")) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('transactions').delete().eq('id', transactionToEdit.id);
            if (error) throw error;
            toast.success("Transaction supprimée.");
            onSuccess?.();
            onOpenChange(false);
        } catch (error: any) {
            toast.error("Erreur suppression : " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md bg-[#1C1C1E] border-l border-white/10 p-0 text-white">
                <div className="h-full flex flex-col p-6">
                    <SheetHeader className="mb-8">
                        <SheetTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">
                            {transactionToEdit ? "Modifier" : "Nouvelle"} <span className="text-emerald-500">Transaction</span>
                        </SheetTitle>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="flex-1 space-y-8">

                        {/* Type Switcher */}
                        <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-2xl border border-white/5">
                            <button
                                type="button"
                                onClick={() => setType('INCOME')}
                                className={cn(
                                    "flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    type === 'INCOME' ? "bg-emerald-500 text-white shadow-lg" : "text-gray-500 hover:text-white"
                                )}
                            >
                                <ArrowDownRight className="w-4 h-4" /> Entrée
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('EXPENSE')}
                                className={cn(
                                    "flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    type === 'EXPENSE' ? "bg-red-500 text-white shadow-lg" : "text-gray-500 hover:text-white"
                                )}
                            >
                                <ArrowUpRight className="w-4 h-4" /> Sortie
                            </button>
                        </div>

                        {/* Amount - BIG INPUT */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Montant</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min="0"
                                    placeholder="0"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-transparent border-b-2 border-white/10 py-2 text-5xl font-black tracking-tight text-white placeholder:text-white/10 focus:border-emerald-500 outline-none transition-colors"
                                    autoFocus={!transactionToEdit}
                                />
                                <span className="absolute right-0 bottom-4 text-sm font-bold text-gray-500">FCFA</span>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Facture Vercel..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-white/20 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Catégorie</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-white/20 transition-all appearance-none"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-white/20 transition-all text-gray-300"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 mt-auto flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={loading || !amount || !description}
                                className={cn(
                                    "w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                                    type === 'INCOME' ? "bg-emerald-500 hover:bg-emerald-400 text-white" : "bg-red-500 hover:bg-red-400 text-white"
                                )}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (transactionToEdit ? "Sauvegarder les modifications" : "Valider la transaction")}
                            </button>

                            {transactionToEdit && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="w-full py-4 rounded-2xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 border border-white/5 text-gray-500 text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    Supprimer
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
