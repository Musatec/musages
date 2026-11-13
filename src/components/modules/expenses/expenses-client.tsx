"use client";

import { useState } from "react";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Trash2, 
  TrendingUp,
  TrendingDown,
  Activity,
  Sparkles,
  ShoppingBag,
  HeartPulse,
  Lightbulb,
  Utensils
} from "lucide-react";
import { addExpense, deleteTransaction } from "@/lib/actions/expenses";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ExpensesClientProps {
  transactions: any[];
}

export function ExpensesClient({ transactions: initialTransactions }: ExpensesClientProps) {
  const [transactions, setTransactions] = useState<any[]>(initialTransactions);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    category: "RAVITAILLEMENT_NOURRITURE",
    description: ""
  });

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const balance = totalIncome - totalExpense;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    setIsSubmitting(true);
    const res = await addExpense({
      ...formData,
      amount: Number(formData.amount)
    });
    setIsSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Dépense enregistrée avec succès ! 🎉");
      setShowAddModal(false);
      setTransactions([res.transaction, ...transactions]);
      setFormData({ amount: "", category: "RAVITAILLEMENT_NOURRITURE", description: "" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Voulez-vous vraiment annuler cette transaction ?")) {
      const res = await deleteTransaction(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Transaction annulée.");
        setTransactions(transactions.filter(t => t.id !== id));
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* TOOLBAR COMPACTE PRO - SANS GRANDES CARTES */}
      <div className="bg-card border border-border rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold shrink-0 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-black text-foreground">
                Gestion de la Trésorerie & Caisse Daara
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-arabic">
                إدارة الخزينة
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Suivi chronologique des encaissements et des décaissements opérationnels
            </p>
          </div>
        </div>

        {/* Action + Nouvelle Dépense */}
        <div className="flex items-center gap-2">
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 rounded-lg shadow-xs">
                <Plus className="w-4 h-4" /> Nouvelle Dépense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                  <TrendingDown className="w-5 h-5 text-red-500" /> Saisie d'une Dépense Daara
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Catégorie de Dépense</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-semibold"
                  >
                    <option value="RAVITAILLEMENT_NOURRITURE">Ravitaillement Repas Interne (Riz, Huile, Viande)</option>
                    <option value="SALAIRE_OUSTAZ">Traitement / Salaire Oustaz (المشايخ)</option>
                    <option value="ELECTRICITE_EAU">Facture Électricité & Eau (Senelec / Sen'Eau)</option>
                    <option value="SANTE_MEDICAMENTS">Santé & Médicaments Talibés</option>
                    <option value="ENTRETIEN_NATTES">Fournitures & Nattes d'Étude (Allwas / لوح)</option>
                    <option value="ENTRETIEN_BATIMENT">Maintenance & Réparations Bâtiment</option>
                    <option value="DIVERS">Dépenses Diverses</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Montant (FCFA)</label>
                  <Input 
                    type="number"
                    placeholder="Ex: 50000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="font-mono font-bold text-base"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Motif / Description</label>
                  <Input 
                    placeholder="Ex: Achat de 2 sacs de riz 50kg pour le réfectoire des internes" 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                    {isSubmitting ? "Enregistrement..." : "Enregistrer la Dépense"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Mini-Barre de Métriques Compacte (1 seule ligne) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card border border-border rounded-lg px-3 py-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Solde Net</p>
            <p className="text-sm font-black font-mono text-foreground">{balance.toLocaleString('fr-FR')} <span className="text-[10px] font-sans font-normal text-muted-foreground">FCFA</span></p>
          </div>
          <Wallet className="w-4 h-4 text-emerald-500 shrink-0" />
        </div>
        <div className="bg-card border border-border rounded-lg px-3 py-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-emerald-600">Total Recettes</p>
            <p className="text-sm font-black font-mono text-emerald-600">+{totalIncome.toLocaleString('fr-FR')} <span className="text-[10px] font-sans font-normal opacity-70">FCFA</span></p>
          </div>
          <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
        </div>
        <div className="bg-card border border-border rounded-lg px-3 py-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-red-500">Total Dépenses</p>
            <p className="text-sm font-black font-mono text-red-500">-{totalExpense.toLocaleString('fr-FR')} <span className="text-[10px] font-sans font-normal opacity-70">FCFA</span></p>
          </div>
          <TrendingDown className="w-4 h-4 text-red-500 shrink-0" />
        </div>
      </div>

      {/* --- REGISTRE EXCEL PRO DES TRANSACTIONS --- */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none">
        {/* Barre de Titre Feuille Excel */}
        <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="bg-[#107c41] text-white px-2 py-0.5 rounded font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-sm">
              <span>XLSX</span>
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              Feuille : Journal Général des Recettes & Décaissements
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {transactions.length} {transactions.length > 1 ? "écritures" : "écriture"}
            </span>
          </div>
        </div>

        {/* Grille Excel */}
        <div className="w-full overflow-x-auto touch-pan-x">
          <table className="w-full min-w-[650px] border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#107c41] text-white select-none">
                <th className="w-12 text-center px-2 py-2 text-[10px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50">N°</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[130px]">Date & Heure</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[90px] text-center">Type Flux</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50">Libellé / Description</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[130px]">Catégorie</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 text-right min-w-[130px]">Montant</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-b border-emerald-600/50 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground border-b border-slate-200 dark:border-slate-700/80 italic bg-white dark:bg-slate-900">
                    Aucune transaction enregistrée.
                  </td>
                </tr>
              ) : (
                transactions.map((t, idx) => {
                  const isIncome = t.type === 'INCOME';
                  return (
                    <tr 
                      key={t.id} 
                      className={cn(
                        "transition-colors hover:bg-[#e8f4fc] dark:hover:bg-slate-800/80",
                        idx % 2 === 1 ? "bg-[#f8fafc] dark:bg-slate-900/60" : "bg-white dark:bg-slate-900"
                      )}
                    >
                      <td className="w-12 text-center bg-[#f1f3f5] dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px] font-bold border-r border-b border-slate-200 dark:border-slate-700/80 select-none">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap border-r border-b border-slate-200 dark:border-slate-700/80">
                        {format(new Date(t.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                      </td>
                      <td className="px-3 py-2 text-center border-r border-b border-slate-200 dark:border-slate-700/80">
                        <span className={cn(
                          "inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase border",
                          isIncome ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300" : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300"
                        )}>
                          {isIncome ? "Entrée" : "Dépense"}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">
                        {t.description}
                      </td>
                      <td className="px-3 py-2 text-xs font-medium uppercase text-slate-600 dark:text-slate-300 border-r border-b border-slate-200 dark:border-slate-700/80">
                        {t.category}
                      </td>
                      <td className={cn(
                        "px-3 py-2 text-right font-mono font-bold text-sm border-r border-b border-slate-200 dark:border-slate-700/80",
                        isIncome ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      )}>
                        {isIncome ? '+' : '-'}{(t.amount || 0).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="px-3 py-2 text-center border-b border-slate-200 dark:border-slate-700/80">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleDelete(t.id)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 h-7 w-7"
                          title="Supprimer la transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Barre d'état Excel */}
        <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium select-none">
          <div className="flex items-center gap-3">
            <span className="font-bold text-emerald-800 dark:text-emerald-400">PRÊT</span>
            <span>•</span>
            <span>Affichage : {transactions.length} écritures</span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span>Entrées : <strong className="text-emerald-700 dark:text-emerald-400">+{totalIncome.toLocaleString('fr-FR')} F</strong></span>
            <span>Sorties : <strong className="text-red-600 dark:text-red-400">-{totalExpense.toLocaleString('fr-FR')} F</strong></span>
            <span>Solde : <strong className={balance >= 0 ? "text-emerald-800 dark:text-emerald-300 font-black" : "text-red-600"}>{balance.toLocaleString('fr-FR')} F</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
