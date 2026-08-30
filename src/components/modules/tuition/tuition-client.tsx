"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  Search, 
  Filter, 
  MessageSquare, 
  CheckCircle2, 
  Clock,
  Download,
  Wallet,
  Plus
} from "lucide-react";
import { generateMonthlyTuitions, payTuitionFee } from "@/lib/actions/tuition";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TuitionClientProps {
  tuitions: any[];
  classes: any[];
  currentMonth: number;
  currentYear: number;
  schoolName: string;
}

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export function TuitionClient({ 
  tuitions: initialTuitions, 
  classes, 
  currentMonth, 
  currentYear,
  schoolName
}: TuitionClientProps) {
  const [tuitions, setTuitions] = useState(initialTuitions);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [generating, setGenerating] = useState(false);
  const [selectedTuition, setSelectedTuition] = useState<any | null>(null);

  // Modal payment states
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "WAVE" | "ORANGE_MONEY">("CASH");
  const [isPaying, setIsPaying] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    toast.loading("Génération des mensualités en cours...");
    const res = await generateMonthlyTuitions(currentMonth, currentYear);
    toast.dismiss();
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`${res.count} mensualités générées avec succès !`);
      setTimeout(() => window.location.reload(), 1500);
    }
    setGenerating(false);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTuition || !amountPaid) return;

    setIsPaying(true);
    toast.loading("Enregistrement du paiement...");
    const res = await payTuitionFee({
      tuitionId: selectedTuition.id,
      amountPaid: Number(amountPaid),
      paymentMethod,
    });
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Paiement enregistré !");
      if (res.whatsappMessage) {
        toast.info("Préparez-vous à envoyer le reçu WhatsApp");
        setTimeout(() => {
          window.open(`https://wa.me/${selectedTuition.student.parentPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(res.whatsappMessage)}`, '_blank');
        }, 1000);
      }
      setTimeout(() => window.location.reload(), 2000);
    }
    setIsPaying(false);
  };

  const filteredTuitions = tuitions.filter(t => {
    const matchSearch = t.student.firstName.toLowerCase().includes(search.toLowerCase()) || 
                        t.student.lastName.toLowerCase().includes(search.toLowerCase()) ||
                        t.student.matricule.toLowerCase().includes(search.toLowerCase());
    const matchClass = filterClass === "ALL" || t.student.classId === filterClass;
    const matchStatus = filterStatus === "ALL" || t.status === filterStatus;
    return matchSearch && matchClass && matchStatus;
  });

  const handleSendReminder = (phone: string, parentName: string, studentName: string, amount: number, month: number) => {
    const message = encodeURIComponent(
      `Bonjour ${parentName}, rappel courtois de l'école ${schoolName} : l'écolage de ${studentName} d'un montant de ${amount.toLocaleString('fr-FR')} FCFA pour le mois de ${MONTH_NAMES[month - 1]} est disponible. Merci !`
    );
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Recouvrement Écolages</h1>
          <p className="text-sm text-muted-foreground">Gérez les paiements Wave, Orange Money et Cash.</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={generating}
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase text-[11px] px-6 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2 tracking-widest disabled:opacity-50"
        >
          {generating ? <Clock className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Générer Mensualités
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Rechercher un élève ou matricule..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border/50 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
        <div className="flex gap-4">
          <select 
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="bg-card border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="ALL">Toutes les classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-card border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="PARTIAL">Partiel</option>
            <option value="PAID">Payé</option>
          </select>
        </div>
      </div>

      {/* Data Table / Mobile Cards */}
      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        {/* Vue Desktop: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Élève</th>
                <th className="px-6 py-4 font-semibold">Classe</th>
                <th className="px-6 py-4 font-semibold">Mois</th>
                <th className="px-6 py-4 font-semibold">Montant Dû</th>
                <th className="px-6 py-4 font-semibold">Statut</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredTuitions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Aucun écolage trouvé. Générez les mensualités pour commencer.
                  </td>
                </tr>
              ) : (
                filteredTuitions.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/20 transition-all">
                    <td className="px-6 py-4">
                      <div className="font-bold">{t.student.firstName} {t.student.lastName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{t.student.matricule}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-muted-foreground">{t.student.class.name}</td>
                    <td className="px-6 py-4">{MONTH_NAMES[t.month - 1]} {t.year}</td>
                    <td className="px-6 py-4">
                      <div className="font-black">{t.amount.toLocaleString('fr-FR')} FCFA</div>
                      {t.amountPaid > 0 && <div className="text-[10px] text-emerald-500">Payé: {t.amountPaid.toLocaleString()} FCFA</div>}
                    </td>
                    <td className="px-6 py-4">
                      {t.status === "PAID" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px] uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Payé
                        </span>
                      ) : t.status === "PARTIAL" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 font-bold text-[10px] uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5" /> Partiel
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 font-bold text-[10px] uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5" /> En attente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {t.status !== "PAID" ? (
                        <>
                          <button 
                            onClick={() => setSelectedTuition(t)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-black font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Encaisser
                          </button>
                          <button 
                            onClick={() => handleSendReminder(t.student.parentPhone, t.student.parentName, t.student.firstName, t.amount, t.month)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Relancer
                          </button>
                        </>
                      ) : (
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground hover:bg-muted-foreground/20 font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all">
                          <Download className="w-3.5 h-3.5" /> Reçu PDF
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Vue Mobile: Cartes */}
        <div className="md:hidden flex flex-col p-4 gap-4">
          {filteredTuitions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Aucun écolage trouvé.
            </div>
          ) : (
            filteredTuitions.map((t) => (
              <div key={t.id} className="bg-background border border-border/50 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm leading-tight">{t.student.firstName} {t.student.lastName}</h3>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{t.student.class.name} • {MONTH_NAMES[t.month - 1]} {t.year}</p>
                  </div>
                  <div>
                    {t.status === "PAID" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 font-black text-[9px] uppercase tracking-wider">
                        Payé
                      </span>
                    ) : t.status === "PARTIAL" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 text-amber-500 font-black text-[9px] uppercase tracking-wider">
                        Partiel
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 text-red-500 font-black text-[9px] uppercase tracking-wider">
                        En attente
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center bg-muted/30 p-2.5 rounded-lg border border-border/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Montant Dû</span>
                    <span className="font-black text-sm">{t.amount.toLocaleString('fr-FR')} F</span>
                  </div>
                  {t.amountPaid > 0 && (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-emerald-500 uppercase font-black tracking-widest">Payé</span>
                      <span className="font-black text-sm text-emerald-500">{t.amountPaid.toLocaleString('fr-FR')} F</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-1">
                  {t.status !== "PAID" ? (
                    <>
                      <button 
                        onClick={() => setSelectedTuition(t)}
                        className="flex-1 py-2 bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-widest rounded-lg flex justify-center items-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Encaisser
                      </button>
                      <button 
                        onClick={() => handleSendReminder(t.student.parentPhone, t.student.parentName, t.student.firstName, t.amount, t.month)}
                        className="flex-1 py-2 bg-emerald-500/10 text-emerald-500 font-bold text-[10px] uppercase tracking-widest rounded-lg flex justify-center items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Relancer
                      </button>
                    </>
                  ) : (
                    <button className="flex-1 py-2 bg-muted text-muted-foreground font-bold text-[10px] uppercase tracking-widest rounded-lg flex justify-center items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" /> Reçu
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedTuition && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTuition(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border/50 rounded-[2rem] p-6 shadow-2xl z-10"
            >
              <h2 className="text-xl font-black uppercase tracking-tight mb-1 text-primary">Encaisser Paiement</h2>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-6">
                Écolage {MONTH_NAMES[selectedTuition.month - 1]} {selectedTuition.year} - {selectedTuition.student.firstName}
              </p>

              <form onSubmit={handlePaymentSubmit} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Reste à payer (FCFA)</label>
                  <div className="text-3xl font-black text-foreground">
                    {(selectedTuition.amount - selectedTuition.amountPaid).toLocaleString('fr-FR')}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Montant Encaissé (FCFA)</label>
                  <input 
                    type="number" 
                    required
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="Ex: 15000"
                    max={selectedTuition.amount - selectedTuition.amountPaid}
                    className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 text-lg font-bold focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Moyen de paiement</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["CASH", "WAVE", "ORANGE_MONEY"].map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method as any)}
                        className={cn(
                          "px-2 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all flex flex-col items-center gap-1",
                          paymentMethod === method 
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-background border-border/50 text-muted-foreground hover:border-primary/30"
                        )}
                      >
                        <Wallet className="w-4 h-4 mb-1" />
                        {method.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setSelectedTuition(null)}
                    className="flex-1 py-3 rounded-xl border border-border/50 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    disabled={isPaying || !amountPaid}
                    className="flex-[2] py-3 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isPaying ? <Clock className="w-4 h-4 animate-spin" /> : "Valider"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
