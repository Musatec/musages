"use client";

import { useState } from "react";
import { 
  CreditCard, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Wallet, 
  MessageSquare,
  Sparkles,
  Receipt,
  User,
  ArrowUpRight,
  Check,
  X,
  FileSpreadsheet
} from "lucide-react";
import { payTuitionFee } from "@/lib/actions/tuition";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

interface TalibeOption {
  id: string;
  firstName: string;
  lastName: string;
  matricule: string;
  status?: string; // INTERNE, EXTERNE, DEMI_PENSION
  parentName?: string | null;
  parentPhone?: string | null;
  halqa?: { name: string } | null;
}

interface TuitionClientProps {
  tuitions: any[];
  talibeList: TalibeOption[];
  classes: any[];
  currentMonth: number;
  currentYear: number;
  schoolName: string;
}

const ACADEMIC_MONTHS = [
  "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet"
];

export function TuitionClient({ 
  tuitions: initialTuitions, 
  talibeList,
  classes, 
  schoolName
}: TuitionClientProps) {
  const [tuitions, setTuitions] = useState<any[]>(initialTuitions);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("2026-2027");
  const [selectedRegime, setSelectedRegime] = useState<"ALL" | "INTERNE" | "EXTERNE" | "DEMI_PENSION">("ALL");

  // Inline Quick Payment Modal state
  const [activeCell, setActiveCell] = useState<{ talibe: TalibeOption; month: string } | null>(null);
  const [quickAmount, setQuickAmount] = useState("40000");
  const [paymentMethod, setPaymentMethod] = useState<"WAVE" | "ORANGE_MONEY" | "CASH" | "CHEQUE">("WAVE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map payments per student & month
  // Key format: `${talibeId}_${monthName}`
  const paymentMap: Record<string, number> = {};
  tuitions.forEach(t => {
    // Description contains month name or talibe info
    ACADEMIC_MONTHS.forEach(m => {
      if ((t.description || "").includes(m)) {
        // Find matching talibe
        const matchingTalibe = talibeList.find(s => (t.description || "").includes(s.lastName) || (t.description || "").includes(s.matricule));
        if (matchingTalibe) {
          const key = `${matchingTalibe.id}_${m}`;
          paymentMap[key] = (paymentMap[key] || 0) + (t.amount || 0);
        }
      }
    });
  });

  const filteredTalibes = talibeList.filter(s => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const mat = (s.matricule || "").toLowerCase();
    const query = search.toLowerCase();
    const matchesSearch = fullName.includes(query) || mat.includes(query);
    const matchesRegime = selectedRegime === "ALL" || s.status === selectedRegime;
    return matchesSearch && matchesRegime;
  });

  const handleQuickPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCell || !quickAmount) return;

    setIsSubmitting(true);
    const res = await payTuitionFee({
      talibeId: activeCell.talibe.id,
      amountPaid: Number(quickAmount),
      month: activeCell.month,
      paymentMethod,
    });
    setIsSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Paiement de ${Number(quickAmount).toLocaleString()} FCFA enregistré pour ${activeCell.month} ! 🎉`);
      setTuitions([res.transaction, ...tuitions]);
      setActiveCell(null);

      if (res.whatsappMessage && activeCell.talibe.parentPhone) {
        const phone = activeCell.talibe.parentPhone.replace(/[^0-9]/g, '');
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(res.whatsappMessage)}`;
        toast.info("Envoi du reçu WhatsApp...", {
          action: {
            label: "Ouvrir WhatsApp",
            onClick: () => window.open(url, '_blank')
          }
        });
      }
    }
  };

  const handleExportExcelMatrix = () => {
    const matrixData = filteredTalibes.map(s => {
      const row: any = {
        "Matricule": s.matricule,
        "Nom & Prénom": `${s.firstName} ${s.lastName}`,
        "Régime": s.status === 'INTERNE' ? 'Interne' : s.status === 'DEMI_PENSION' ? 'Demi-Pension' : 'Externe',
        "Parent / Tuteur": s.parentName || 'N/A',
        "Contact Parent": s.parentPhone || 'N/A'
      };

      ACADEMIC_MONTHS.forEach(m => {
        const paid = paymentMap[`${s.id}_${m}`];
        row[m] = paid ? `${paid.toLocaleString()} FCFA` : 'Non Payé';
      });

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(matrixData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Cotisations_${selectedYear}`);
    XLSX.writeFile(wb, `matrice_cotisations_${selectedYear}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 p-6 md:p-8 text-white border border-emerald-500/20 shadow-2xl">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-8 -translate-y-8">
          <CreditCard className="w-96 h-96 text-emerald-400" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex max-w-full flex-wrap items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" /> Tableau des 12 Mois & Recouvrement des Cotisations (Août à Juillet)
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-arabic leading-snug text-white drop-shadow-md">
            جدول الاشتراكات والدفعات الشهريّة (١٢ شهراً)
          </h1>
          <p className="text-emerald-100/80 text-sm md:text-base leading-relaxed">
            Consultez le tableau récapitulatif des cotisations mensuelles pour tous les Talibés (Internes, Externes, Demi-pensionnaires). Cliquez sur un mois pour saisir le montant payé.
          </p>
        </div>
      </div>

      {/* Filter Bar & Regime Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/40 p-3 sm:p-4 rounded-2xl border border-border max-w-full overflow-hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 w-full sm:w-auto">
          <button 
            onClick={() => setSelectedRegime("ALL")}
            className={cn("px-3 py-1.5 rounded-xl text-xs font-bold uppercase shrink-0 transition-all", selectedRegime === "ALL" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
          >
            Tous
          </button>
          <button 
            onClick={() => setSelectedRegime("INTERNE")}
            className={cn("px-3 py-1.5 rounded-xl text-xs font-bold uppercase shrink-0 transition-all", selectedRegime === "INTERNE" ? "bg-amber-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
          >
            Internes
          </button>
          <button 
            onClick={() => setSelectedRegime("DEMI_PENSION")}
            className={cn("px-3 py-1.5 rounded-xl text-xs font-bold uppercase shrink-0 transition-all", selectedRegime === "DEMI_PENSION" ? "bg-purple-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
          >
            Demi-Pension
          </button>
          <button 
            onClick={() => setSelectedRegime("EXTERNE")}
            className={cn("px-3 py-1.5 rounded-xl text-xs font-bold uppercase shrink-0 transition-all", selectedRegime === "EXTERNE" ? "bg-teal-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
          >
            Externes
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-bold text-foreground"
          >
            <option value="2026-2027">Année 2026 - 2027</option>
            <option value="2025-2026">Année 2025 - 2026</option>
          </select>

          <Button onClick={handleExportExcelMatrix} variant="outline" className="text-xs font-bold gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Matrice Excel
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-full">
        <Search className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-3 text-muted-foreground" />
        <Input 
          placeholder="Rechercher un Talibé par nom ou matricule..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rtl:pr-9 rtl:pl-3 h-10 text-sm bg-card border-border max-w-full"
        />
      </div>

      {/* 12-Month Payment Matrix Table (DESKTOP) */}
      <Card className="hidden md:block border border-border shadow-md overflow-hidden max-w-full">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left rtl:text-right text-xs border-collapse">
            <thead className="bg-muted/70 text-muted-foreground uppercase tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3 border-b sticky left-0 rtl:right-0 rtl:left-auto bg-muted z-10 min-w-[140px] sm:min-w-[180px]">Talibé</th>
                <th className="px-3 py-3 border-b min-w-[100px]">Régime</th>
                {ACADEMIC_MONTHS.map(m => (
                  <th key={m} className="px-3 py-3 border-b text-center min-w-[100px]">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTalibes.length === 0 ? (
                <tr>
                  <td colSpan={14} className="text-center py-12 text-muted-foreground">
                    Aucun Talibé trouvé.
                  </td>
                </tr>
              ) : (
                filteredTalibes.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    {/* Talibé Name & Matricule */}
                    <td className="px-4 py-3 font-bold text-foreground sticky left-0 rtl:right-0 rtl:left-auto bg-card z-10 border-r rtl:border-l rtl:border-r-0 shadow-xs">
                      <div>{s.firstName} {s.lastName}</div>
                      <div className="font-mono text-[10px] text-emerald-600">{s.matricule}</div>
                    </td>

                    {/* Regime Badge */}
                    <td className="px-3 py-3 font-medium">
                      <Badge variant="outline" className={
                        s.status === "INTERNE" ? "bg-amber-500/10 text-amber-600 border-amber-500/30 text-[9px]" :
                        s.status === "DEMI_PENSION" ? "bg-purple-500/10 text-purple-600 border-purple-500/30 text-[9px]" :
                        "bg-teal-500/10 text-teal-600 border-teal-500/30 text-[9px]"
                      }>
                        {s.status === "INTERNE" ? "Interne" : s.status === "DEMI_PENSION" ? "Demi-Pen." : "Externe"}
                      </Badge>
                    </td>

                    {/* 12 Months Payment Cells */}
                    {ACADEMIC_MONTHS.map(m => {
                      const amount = paymentMap[`${s.id}_${m}`];
                      const isPaid = amount && amount > 0;

                      return (
                        <td key={m} className="px-2 py-2 text-center">
                          <button
                            onClick={() => {
                              setActiveCell({ talibe: s, month: m });
                              if (amount) setQuickAmount(amount.toString());
                            }}
                            className={cn(
                              "w-full py-1.5 px-2 rounded-lg font-mono font-extrabold text-[11px] transition-all border",
                              isPaid 
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25" 
                                : "bg-red-500/5 border-red-500/20 text-red-500 hover:bg-red-500/15"
                            )}
                          >
                            {isPaid ? `${amount.toLocaleString()} F` : "Non Payé"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 12-Month Payment Mobile Cards (MOBILE) */}
      <div className="md:hidden flex flex-col gap-4">
        {filteredTalibes.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground text-xs">
            Aucun Talibé trouvé.
          </Card>
        ) : (
          filteredTalibes.map((s) => {
            const paidMonthsCount = ACADEMIC_MONTHS.filter(m => paymentMap[`${s.id}_${m}`] > 0).length;

            return (
              <Card key={s.id} className="p-4 border border-border shadow-sm space-y-3 bg-card">
                {/* Header Info */}
                <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-2.5">
                  <div>
                    <h3 className="font-extrabold text-sm text-foreground">{s.firstName} {s.lastName}</h3>
                    <p className="font-mono text-[11px] text-emerald-600 font-bold">{s.matricule}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <Badge variant="outline" className={
                      s.status === "INTERNE" ? "bg-amber-500/10 text-amber-600 border-amber-500/30 text-[9px]" :
                      s.status === "DEMI_PENSION" ? "bg-purple-500/10 text-purple-600 border-purple-500/30 text-[9px]" :
                      "bg-teal-500/10 text-teal-600 border-teal-500/30 text-[9px]"
                    }>
                      {s.status === "INTERNE" ? "Interne" : s.status === "DEMI_PENSION" ? "Demi-Pen." : "Externe"}
                    </Badge>
                    <span className="text-[10px] font-black text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {paidMonthsCount}/12 Mois
                    </span>
                  </div>
                </div>

                {/* 12 Months Grid */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {ACADEMIC_MONTHS.map(m => {
                    const amount = paymentMap[`${s.id}_${m}`];
                    const isPaid = amount && amount > 0;
                    const shortName = m.substring(0, 4);

                    return (
                      <button
                        key={m}
                        onClick={() => {
                          setActiveCell({ talibe: s, month: m });
                          if (amount) setQuickAmount(amount.toString());
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all active:scale-95",
                          isPaid 
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400" 
                            : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <span className="text-[9px] font-black uppercase tracking-wider opacity-75">{shortName}</span>
                        <span className={cn("text-[11px] font-mono font-extrabold mt-0.5", isPaid ? "text-emerald-600 dark:text-emerald-400" : "text-red-500/80")}>
                          {isPaid ? `${amount >= 1000 ? Math.round(amount/1000) + 'k' : amount}` : "—"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Quick Payment Modal on Cell Click */}
      {activeCell && (
        <Dialog open={!!activeCell} onOpenChange={() => setActiveCell(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <CreditCard className="w-5 h-5 text-emerald-600" /> Saisie Cotisation — {activeCell.month}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleQuickPaymentSubmit} className="space-y-4 pt-2">
              <div className="p-3 rounded-xl bg-muted/40 text-xs space-y-1">
                <p className="font-bold text-foreground">{activeCell.talibe.firstName} {activeCell.talibe.lastName}</p>
                <p className="text-muted-foreground font-mono">Matricule : {activeCell.talibe.matricule}</p>
                {activeCell.talibe.parentName && <p className="text-muted-foreground">Tuteur : {activeCell.talibe.parentName} ({activeCell.talibe.parentPhone})</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Montant à Enregistrer (FCFA)</label>
                <Input 
                  type="number" 
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  className="font-mono text-lg font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mode de Règlement</label>
                <select 
                  value={paymentMethod} 
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-semibold"
                >
                  <option value="WAVE">Wave Mobile Money (💙)</option>
                  <option value="ORANGE_MONEY">Orange Money (🧡)</option>
                  <option value="CASH">Espèces / Cash (💵)</option>
                  <option value="CHEQUE">Chèque / Virement (🏦)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setActiveCell(null)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  {isSubmitting ? "Enregistrement..." : "Valider le Paiement"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
