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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 p-6 md:p-8 text-white border border-emerald-500/20 shadow-2xl">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-8 -translate-y-8">
          <Wallet className="w-96 h-96 text-emerald-400" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Gestion de la Trésorerie & Caisse Daara
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-arabic leading-snug text-white drop-shadow-md">
            إدارة الخزينة والمصروفات التشغيليّة
          </h1>
          <p className="text-emerald-100/80 text-sm md:text-base leading-relaxed">
            Suivez en temps réel les entrées (Sadaqa, scolariés, parrainages) et décaissements (nourriture des pensionnaires, salaires Oustazs, santé).
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Solde Net */}
        <Card className="border border-emerald-500/20 shadow-sm relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Solde Net Disponible</span>
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-foreground font-mono">
              {balance.toLocaleString('fr-FR')} <span className="text-sm font-sans text-muted-foreground">FCFA</span>
            </h3>
          </CardContent>
        </Card>

        {/* Total Entrées */}
        <Card className="border border-emerald-500/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">Total Entrées (Recettes)</span>
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-emerald-600 font-mono">
              +{totalIncome.toLocaleString('fr-FR')} <span className="text-sm font-sans opacity-70">FCFA</span>
            </h3>
          </CardContent>
        </Card>

        {/* Total Sorties */}
        <Card className="border border-red-500/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-600">Total Sorties (Dépenses)</span>
              <div className="w-10 h-10 bg-red-500/10 text-red-600 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-red-600 font-mono">
              -{totalExpense.toLocaleString('fr-FR')} <span className="text-sm font-sans opacity-70">FCFA</span>
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/40 p-4 rounded-2xl border border-border">
        <div>
          <h3 className="text-base font-extrabold flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" /> Journal Général des Opérations ({transactions.length})
          </h3>
          <p className="text-xs text-muted-foreground">Historique chronologique des encaissements et des dépenses de la caisse.</p>
        </div>

        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-lg shadow-emerald-600/20">
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

      {/* Transactions Table */}
      <Card className="border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 font-bold">Date</th>
                <th className="px-6 py-3.5 font-bold">Type</th>
                <th className="px-6 py-3.5 font-bold">Description</th>
                <th className="px-6 py-3.5 font-bold">Catégorie</th>
                <th className="px-6 py-3.5 font-bold text-right">Montant</th>
                <th className="px-6 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucune transaction enregistrée.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const isIncome = t.type === 'INCOME';
                  return (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(t.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={isIncome ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-red-500/10 text-red-600 border-red-500/30"}>
                          {isIncome ? <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-1" />}
                          {isIncome ? "ENTRÉE" : "DÉPENSE"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground max-w-xs truncate">
                        {t.description}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-muted-foreground uppercase">
                        {t.category}
                      </td>
                      <td className={`px-6 py-4 text-right font-mono font-extrabold text-base ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isIncome ? '+' : '-'}{(t.amount || 0).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleDelete(t.id)}
                          className="text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
