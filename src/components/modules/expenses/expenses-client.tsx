"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Trash2, 
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";
import { addExpense, deleteTransaction } from "@/lib/actions/expenses";
import { toast } from "sonner";

interface ExpensesClientProps {
  transactions: any[];
}

export function ExpensesClient({ transactions: initialTransactions }: ExpensesClientProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    category: "FOURNITURES",
    description: ""
  });

  const totalIncome = initialTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = initialTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.loading("Enregistrement...");

    const res = await addExpense({
      ...formData,
      amount: Number(formData.amount)
    });
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Dépense enregistrée !");
      setShowAddModal(false);
      setFormData({ amount: "", category: "FOURNITURES", description: "" });
      setTimeout(() => window.location.reload(), 1000);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Voulez-vous vraiment annuler cette transaction ?")) {
      const res = await deleteTransaction(id);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Transaction annulée.");
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic">Trésorerie & Dépenses</h1>
          <p className="text-sm text-muted-foreground">Suivi des encaissements et décaissements.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary/90 text-black font-black uppercase text-[11px] px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2 tracking-widest"
        >
          <Plus className="w-4 h-4" /> Nouvelle Dépense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Solde Net */}
        <div className="bg-card border border-border/50 p-6 rounded-[2rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-500/20 transition-all" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-muted-foreground uppercase tracking-wider text-xs">Solde Net</h3>
          </div>
          <p className="text-3xl font-black tracking-tight">{balance.toLocaleString('fr-FR')} <span className="text-lg text-muted-foreground">FCFA</span></p>
        </div>

        {/* Entrées */}
        <div className="bg-card border border-border/50 p-6 rounded-[2rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-muted-foreground uppercase tracking-wider text-xs">Total Entrées (Écolages)</h3>
          </div>
          <p className="text-3xl font-black tracking-tight text-emerald-500">{totalIncome.toLocaleString('fr-FR')} <span className="text-lg opacity-50">FCFA</span></p>
        </div>

        {/* Sorties */}
        <div className="bg-card border border-border/50 p-6 rounded-[2rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-red-500/20 transition-all" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
              <TrendingDown className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-muted-foreground uppercase tracking-wider text-xs">Total Sorties (Dépenses)</h3>
          </div>
          <p className="text-3xl font-black tracking-tight text-red-500">{totalExpense.toLocaleString('fr-FR')} <span className="text-lg opacity-50">FCFA</span></p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden mt-8">
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <h2 className="font-bold text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Journal des Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Catégorie</th>
                <th className="px-6 py-4 font-semibold text-right">Montant</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {initialTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Aucune transaction pour le moment.
                  </td>
                </tr>
              ) : (
                initialTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/20 transition-all">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {new Date(t.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      {t.type === 'INCOME' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px] uppercase tracking-wider">
                          <ArrowUpRight className="w-3.5 h-3.5" /> Entrée
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 font-bold text-[10px] uppercase tracking-wider">
                          <ArrowDownRight className="w-3.5 h-3.5" /> Sortie
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">{t.description}</td>
                    <td className="px-6 py-4 text-xs font-bold text-muted-foreground tracking-wider">{t.category.replace('_', ' ')}</td>
                    <td className={`px-6 py-4 text-right font-black ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {t.type === 'INCOME' ? '+' : '-'} {t.amount.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-6 py-4 text-right">
                      {t.type === 'EXPENSE' && (
                        <button 
                          onClick={() => handleDelete(t.id)}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Annuler la dépense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nouvelle Dépense */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border/50 rounded-[2rem] p-6 shadow-2xl z-10"
            >
              <h2 className="text-xl font-black uppercase tracking-tight italic mb-6">Enregistrer une Dépense</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Montant (FCFA)</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-2xl font-black text-red-500 focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Catégorie</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="FOURNITURES">Fournitures (Craie, Encre...)</option>
                    <option value="FACTURES">Factures (Eau, Électricité, Internet)</option>
                    <option value="LOYER">Loyer</option>
                    <option value="ENTRETIEN">Entretien & Réparations</option>
                    <option value="AUTRE">Autre Dépense</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Description</label>
                  <input 
                    required
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Ex: Achat de 2 boîtes de craie"
                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl border border-border/50 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all">Annuler</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] py-3 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Valider Dépense</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
