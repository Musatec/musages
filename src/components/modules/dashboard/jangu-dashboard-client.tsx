"use client";

import { Users, BookOpen, GraduationCap, CreditCard, CheckCircle2, Clock, AlertTriangle, MessageSquare, ArrowUpRight, Plus, Download } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { generateMonthlyTuitions } from "@/lib/actions/tuition";
import { cn } from "@/lib/utils";

interface JanguDashboardClientProps {
  schoolName: string;
  totalStudents: number;
  totalClasses: number;
  totalTeachers: number;
  totalAmountDue: number;
  totalAmountPaid: number;
  collectionRate: number;
  recentTuitions: any[];
  currentMonth: number;
  currentYear: number;
  userRole: string;
}

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export function JanguDashboardClient({
  schoolName,
  totalStudents,
  totalClasses,
  totalTeachers,
  totalAmountDue,
  totalAmountPaid,
  collectionRate,
  recentTuitions,
  currentMonth,
  currentYear,
  userRole
}: JanguDashboardClientProps) {
  const [generating, setGenerating] = useState(false);

  const handleGenerateMonthlyTuitions = async () => {
    setGenerating(true);
    toast.loading("Génération des mensualités du mois...");
    const res = await generateMonthlyTuitions(currentMonth, currentYear);
    setGenerating(false);
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`${res.count} mensualités générées avec succès pour ${MONTH_NAMES[currentMonth - 1]} !`);
    }
  };

  const handleSendWhatsAppReminder = (phone: string, parentName: string, studentName: string, amount: number) => {
    const message = encodeURIComponent(
      `Bonjour ${parentName}, rappel courtois de l'école ${schoolName} : l'écolage de ${studentName} d'un montant de ${amount.toLocaleString('fr-FR')} FCFA pour le mois de ${MONTH_NAMES[currentMonth - 1]} est disponible. Merci !`
    );
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* TOOLBAR COMPACTE PRO - SANS GRANDES CARTES */}
      <div className="bg-card border border-border rounded-xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold shrink-0 bg-primary/10 text-primary border border-primary/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-black text-foreground">{schoolName}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {MONTH_NAMES[currentMonth - 1]} {currentYear}
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Tableau de bord de direction • Suivi des écolages, bulletins et corps professoral
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerateMonthlyTuitions}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition hover:bg-primary/90"
          >
            <Plus className="w-3.5 h-3.5" />
            {generating ? "Génération..." : `Générer Écolages (${MONTH_NAMES[currentMonth - 1]})`}
          </button>
          <Link
            href="/tuition"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
          >
            <CreditCard className="w-3.5 h-3.5 text-primary" />
            Recouvrement
          </Link>
          <Link
            href="/grades"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
          >
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            Examens
          </Link>
        </div>
      </div>

      {/* Mini-Barre de Métriques Compacte */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="p-3 rounded-lg bg-card border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Élèves Inscrits</span>
            <div className="text-base font-black text-foreground">{totalStudents} <span className="text-[10px] font-normal text-muted-foreground">({totalClasses} classes)</span></div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-card border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Recouvrement</span>
            <div className="text-base font-black text-emerald-500">{collectionRate}%</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-card border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Collecté ce mois</span>
            <div className="text-sm font-black font-mono text-foreground">{totalAmountPaid.toLocaleString('fr-FR')} <span className="text-[10px] font-sans font-normal text-muted-foreground">FCFA</span></div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-card border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Corps Enseignant</span>
            <div className="text-base font-black text-foreground">{totalTeachers} <span className="text-[10px] font-normal text-muted-foreground">profs</span></div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Recouvrement des Écolages Récent & Relances WhatsApp */}
      <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div>
            <h2 className="text-lg font-bold">Derniers Écolages & Statuts de Paiement</h2>
            <p className="text-xs text-muted-foreground">Suivi des règlements au guichet ou via Wave/Orange Money avec relances WhatsApp</p>
          </div>
          <Link href="/tuition" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            Voir tout le registre <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {recentTuitions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm space-y-3">
            <Clock className="w-10 h-10 mx-auto text-muted-foreground/40" />
            <p>Aucune mensualité générée pour le moment.</p>
            <button onClick={handleGenerateMonthlyTuitions} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow">
              Générer les Écolages de {MONTH_NAMES[currentMonth - 1]}
            </button>
          </div>
        ) : (
          <>
            {/* --- REGISTRE EXCEL PRO DES ÉCOLAGES --- */}
            <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none">
              {/* Barre de Titre Feuille Excel */}
              <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs select-none">
                <div className="flex items-center gap-2">
                  <span className="bg-[#107c41] text-white px-2 py-0.5 rounded font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-sm">
                    <span>XLSX</span>
                  </span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                    Feuille : Recouvrement des Mensualités & Écolages
                  </span>
                </div>
                <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {recentTuitions.length} paiements
                </span>
              </div>

              {/* Grille Excel */}
              <div className="w-full overflow-x-auto touch-pan-x">
                <table className="w-full min-w-[650px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-[#107c41] text-white select-none">
                      <th className="w-10 text-center px-2 py-2 text-[10px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50">N°</th>
                      <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[160px]">Élève (Nom & Prénom)</th>
                      <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[90px] text-center">Classe</th>
                      <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[100px] text-center">Mois</th>
                      <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 text-right min-w-[110px]">Montant</th>
                      <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 text-center min-w-[90px]">Statut</th>
                      <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-b border-emerald-600/50 text-center w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTuitions.map((item, idx) => (
                      <tr 
                        key={item.id} 
                        className={cn(
                          "transition-colors hover:bg-[#e8f4fc] dark:hover:bg-slate-800/80",
                          idx % 2 === 1 ? "bg-[#f8fafc] dark:bg-slate-900/60" : "bg-white dark:bg-slate-900"
                        )}
                      >
                        <td className="w-10 text-center bg-[#f1f3f5] dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px] font-bold border-r border-b border-slate-200 dark:border-slate-700/80 select-none">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">
                          <div>{item.student?.firstName || item.description || "Élève"} {item.student?.lastName || ""}</div>
                          <div className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">{item.student?.matricule || "—"}</div>
                        </td>
                        <td className="px-3 py-2 text-center font-medium text-slate-700 dark:text-slate-300 border-r border-b border-slate-200 dark:border-slate-700/80">
                          {item.student?.class?.name || "—"}
                        </td>
                        <td className="px-3 py-2 text-center font-medium text-slate-700 dark:text-slate-300 border-r border-b border-slate-200 dark:border-slate-700/80">
                          {MONTH_NAMES[((item.month || currentMonth) - 1)] || MONTH_NAMES[currentMonth - 1]} {item.year || currentYear}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">
                          {(item.amount || 0).toLocaleString('fr-FR')} F
                        </td>
                        <td className="px-3 py-2 text-center border-r border-b border-slate-200 dark:border-slate-700/80">
                          <span className={cn(
                            "inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase border",
                            item.status === "PAID" 
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300" 
                              : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                          )}>
                            {item.status === "PAID" ? "Payé" : "En attente"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center border-b border-slate-200 dark:border-slate-700/80">
                          <button
                            onClick={() => handleSendWhatsAppReminder(item.student?.parentPhone || "", item.student?.parentName || "Parent", item.student?.firstName || "l'élève", item.amount || 0)}
                            className="px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold rounded border border-emerald-200 text-[10px] transition-all inline-flex items-center gap-1 shadow-2xs"
                            title="Envoyer un rappel de cotisation par WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3" /> WhatsApp
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Barre d'état Excel */}
              <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-1.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium select-none">
                <span className="font-bold text-emerald-800 dark:text-emerald-400">PRÊT • {recentTuitions.length} lignes</span>
                <span className="font-mono font-bold">Total Mensualités : {recentTuitions.reduce((acc, t) => acc + (t.amount || 0), 0).toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
