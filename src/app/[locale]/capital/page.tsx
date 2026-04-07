"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
    Wallet, TrendingUp, TrendingDown,
    Plus, ArrowUpRight, ArrowDownRight,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import { Transaction } from "@/types/capital";
import { NewTransactionSheet } from "@/components/capital/new-transaction-sheet";
import { getTransactions, getCapitalSummary } from "@/lib/actions/capital";

export default function CapitalPage() {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7));

    const [balance, setBalance] = useState(0);
    const [incomeMonth, setIncomeMonth] = useState(0);
    const [expenseMonth, setExpenseMonth] = useState(0);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const summary = await getCapitalSummary(filterMonth);
            if (summary) {
                setTransactions(summary.transactions as any[]);
                setBalance(summary.balance);
                setIncomeMonth(summary.monthlyIncome);
                setExpenseMonth(summary.monthlyExpense);
            }
        } catch (error: unknown) {
            console.error("Error fetching transactions:", error);
            toast.error("Erreur de chargement des données financières.");
        } finally {
            setLoading(false);
        }
    }, [filterMonth]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
    };

    const handleEditTransaction = (tx: Transaction) => {
        setSelectedTransaction(tx);
        setIsSheetOpen(true);
    };

    const handleNewTransaction = () => {
        setSelectedTransaction(null);
        setIsSheetOpen(true);
    };

    return (
        <div className="min-h-screen w-full bg-[#050505] text-foreground p-4 md:p-6 pb-24 font-sans selection:bg-emerald-500/30">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header Compact */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <p className="text-primary text-[8px] font-black uppercase tracking-[0.3em] pl-1 mb-1 opacity-50">Finance Engine</p>
                        <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase italic leading-none">
                            Gestion <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary/80 to-red-400 italic">Capital.</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 bg-[#1C1C1E] border border-border/50 p-0.5 rounded-lg">
                        <input
                            type="month"
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                            className="bg-transparent text-[10px] font-black uppercase tracking-wider text-muted-foreground focus:text-foreground outline-none px-3 py-1.5 cursor-pointer"
                        />
                    </div>
                </div>

                {/* ZONE A: BILAN COMPACT */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-primary to-primary rounded-2xl p-4 relative overflow-hidden group shadow-xl shadow-orange-900/40 border border-t-white/20">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-foreground/10 blur-[60px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
                        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-orange-100/60">Solde Total Alpha</span>
                                <div className="p-1.5 rounded-lg bg-foreground/20 backdrop-blur-md text-foreground border border-border/50"><Wallet className="w-4 h-4" /></div>
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter italic leading-none">
                                    {loading ? "..." : formatMoney(balance)}
                                </h2>
                                <p className="text-[8px] text-orange-100/40 font-black uppercase tracking-widest mt-1">Disponibilités globales</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1C1C1E]/30 backdrop-blur-xl border border-emerald-500/10 rounded-2xl p-4 relative overflow-hidden group hover:bg-emerald-500/5 transition-all">
                        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><TrendingUp className="w-4 h-4" /></div>
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600">Entrées</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-foreground tracking-tight italic group-hover:text-emerald-400 transition-colors leading-none">
                                    {loading ? "..." : formatMoney(incomeMonth)}
                                </h2>
                                <span className="text-[7px] text-emerald-500/40 font-black uppercase tracking-widest">Perf. Mensuelle</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1C1C1E]/30 backdrop-blur-xl border border-red-500/10 rounded-2xl p-4 relative overflow-hidden group hover:bg-red-500/5 transition-all">
                        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20"><TrendingDown className="w-4 h-4" /></div>
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600">Sorties</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-foreground tracking-tight italic group-hover:text-red-400 transition-colors leading-none">
                                    {loading ? "..." : formatMoney(expenseMonth)}
                                </h2>
                                <span className="text-[7px] text-red-500/40 font-black uppercase tracking-widest">Charges Alpha</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ZONE B: TRANSACTIONS COMPACTES */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[8px] font-black text-gray-600 uppercase tracking-[0.3em]">Registry Alpha Log • {new Date(filterMonth).toLocaleDateString('fr-FR', { month: 'long' })}</h3>
                    </div>

                    <div className="space-y-1.5">
                        {loading ? (
                            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        ) : transactions.length === 0 ? (
                            <div className="py-12 border border-dashed border-border/50 rounded-2xl text-center text-[10px] text-gray-600 font-black uppercase tracking-widest italic">
                                Registry Empty.
                            </div>
                        ) : (
                            transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    onClick={() => handleEditTransaction(tx)}
                                    className="group relative bg-[#121214] hover:bg-[#18181B] border border-border/50 rounded-xl p-3 transition-all cursor-pointer overflow-hidden"
                                >
                                    <div className="flex items-center gap-3 pl-2">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                                            tx.type === 'INCOME'
                                                ? "bg-card border-emerald-500/10 text-emerald-500"
                                                : "bg-card border-red-500/10 text-red-500"
                                        )}>
                                            {tx.type === 'INCOME' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-[7px] font-black uppercase tracking-widest text-gray-600">
                                                    {tx.category}
                                                </span>
                                                <span className="text-[7px] text-gray-700 font-black uppercase">
                                                    {new Date(tx.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="font-black text-foreground text-[11px] uppercase truncate group-hover:text-primary/80 transition-colors italic leading-none">{tx.description}</p>
                                        </div>

                                        <div className={cn(
                                            "text-[12px] font-black tracking-tight whitespace-nowrap tabular-nums italic",
                                            tx.type === 'INCOME' ? "text-emerald-400" : "text-red-400"
                                        )}>
                                            {tx.type === 'INCOME' ? '+' : '-'} {formatMoney(tx.amount)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="hidden md:block fixed bottom-6 right-6">
                    <button
                        onClick={handleNewTransaction}
                        className="h-12 px-5 rounded-xl bg-primary text-foreground font-black uppercase tracking-widest shadow-2xl hover:bg-primary transition-all flex items-center gap-2 hover:scale-105 active:scale-95 text-[10px] italic border border-border/50"
                    >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        Nouvelle Entrée
                    </button>
                </div>

                <NewTransactionSheet
                    open={isSheetOpen}
                    onOpenChange={setIsSheetOpen}
                    onSuccess={fetchTransactions}
                    transactionToEdit={selectedTransaction}
                />
            </div>
        </div>
    );
}
