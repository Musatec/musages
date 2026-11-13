"use client";

import { useState, useEffect } from "react";
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertTriangle,
  UserCheck,
  UserX,
  UserMinus,
  Check,
  Sparkles,
  PhoneCall
} from "lucide-react";
import { saveAttendance, markParentNotified } from "@/lib/actions/attendance";
import { enqueueOfflineAction, cacheHalqas } from "@/lib/offline/db";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSpace } from "@/components/providers/space-provider";

interface AttendanceClientProps {
  classes: any[];
  todaysAttendances: any[];
  recentIssues: any[];
  schoolName: string;
}

export function AttendanceClient({
  classes: initialClasses,
  todaysAttendances: initialAttendances,
  recentIssues,
  schoolName: rawSchoolName
}: AttendanceClientProps) {
  const { activeSpace } = useSpace();
  const isSchool = activeSpace === "school";
  const schoolName = isSchool ? "École Franco-Arabe Pathé Pogne" : rawSchoolName;

  const activeClasses: any[] = initialClasses || [];

  const [attendances, setAttendances] = useState<any[]>(initialAttendances);
  const [activeTab, setActiveTab] = useState<"APPEL" | "HISTORIQUE">("APPEL");
  const [selectedSession, setSelectedSession] = useState<string>("HALQA_MORNING");

  // Appel state
  const [selectedClassId, setSelectedClassId] = useState("");
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const selectedClass = activeClasses.find((c: any) => c.id === selectedClassId) || activeClasses[0];

  useEffect(() => {
    if (activeClasses && activeClasses.length > 0) {
      cacheHalqas(activeClasses);
    }
  }, [activeClasses]);

  const getTalibeStatus = (talibeId: string) => {
    const record = attendances.find(a => (a.talibeId === talibeId || a.studentId === talibeId));
    return record?.status || null;
  };

  const handleMarkAttendance = async (talibeId: string, status: "PRESENT" | "ABSENT" | "RETARD" | "EXCUSED") => {
    setIsSaving(talibeId);

    // Optimistic UI update
    const recordDate = new Date();
    setAttendances(prev => {
      const filtered = prev.filter(a => (a.talibeId !== talibeId && a.studentId !== talibeId));
      return [...filtered, { talibeId, status, date: recordDate }];
    });

    // Cas 1 : Appareil hors-ligne
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      await enqueueOfflineAction("SAVE_ATTENDANCE", {
        studentId: talibeId,
        status,
        date: recordDate.toISOString(),
      });
      setIsSaving(null);
      toast.success("Présence enregistrée localement (Mode Hors-Ligne) 💾");
      return;
    }

    // Cas 2 : En ligne avec fallback en cas de micro-coupure
    try {
      const res = await saveAttendance({
        studentId: talibeId,
        status,
        date: recordDate,
      });

      setIsSaving(null);

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Statut de présence enregistré ! ✓");
      }
    } catch {
      await enqueueOfflineAction("SAVE_ATTENDANCE", {
        studentId: talibeId,
        status,
        date: recordDate.toISOString(),
      });
      setIsSaving(null);
      toast.info("Connexion instable : présence mise en file d'attente hors-ligne 💾");
    }
  };

  const handleSendWhatsAppAlert = async (attendanceId: string, phone: string, parentName: string, studentName: string, status: string) => {
    const statusText = status === "ABSENT" ? "est absent(e)" : "est en retard";
    const message = encodeURIComponent(
      `Assalamu alaykum ${parentName || "Parent"}, ${schoolName} vous informe que votre enfant ${studentName} ${statusText} à la séance d'aujourd'hui. Merci de nous contacter. Baraka Allahou Feekum.`
    );

    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');

    await markParentNotified(attendanceId);
  };

  const filteredTalibes = (selectedClass?.talibes || selectedClass?.students || []).filter((s: any) => {
    const name = `${s.firstName} ${s.lastName}`.toLowerCase();
    const mat = (s.matricule || "").toLowerCase();
    const query = search.toLowerCase();
    return name.includes(query) || mat.includes(query);
  });

  const presentCount = filteredTalibes.filter((s: any) => getTalibeStatus(s.id) === "PRESENT").length;
  const absentCount = filteredTalibes.filter((s: any) => getTalibeStatus(s.id) === "ABSENT").length;
  const todayStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      {/* TOOLBAR COMPACTE PRO - SANS GRANDES CARTES */}
      <div className="bg-card border border-border rounded-xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center font-bold shrink-0 border",
            isSchool 
              ? "bg-amber-500/10 text-amber-600 border-amber-500/20" 
              : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          )}>
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-black text-foreground">
                {isSchool ? "Présences & Émargement • École" : "Présences & Émargement • Daara"}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                {todayStr}
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {isSchool ? "Appel des séances de classe & notifications WhatsApp parents" : "Appel des séances de Halqa & alertes WhatsApp parents"}
            </p>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border self-start md:self-auto">
          <button
            onClick={() => setActiveTab("APPEL")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
              activeTab === "APPEL" 
                ? (isSchool ? "bg-amber-600 text-white shadow-xs" : "bg-emerald-600 text-white shadow-xs") 
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <UserCheck className="w-3.5 h-3.5" /> Appel Séance
          </button>
          <button
            onClick={() => setActiveTab("HISTORIQUE")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
              activeTab === "HISTORIQUE" 
                ? (isSchool ? "bg-amber-600 text-white shadow-xs" : "bg-emerald-600 text-white shadow-xs") 
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Incidents (30J)
          </button>
        </div>
      </div>

      {/* Barre de Sélection de Séance & Créneaux */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/30 p-2.5 rounded-xl border border-border">
        {/* Sessions Filter */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-card p-1 rounded-lg border border-border w-full sm:w-auto">
          {!isSchool && (
            <button
              onClick={() => setSelectedSession("HALQA_FAJR")}
              className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold uppercase shrink-0 transition-all", selectedSession === "HALQA_FAJR" ? "bg-emerald-500/20 text-emerald-600 font-extrabold" : "text-muted-foreground hover:bg-muted")}
            >
              Subh / Fajr
            </button>
          )}
          <button
            onClick={() => setSelectedSession("HALQA_MORNING")}
            className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold uppercase shrink-0 transition-all", selectedSession === "HALQA_MORNING" ? (isSchool ? "bg-amber-500/20 text-amber-600 font-extrabold" : "bg-emerald-500/20 text-emerald-600 font-extrabold") : "text-muted-foreground hover:bg-muted")}
          >
            Matin
          </button>
          <button
            onClick={() => setSelectedSession("HALQA_AFTERNOON")}
            className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold uppercase shrink-0 transition-all", selectedSession === "HALQA_AFTERNOON" ? (isSchool ? "bg-amber-500/20 text-amber-600 font-extrabold" : "bg-emerald-500/20 text-emerald-600 font-extrabold") : "text-muted-foreground hover:bg-muted")}
          >
            Après-midi
          </button>
          {!isSchool && (
            <button
              onClick={() => setSelectedSession("HALQA_EVENING")}
              className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold uppercase shrink-0 transition-all", selectedSession === "HALQA_EVENING" ? "bg-emerald-500/20 text-emerald-600 font-extrabold" : "text-muted-foreground hover:bg-muted")}
            >
              Nuit / Isha
            </button>
          )}
        </div>
      </div>

      {activeTab === "APPEL" && (
        <div className="space-y-6">
          {/* Class Selection & Search Bar (Compact Pro) */}
          <div className="flex flex-col sm:flex-row gap-2 bg-card border border-border p-2.5 rounded-xl shadow-xs">
            <div className="flex-1">
              <select
                value={selectedClass?.id || ""}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full h-9 bg-background border border-input rounded-lg px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">{isSchool ? "-- Choisir une Classe --" : "-- Choisir une Halqa --"}</option>
                {activeClasses.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.talibes?.length || c.students?.length || 0} {isSchool ? "Élèves" : "Talibés"})</option>
                ))}
              </select>
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input 
                type="text"
                disabled={!selectedClassId}
                placeholder={isSchool ? "Rechercher un Élève..." : "Rechercher un Talibé..."} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  "w-full h-9 bg-background border border-input rounded-lg pl-9 pr-3 text-xs focus:outline-none focus:ring-1 disabled:opacity-50",
                  isSchool ? "focus:ring-amber-500" : "focus:ring-emerald-500"
                )}
              />
            </div>
          </div>

          {/* Student Table (Style Feuille de Calcul Excel Pro) */}
          {selectedClassId ? (
            <div className="w-full overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm print:border-none print:shadow-none">

              {/* BANDEAU SUPÉRIEUR EXCEL */}
              <div className="bg-slate-100 dark:bg-slate-800/90 px-4 py-2.5 border-b border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 font-bold text-slate-800 dark:text-slate-200">
                  <div className="w-5 h-5 rounded bg-[#107c41] text-white flex items-center justify-center font-black text-[10px] shrink-0">
                    X
                  </div>
                  <span className="font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                    {isSchool ? `Feuille : Émargement Séance • Classe ${selectedClass?.name || ""}` : `Feuille : Émargement Séance • Halqa ${selectedClass?.name || ""}`}
                  </span>
                  <span className="text-slate-400 font-normal">|</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    Séance : {todayStr}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                    Présents : {presentCount}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-300 dark:bg-red-950 dark:text-red-300 font-bold">
                    Absents : {absentCount}
                  </span>
                </div>
              </div>

              {/* TABLEAU GRILLE EXCEL (DÉFILEMENT HORIZONTAL FLUIDE) */}
              <div className="w-full overflow-x-auto touch-pan-x">
                <table className="w-full min-w-[780px] border-collapse text-left text-xs text-slate-800 dark:text-slate-200">
                  <thead>
                    <tr className="bg-[#107c41] text-white font-bold text-xs uppercase tracking-wider select-none">
                      <th className="w-12 py-2.5 px-2 text-center border-r border-emerald-600/50 bg-[#0d6937] text-white/90 font-mono text-[11px]">
                        N°
                      </th>
                      <th className="w-32 py-2.5 px-3 text-center border-r border-emerald-600/50">
                        Matricule
                      </th>
                      <th className="py-2.5 px-3 border-r border-emerald-600/50 min-w-[180px]">
                        {isSchool ? "Élève (Nom & Prénom)" : "Talibé (Nom & Prénom)"}
                      </th>
                      <th className="w-28 py-2.5 px-3 text-center border-r border-emerald-600/50">
                        Régime
                      </th>
                      <th className="w-32 py-2.5 px-3 text-center border-r border-emerald-600/50">
                        Statut Appel
                      </th>
                      <th className="py-2.5 px-3 text-center min-w-[280px]">
                        Émargement Séance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTalibes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-10 text-center text-slate-400 border-b border-slate-200 dark:border-slate-800 italic">
                          Aucun élève trouvé dans cette classe.
                        </td>
                      </tr>
                    ) : (
                      filteredTalibes.map((s: any, idx: number) => {
                        const status = getTalibeStatus(s.id);
                        return (
                          <tr
                            key={s.id}
                            className={cn(
                              "transition-colors hover:bg-[#e8f4fc] dark:hover:bg-slate-800/80",
                              idx % 2 === 1 ? "bg-[#f8fafc] dark:bg-slate-800/40" : "bg-white dark:bg-slate-900"
                            )}
                          >
                            <td className="py-2 px-2 text-center font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-[#f1f3f5] dark:bg-slate-800/70 border-r border-b border-slate-200 dark:border-slate-700/80 select-none">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-3 text-center border-r border-b border-slate-200 dark:border-slate-700/80 font-mono font-bold text-emerald-700 dark:text-emerald-400 text-[11px]">
                              {s.matricule || "—"}
                            </td>
                            <td className="py-2 px-3 font-extrabold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">
                              {s.firstName} {s.lastName}
                            </td>
                            <td className="py-2 px-3 text-center border-r border-b border-slate-200 dark:border-slate-700/80">
                              <span className={cn(
                                "inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                                s.status === "INTERNE" ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300" :
                                  s.status === "DEMI_PENSION" ? "bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300" :
                                    "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                              )}>
                                {s.status === "INTERNE" ? "Internat" : s.status === "DEMI_PENSION" ? "Demi-Pen." : "Externat"}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center border-r border-b border-slate-200 dark:border-slate-700/80">
                              {status ? (
                                <span className={cn(
                                  "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                                  status === "PRESENT" ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200" :
                                    status === "ABSENT" ? "bg-red-50 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200" :
                                      status === "RETARD" ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200" :
                                        "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200"
                                )}>
                                  {status === "PRESENT" ? "Présent ✓" : status === "ABSENT" ? "Absent ✗" : status === "RETARD" ? "Retard ⏱" : "Excusé"}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs italic">—</span>
                              )}
                            </td>
                            <td className="py-2 px-3 border-b border-slate-200 dark:border-slate-700/80">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  disabled={isSaving === s.id}
                                  onClick={() => handleMarkAttendance(s.id, "PRESENT")}
                                  className={cn(
                                    "h-6 px-2 rounded font-bold text-[10px] flex items-center transition-all cursor-pointer border",
                                    status === "PRESENT"
                                      ? "bg-[#107c41] text-white border-emerald-700 shadow-2xs font-extrabold"
                                      : "bg-slate-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50"
                                  )}
                                >
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  <span>Présent</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isSaving === s.id}
                                  onClick={() => handleMarkAttendance(s.id, "ABSENT")}
                                  className={cn(
                                    "h-6 px-2 rounded font-bold text-[10px] flex items-center transition-all cursor-pointer border",
                                    status === "ABSENT"
                                      ? "bg-red-600 text-white border-red-700 shadow-2xs font-extrabold"
                                      : "bg-slate-50 dark:bg-slate-800 text-red-600 dark:text-red-300 border-slate-200 dark:border-slate-700 hover:bg-red-50"
                                  )}
                                >
                                  <UserX className="w-3 h-3 mr-1" />
                                  <span>Absent</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isSaving === s.id}
                                  onClick={() => handleMarkAttendance(s.id, "RETARD")}
                                  className={cn(
                                    "h-6 px-2 rounded font-bold text-[10px] flex items-center transition-all cursor-pointer border",
                                    status === "RETARD"
                                      ? "bg-amber-600 text-white border-amber-700 shadow-2xs font-extrabold"
                                      : "bg-slate-50 dark:bg-slate-800 text-amber-600 dark:text-amber-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50"
                                  )}
                                >
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>Retard</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isSaving === s.id}
                                  onClick={() => handleMarkAttendance(s.id, "EXCUSED")}
                                  className={cn(
                                    "h-6 px-2 rounded font-bold text-[10px] flex items-center transition-all cursor-pointer border",
                                    status === "EXCUSED"
                                      ? "bg-blue-600 text-white border-blue-700 shadow-2xs font-extrabold"
                                      : "bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-300 border-slate-200 dark:border-slate-700 hover:bg-blue-50"
                                  )}
                                >
                                  <UserMinus className="w-3 h-3 mr-1" />
                                  <span>Excusé</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>

                  {/* PIED DU TABLEAU EXCEL */}
                  <tfoot>
                    <tr className="bg-[#f1f3f5] dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-t-2 border-slate-300 dark:border-slate-600 text-xs select-none">
                      <td colSpan={3} className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500 uppercase tracking-wider text-[10px] mr-2">TOTAL APPEL :</span>
                        <span>{filteredTalibes.length} Élèves inscrits</span>
                      </td>
                      <td colSpan={2} className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                        <span className="text-emerald-700 dark:text-emerald-400 mr-3">✓ Présents : {presentCount}</span>
                        <span className="text-red-700 dark:text-red-400">✗ Absents : {absentCount}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[11px] text-slate-500">
                        Taux de présence : {filteredTalibes.length > 0 ? Math.round((presentCount / filteredTalibes.length) * 100) : 0}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed rounded-xl bg-muted/10 space-y-2">
              <CalendarCheck className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
              <p className="text-sm font-bold text-muted-foreground">Sélectionnez une Halqa ci-dessus pour faire l'appel.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "HISTORIQUE" && (
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Historique des Incidents (Absences & Retards 30 Jours)
            </CardTitle>
            <CardDescription>Consultez la liste des absences récentes et prévenez les parents par alerte WhatsApp directe.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentIssues.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun incident d'absence ou de retard enregistré récemment. 🎉
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentIssues.map((issue) => (
                  <div key={issue.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{issue.talibe?.firstName} {issue.talibe?.lastName}</span>
                        <Badge className={issue.status === "ABSENT" ? "bg-red-500/10 text-red-600 border-red-500/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30"}>
                          {issue.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Matricule: {issue.talibe?.matricule} • Halqa: {issue.talibe?.halqa?.name || "Générale"} • Date: {new Date(issue.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>

                    {issue.talibe?.parentPhone && (
                      <Button
                        size="sm"
                        onClick={() => handleSendWhatsAppAlert(
                          issue.id,
                          issue.talibe.parentPhone,
                          issue.talibe.parentName || "Parent",
                          `${issue.talibe.firstName} ${issue.talibe.lastName}`,
                          issue.status
                        )}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Parent ({issue.talibe.parentPhone})
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
