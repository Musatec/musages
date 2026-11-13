"use client";

import { useState } from "react";
import { 
  CreditCard, 
  Search, 
  Sparkles,
  FileSpreadsheet
} from "lucide-react";
import { recordTuitionPayment } from "@/lib/actions/tuition";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { useSpace } from "@/components/providers/space-provider";

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
  talibeList: initialTalibeList,
  classes, 
  schoolName: rawSchoolName
}: TuitionClientProps) {
  const { activeSpace } = useSpace();
  const isSchool = activeSpace === "school";
  const schoolName = isSchool ? "École Franco-Arabe Pathé Pogne" : rawSchoolName;
  const activeTalibes: TalibeOption[] = initialTalibeList || [];

  const [tuitions, setTuitions] = useState<any[]>(initialTuitions);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("2026-2027");
  const [selectedRegime, setSelectedRegime] = useState<"ALL" | "INTERNE" | "EXTERNE" | "DEMI_PENSION">("ALL");

  // Inline Quick Payment Modal state
  const [activeCell, setActiveCell] = useState<{ talibe: TalibeOption; month: string } | null>(null);
  const [quickAmount, setQuickAmount] = useState("40000");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CHEQUE">("CASH");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map payments per student & month
  // Key format: `${talibeId}_${monthName}`
  const paymentMap: Record<string, number> = {};
  tuitions.forEach(t => {
    const desc = t.description || "";
    ACADEMIC_MONTHS.forEach(m => {
      if (desc.includes(m)) {
        // Prioriser la correspondance exacte par matricule avant le nom complet
        const matchingTalibe =
          activeTalibes.find((s: TalibeOption) => Boolean(s.matricule) && desc.includes(s.matricule)) ||
          activeTalibes.find((s: TalibeOption) => {
            const fullName = `${s.firstName} ${s.lastName}`.trim();
            return fullName.length > 0 && desc.includes(fullName);
          });
        if (matchingTalibe) {
          const key = `${matchingTalibe.id}_${m}`;
          paymentMap[key] = (paymentMap[key] || 0) + (t.amount || 0);
        }
      }
    });
  });

  const filteredTalibes = activeTalibes.filter((s: TalibeOption) => {
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
    const res = await recordTuitionPayment({
      talibeId: activeCell.talibe.id,
      amountPaid: Number(quickAmount),
      month: activeCell.month,
      paymentMethod,
    });
    setIsSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Règlement de ${Number(quickAmount).toLocaleString()} FCFA enregistré pour ${activeCell.month} ! 🎉`);
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

  const handleExportExcelMatrix = async () => {
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

    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(matrixData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Cotisations_${selectedYear}`);
    XLSX.writeFile(wb, `matrice_cotisations_${selectedYear}.xlsx`);
    toast.success("Matrice Excel exportée avec succès !");
  };

  return (
    <div className="space-y-3">
      {/* TOOLBAR COMPACTE PRO - SANS GRANDES CARTES */}
      <div className="bg-card border border-border rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center font-bold shrink-0 border",
            isSchool ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          )}>
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-black text-foreground">
                {isSchool ? "Recouvrement des Écolages (12 Mois)" : "Recouvrement des Cotisations (12 Mois)"}
              </h1>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded border",
                isSchool ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              )}>
                Août à Juillet
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {isSchool ? "Matrice annuelle des frais de scolarité par élève" : "Matrice annuelle des cotisations et participations par talibé"}
            </p>
          </div>
        </div>

        {/* Année & Export Excel */}
        <div className="flex items-center gap-2 shrink-0">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-input bg-background text-xs font-bold text-foreground"
          >
            <option value="2026-2027">2026 - 2027</option>
            <option value="2025-2026">2025 - 2026</option>
          </select>

          <Button onClick={handleExportExcelMatrix} variant="outline" size="sm" className="h-8 text-xs font-bold gap-1.5 rounded-lg">
            <FileSpreadsheet className={cn("w-3.5 h-3.5", isSchool ? "text-amber-600" : "text-emerald-600")} /> Export XLSX
          </Button>
        </div>
      </div>

      {/* Barre de Filtres Régime & Recherche Rapide */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-muted/30 p-2 rounded-xl border border-border">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setSelectedRegime("ALL")}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-bold uppercase shrink-0 transition-all", 
              selectedRegime === "ALL" ? (isSchool ? "bg-amber-600 text-white shadow-xs" : "bg-emerald-600 text-white shadow-xs") : "text-muted-foreground hover:bg-muted"
            )}
          >
            Tous
          </button>
          <button 
            onClick={() => setSelectedRegime("INTERNE")}
            className={cn("px-2.5 py-1 rounded-md text-xs font-bold uppercase shrink-0 transition-all", selectedRegime === "INTERNE" ? "bg-amber-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
          >
            Internes
          </button>
          <button 
            onClick={() => setSelectedRegime("DEMI_PENSION")}
            className={cn("px-2.5 py-1 rounded-md text-xs font-bold uppercase shrink-0 transition-all", selectedRegime === "DEMI_PENSION" ? "bg-purple-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
          >
            Demi-Pension
          </button>
          <button 
            onClick={() => setSelectedRegime("EXTERNE")}
            className={cn("px-2.5 py-1 rounded-md text-xs font-bold uppercase shrink-0 transition-all", selectedRegime === "EXTERNE" ? "bg-teal-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
          >
            Externes
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input 
            placeholder={isSchool ? "Rechercher un élève..." : "Rechercher un talibé..."} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-card border-border"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MATRICE EXCEL DES COTISATIONS & ÉCOLAGES (BORDURES FINES, GRILLE PRO)     */}
      {/* ========================================================================= */}
      <div className="w-full overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm print:border-none print:shadow-none">
        
        {/* BANDEAU SUPÉRIEUR FEUILLE EXCEL */}
        <div className="bg-slate-100 dark:bg-slate-800/90 px-4 py-2.5 border-b border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 font-bold text-slate-800 dark:text-slate-200">
            <div className="w-5 h-5 rounded bg-[#107c41] text-white flex items-center justify-center font-black text-[10px] shrink-0">
              X
            </div>
            <span className="font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              {isSchool ? "Feuille : Matrice Comptable des Écolages • 12 Mois" : "Feuille : Matrice Comptable des Cotisations Daara • 12 Mois"}
            </span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="text-slate-500 font-mono text-[11px]">Exercice : {selectedYear}</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-[#107c41]/10 text-[#107c41] dark:text-emerald-400 border border-[#107c41]/30 font-bold">
              {filteredTalibes.length} Élèves inscrits
            </span>
          </div>
        </div>

        {/* GRILLE MATRICIELLE EXCEL */}
        <div className="w-full overflow-x-auto touch-pan-x">
          <table className="w-full min-w-[1300px] border-collapse text-left text-xs text-slate-800 dark:text-slate-200">
            <thead>
              <tr className="bg-[#107c41] text-white font-bold text-xs uppercase tracking-wider select-none">
                <th className="w-12 py-2 px-2 text-center border-r border-emerald-600/50 bg-[#0d6937] text-white/90 font-mono text-[11px]">
                  N°
                </th>
                <th className="w-48 py-2 px-3 border-r border-emerald-600/50 sticky left-0 z-20 bg-[#107c41] text-white shadow-xs">
                  {isSchool ? "Élève (Nom & Prénom)" : "Talibé (Nom & Prénom)"}
                </th>
                <th className="w-28 py-2 px-3 text-center border-r border-emerald-600/50">
                  Matricule
                </th>
                <th className="w-24 py-2 px-2 text-center border-r border-emerald-600/50">
                  Régime
                </th>
                {ACADEMIC_MONTHS.map(m => (
                  <th key={m} className="py-2 px-2 border-r border-emerald-600/50 text-center min-w-[85px] text-[11px]">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTalibes.length === 0 ? (
                <tr>
                  <td colSpan={16} className="text-center py-12 text-slate-400 border-b border-slate-200 dark:border-slate-800 italic">
                    {isSchool ? "Aucun élève trouvé dans les critères." : "Aucun Talibé trouvé dans les critères."}
                  </td>
                </tr>
              ) : (
                filteredTalibes.map((s, idx) => (
                  <tr 
                    key={s.id} 
                    className={cn(
                      "transition-colors hover:bg-[#e8f4fc] dark:hover:bg-slate-800/80",
                      idx % 2 === 1 ? "bg-[#f8fafc] dark:bg-slate-800/40" : "bg-white dark:bg-slate-900"
                    )}
                  >
                    {/* N° Excel */}
                    <td className="py-2 px-2 text-center font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-[#f1f3f5] dark:bg-slate-800/70 border-r border-b border-slate-200 dark:border-slate-700/80 select-none">
                      {idx + 1}
                    </td>

                    {/* Nom & Prénom (Colonne Figée Excel) */}
                    <td className="py-2 px-3 font-extrabold text-slate-900 dark:text-slate-100 sticky left-0 z-10 bg-inherit border-r border-b border-slate-200 dark:border-slate-700/80 shadow-xs">
                      <div className="truncate max-w-[180px]">{s.firstName} {s.lastName}</div>
                      {s.parentPhone && <div className="text-[10px] text-slate-500 font-normal font-mono">{s.parentPhone}</div>}
                    </td>

                    {/* Matricule */}
                    <td className="py-2 px-3 text-center border-r border-b border-slate-200 dark:border-slate-700/80 font-mono font-bold text-emerald-700 dark:text-emerald-400 text-[11px]">
                      {s.matricule}
                    </td>

                    {/* Régime */}
                    <td className="py-2 px-2 text-center border-r border-b border-slate-200 dark:border-slate-700/80">
                      <span className={cn(
                        "inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border",
                        s.status === "INTERNE" ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300" :
                        s.status === "DEMI_PENSION" ? "bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300" :
                        "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300"
                      )}>
                        {s.status === "INTERNE" ? "Interne" : s.status === "DEMI_PENSION" ? "Demi-P." : "Externe"}
                      </span>
                    </td>

                    {/* 12 Cellules Mensuelles Excel */}
                    {ACADEMIC_MONTHS.map(m => {
                      const amount = paymentMap[`${s.id}_${m}`];
                      const isPaid = amount && amount > 0;

                      return (
                        <td key={m} className="p-1 border-r border-b border-slate-200 dark:border-slate-700/80 text-center">
                          <button
                            onClick={() => {
                              setActiveCell({ talibe: s, month: m });
                              if (amount) setQuickAmount(amount.toString());
                            }}
                            title={`Cliquer pour saisir/modifier : ${m}`}
                            className={cn(
                              "w-full py-1 px-1 rounded font-mono font-bold text-[10px] transition-all border",
                              isPaid 
                                ? "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800 font-extrabold hover:bg-emerald-200" 
                                : "bg-transparent text-slate-400 border-transparent hover:border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                          >
                            {isPaid ? `${amount.toLocaleString('fr-FR')} F` : "—"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>

            {/* PIED DU TABLEAU EXCEL */}
            <tfoot>
              <tr className="bg-[#f1f3f5] dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-t-2 border-slate-300 dark:border-slate-600 text-xs select-none">
                <td colSpan={4} className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] mr-2">TOTAL MATRICE :</span>
                  <span>{filteredTalibes.length} Inscrits</span>
                </td>
                {ACADEMIC_MONTHS.map(m => {
                  const monthTotal = filteredTalibes.reduce((acc, s) => acc + (paymentMap[`${s.id}_${m}`] || 0), 0);
                  return (
                    <td key={m} className="py-2 px-1 text-center font-mono font-bold text-[10px] border-r border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      {monthTotal > 0 ? `${(monthTotal / 1000).toFixed(0)}k` : "0"}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
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

              <p className="text-xs text-muted-foreground">Saisissez ici un règlement reçu physiquement par l’établissement. Aucun paiement en ligne n’est effectué dans l’application.</p>

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
                  <option value="CASH">Espèces / Cash (💵)</option>
                  <option value="CHEQUE">Chèque</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setActiveCell(null)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  {isSubmitting ? "Enregistrement..." : "Enregistrer le règlement"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
