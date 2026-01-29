"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
    Wallet, TrendingUp, TrendingDown,
    Plus, Filter, ArrowUpRight, ArrowDownRight,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import { Transaction } from "@/types/capital";
import { NewTransactionSheet } from "@/components/capital/new-transaction-sheet";


export default function CapitalPage() {
    const { user } = useSupabase();
    const t = useTranslations("Capital");

    // States
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM

    // Metrics
    const [balance, setBalance] = useState(0);
    const [incomeMonth, setIncomeMonth] = useState(0);
    const [expenseMonth, setExpenseMonth] = useState(0);

    const fetchTransactions = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        try {
            // Fetch all transactions for calculation history 
            // In a real large app, we would use DB aggregation, but for now client-side is fine for individual users
            const query = supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;

            const allTx = data as Transaction[];
            setTransactions(allTx);

            // Calculate Metrics
            let totalIncome = 0;
            let totalExpense = 0;
            let currentMonthIncome = 0;
            let currentMonthExpense = 0;

            const actualCurrentMonth = new Date().toISOString().slice(0, 7);

            allTx.forEach(tx => {
                const isIncome = tx.type === 'INCOME';
                const amount = Number(tx.amount);
                const txMonth = tx.date.slice(0, 7);

                if (isIncome) totalIncome += amount;
                else totalExpense += amount;

                if (txMonth === actualCurrentMonth) {
                    if (isIncome) currentMonthIncome += amount;
                    else currentMonthExpense += amount;
                }
            });

            setBalance(totalIncome - totalExpense);
            setIncomeMonth(currentMonthIncome);
            setExpenseMonth(currentMonthExpense);

        } catch (error: any) {
            console.error("Error fetching transactions:", error);
            toast.error("Erreur de chargement des données financières.");
        } finally {
            setLoading(false);
        }
    }, [user, filterMonth]);

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

    const filteredTransactions = transactions.filter(t => t.date.startsWith(filterMonth));

    if (!user) return null;

    return (
        <div className="min-h-screen w-full bg-[#050505] text-white p-4 md:p-8 pb-32 font-sans selection:bg-emerald-500/30">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] pl-1 mb-2">Finance</p>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase italic leading-[0.9]">
                            Gestion <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">Capital</span>
                        </h1>
                    </div>
                    {/* Filter Button */}
                    <div className="flex items-center gap-2 bg-[#1C1C1E] border border-white/5 p-1 rounded-xl">
                        <input
                            type="month"
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                            className="bg-transparent text-xs font-bold uppercase tracking-wider text-gray-400 focus:text-white outline-none px-3 py-2 cursor-pointer"
                        />
                    </div>
                </div>

                {/* ZONE A: BILAN */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Solde Actuel - HERO STYLE */}
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 relative overflow-hidden group shadow-2xl shadow-orange-900/50 border border-t-white/20 border-b-transparent border-l-transparent border-r-transparent">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />

                        <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-100/80">Solde Total</span>
                                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md text-white shadow-sm border border-white/10"><Wallet className="w-5 h-5" /></div>
                            </div>

                            <div>
                                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-sm">
                                    {loading ? "..." : formatMoney(balance)}
                                </h2>
                                <p className="text-xs text-orange-100 font-medium mt-1 opacity-80">Disponible maintenant</p>
                            </div>
                        </div>
                    </div>

                    {/* Revenus - GLASS STYLE */}
                    <div className="bg-[#1C1C1E]/50 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden group hover:bg-emerald-500/5 transition-all duration-500">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/20 blur-[60px] rounded-full group-hover:bg-emerald-500/30 transition-all" />

                        <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-zinc-900 text-emerald-500 border border-emerald-500/20"><TrendingUp className="w-5 h-5" /></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Entrées</span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                                    {loading ? "..." : formatMoney(incomeMonth)}
                                </h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold uppercase tracking-wide border border-emerald-500/20">Mois</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Depenses - GLASS STYLE */}
                    <div className="bg-[#1C1C1E]/50 backdrop-blur-xl border border-red-500/20 rounded-3xl p-6 relative overflow-hidden group hover:bg-red-500/5 transition-all duration-500">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-red-500/20 blur-[60px] rounded-full group-hover:bg-red-500/30 transition-all" />

                        <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-zinc-900 text-red-500 border border-red-500/20"><TrendingDown className="w-5 h-5" /></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Sorties</span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tight group-hover:text-red-400 transition-colors">
                                    {loading ? "..." : formatMoney(expenseMonth)}
                                </h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-500 font-bold uppercase tracking-wide border border-red-500/20">Mois</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ZONE B: LISTE DES TRANSACTIONS */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Historique • {new Date(filterMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h3>
                    </div>

                    <div className="space-y-2">
                        <div className="space-y-3">
                            {loading ? (
                                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
                            ) : filteredTransactions.length === 0 ? (
                                <div className="py-12 border border-dashed border-white/10 rounded-3xl text-center text-gray-600 font-medium text-sm">
                                    Aucun mouvement ce mois-ci.
                                </div>
                            ) : (
                                filteredTransactions.map(tx => (
                                    <div
                                        key={tx.id}
                                        onClick={() => handleEditTransaction(tx)}
                                        className="group relative bg-[#1C1C1E] hover:bg-[#202022] border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all duration-300 cursor-pointer overflow-hidden"
                                    >
                                        {/* Decorative Sidebar for Type */}
                                        <div className={cn(
                                            "absolute left-0 top-0 bottom-0 w-1 transition-colors",
                                            tx.type === 'INCOME' ? "bg-emerald-500" : "bg-red-500"
                                        )} />

                                        <div className="flex items-center gap-4 pl-2">
                                            {/* Icon Box */}
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner",
                                                tx.type === 'INCOME'
                                                    ? "bg-zinc-900 border-emerald-500/20 text-emerald-500"
                                                    : "bg-zinc-900 border-red-500/20 text-red-500"
                                            )}>
                                                {tx.type === 'INCOME' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                                                        {tx.category}
                                                    </span>
                                                    <span className="text-[10px] text-gray-600 font-mono">
                                                        {new Date(tx.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="font-bold text-white text-sm md:text-base truncate group-hover:text-orange-400 transition-colors">{tx.description}</p>
                                            </div>

                                            {/* Value */}
                                            <div className={cn(
                                                "text-lg font-black tracking-tight whitespace-nowrap tabular-nums",
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
                </div>

                {/* ZONE C: Floating Action Button (Desktop Only - Mobile covered by MobileFab) */}
                <div className="hidden md:block fixed bottom-8 right-8">
                    <button
                        onClick={handleNewTransaction}
                        className="h-14 px-6 rounded-full bg-orange-500 text-white font-black uppercase tracking-widest shadow-2xl hover:bg-orange-600 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Transaction
                    </button>
                </div>

                {/* Transaction Sheet */}
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
