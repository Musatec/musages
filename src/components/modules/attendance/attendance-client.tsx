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

const MOCK_SCHOOL_CLASSES = [
  {
    id: "cls-ci",
    name: "Classe CI (Cours Initiatique)",
    talibes: [
      { id: "sch-1", firstName: "Alioune", lastName: "Badara", matricule: "EP-2026-001", status: "INTERNE", parentName: "Mamadou Badara", parentPhone: "+221 77 123 45 67" },
      { id: "sch-2", firstName: "Fatoumata", lastName: "Sarr", matricule: "EP-2026-002", status: "EXTERNE", parentName: "Oumar Sarr", parentPhone: "+221 78 234 56 78" },
      { id: "sch-3", firstName: "Moussa", lastName: "Kante", matricule: "EP-2026-003", status: "INTERNE", parentName: "Cheikh Kante", parentPhone: "+221 70 345 67 89" },
    ]
  },
  {
    id: "cls-cp",
    name: "Classe CP (Cours Préparatoire)",
    talibes: [
      { id: "sch-5", firstName: "Aïssatou", lastName: "Fall", matricule: "EP-2026-005", status: "EXTERNE", parentName: "Ibrahima Fall", parentPhone: "+221 77 456 78 90" },
      { id: "sch-6", firstName: "Cheikh Tidiane", lastName: "Sy", matricule: "EP-2026-006", status: "INTERNE", parentName: "Serigne Sy", parentPhone: "+221 76 567 89 01" }
    ]
  },
  {
    id: "cls-ce1",
    name: "Classe CE1 (Cours Élémentaire 1)",
    talibes: [
      { id: "sch-8", firstName: "Mariama", lastName: "Bâ", matricule: "EP-2026-008", status: "INTERNE", parentName: "Alassane Bâ", parentPhone: "+221 77 678 90 12" },
      { id: "sch-9", firstName: "Ibrahima", lastName: "Sow", matricule: "EP-2026-009", status: "EXTERNE", parentName: "Amadou Sow", parentPhone: "+221 78 789 01 23" }
    ]
  },
  {
    id: "cls-cm2",
    name: "Classe CM2 (Cours Moyen 2)",
    talibes: [
      { id: "sch-15", firstName: "Ousmane", lastName: "Kane", matricule: "EP-2026-015", status: "INTERNE", parentName: "Saliou Kane", parentPhone: "+221 77 012 34 56" }
    ]
  }
];

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

  const activeClasses = (isSchool || !initialClasses || initialClasses.length === 0) ? MOCK_SCHOOL_CLASSES : initialClasses;

  const [attendances, setAttendances] = useState<any[]>(initialAttendances);
  const [activeTab, setActiveTab] = useState<"APPEL" | "HISTORIQUE">("APPEL");
  const [selectedSession, setSelectedSession] = useState<string>("HALQA_MORNING");
  
  // Appel state
  const [selectedClassId, setSelectedClassId] = useState("");
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const selectedClass = activeClasses.find(c => c.id === selectedClassId) || activeClasses[0];

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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={cn(
        "relative overflow-hidden rounded-3xl p-4 sm:p-6 md:p-8 text-white border shadow-2xl transition-colors",
        isSchool 
          ? "bg-gradient-to-r from-amber-950 via-amber-900 to-yellow-950 border-amber-500/30" 
          : "bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 border-emerald-500/20"
      )}>
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-8 -translate-y-8">
          <CalendarCheck className={cn("w-96 h-96", isSchool ? "text-amber-400" : "text-emerald-400")} />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className={cn(
            "inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest border",
            isSchool ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
          )}>
            <Sparkles className={cn("w-4 h-4", isSchool ? "text-amber-300" : "text-emerald-400")} /> Présences & WhatsApp Parents
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-arabic leading-snug text-white drop-shadow-md">
            {isSchool ? "سجل الحضور والغياب • المدرسة الإبتدائية" : "تسجيل حضور وغياب الطلاب بالحلقات"}
          </h1>
          <p className="text-amber-100/80 text-xs sm:text-sm md:text-base leading-relaxed">
            {isSchool 
              ? "Effectuez l'appel des séances de classe (Matin, Après-midi) et prévenez instantanément les parents en cas d'absence." 
              : "Effectuez l'appel des séances de Halqa (Subh/Fajr, Matin, Après-midi, Isha) et prévenez instantanément les parents en cas d'absence."}
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/40 p-2 sm:p-3 rounded-2xl border border-border">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("APPEL")}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0",
              activeTab === "APPEL" 
                ? (isSchool ? "bg-amber-600 text-white shadow-md shadow-amber-600/20" : "bg-emerald-600 text-white shadow-md shadow-emerald-600/20") 
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <UserCheck className="w-4 h-4" /> Appel Séance
          </button>
          <button 
            onClick={() => setActiveTab("HISTORIQUE")}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0",
              activeTab === "HISTORIQUE" 
                ? (isSchool ? "bg-amber-600 text-white shadow-md shadow-amber-600/20" : "bg-emerald-600 text-white shadow-md shadow-emerald-600/20") 
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <AlertTriangle className="w-4 h-4" /> Incidents (30J)
          </button>
        </div>

        {/* Sessions Filter */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-background p-1 rounded-xl border border-border w-full sm:w-auto">
          {!isSchool && (
            <button 
              onClick={() => setSelectedSession("HALQA_FAJR")} 
              className={cn("px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase shrink-0", selectedSession === "HALQA_FAJR" ? "bg-emerald-500/20 text-emerald-600" : "text-muted-foreground")}
            >
              Subh / Fajr
            </button>
          )}
          <button 
            onClick={() => setSelectedSession("HALQA_MORNING")} 
            className={cn("px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase shrink-0", selectedSession === "HALQA_MORNING" ? (isSchool ? "bg-amber-500/20 text-amber-600" : "bg-emerald-500/20 text-emerald-600") : "text-muted-foreground")}
          >
            Matin
          </button>
          <button 
            onClick={() => setSelectedSession("HALQA_AFTERNOON")} 
            className={cn("px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase shrink-0", selectedSession === "HALQA_AFTERNOON" ? (isSchool ? "bg-amber-500/20 text-amber-600" : "bg-emerald-500/20 text-emerald-600") : "text-muted-foreground")}
          >
            Après-midi
          </button>
          {!isSchool && (
            <button 
              onClick={() => setSelectedSession("HALQA_EVENING")} 
              className={cn("px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase shrink-0", selectedSession === "HALQA_EVENING" ? "bg-emerald-500/20 text-emerald-600" : "text-muted-foreground")}
            >
              Nuit / Isha
            </button>
          )}
        </div>
      </div>

      {activeTab === "APPEL" && (
        <div className="space-y-6">
          {/* Class Selection & Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="flex-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                {isSchool ? "Sélectionner la Classe" : "Sélectionner la Halqa"}
              </label>
              <select 
                value={selectedClass?.id || ""}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full bg-background border border-input rounded-xl px-4 py-2.5 text-sm font-bold text-foreground"
              >
                <option value="">{isSchool ? "-- Choisir une Classe --" : "-- Choisir une Halqa --"}</option>
                {activeClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.talibes?.length || c.students?.length || 0} {isSchool ? "Élèves" : "Talibés"})</option>
                ))}
              </select>
            </div>
            <div className="flex-1 relative flex flex-col justify-end">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Filtrer par Nom / Matricule</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text"
                  disabled={!selectedClassId}
                  placeholder={isSchool ? "Rechercher un Élève..." : "Rechercher un Talibé..."} 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn(
                    "w-full bg-background border border-input rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 disabled:opacity-50",
                    isSchool ? "focus:ring-amber-500" : "focus:ring-emerald-500"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Student Table */}
          {selectedClassId ? (
            <Card className="border border-border shadow-sm overflow-hidden">
              {/* VUE MOBILE (< 768px) : Cartes Tactiles d'Appel Ultra-Rapides */}
              <div className="md:hidden divide-y divide-border">
                {filteredTalibes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-xs font-bold">
                    Aucun Talibé trouvé dans cette Halqa.
                  </div>
                ) : (
                  filteredTalibes.map((s: any) => {
                    const status = getTalibeStatus(s.id);
                    return (
                      <div 
                        key={s.id} 
                        className="p-3.5 space-y-3 transition-colors active:bg-muted/30"
                        style={{ contentVisibility: "auto", containIntrinsicSize: "1px 120px" }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-black text-sm text-foreground truncate">
                              {s.firstName} {s.lastName}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[10px] text-muted-foreground font-semibold">
                                {s.matricule}
                              </span>
                              <Badge variant="outline" className={cn(
                                "text-[10px] py-0 font-bold",
                                s.status === "INTERNE" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                              )}>
                                {s.status || "INTERNE"}
                              </Badge>
                            </div>
                          </div>

                          {status && (
                            <Badge className={cn(
                              "text-[10px] font-extrabold uppercase shrink-0",
                              status === "PRESENT" ? "bg-emerald-600 text-white" :
                              status === "ABSENT" ? "bg-red-600 text-white" :
                              status === "RETARD" ? "bg-amber-600 text-white" : "bg-blue-600 text-white"
                            )}>
                              {status === "PRESENT" ? "Présent ✓" : status === "ABSENT" ? "Absent ✗" : status === "RETARD" ? "Retard ⏱" : "Excusé"}
                            </Badge>
                          )}
                        </div>

                        {/* Boutons d'Appel Tactiles (Touch-Friendly 44px) */}
                        <div className="grid grid-cols-4 gap-1.5 pt-1">
                          <button
                            type="button"
                            disabled={isSaving === s.id}
                            onClick={() => handleMarkAttendance(s.id, "PRESENT")}
                            className={cn(
                              "h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer border",
                              status === "PRESENT" 
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" 
                                : "bg-background text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 active:scale-95"
                            )}
                          >
                            <UserCheck className="w-3.5 h-3.5 mr-1" />
                            <span>Présent</span>
                          </button>

                          <button
                            type="button"
                            disabled={isSaving === s.id}
                            onClick={() => handleMarkAttendance(s.id, "ABSENT")}
                            className={cn(
                              "h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer border",
                              status === "ABSENT" 
                                ? "bg-red-600 text-white border-red-600 shadow-sm" 
                                : "bg-background text-red-600 border-red-500/30 hover:bg-red-500/10 active:scale-95"
                            )}
                          >
                            <UserX className="w-3.5 h-3.5 mr-1" />
                            <span>Absent</span>
                          </button>

                          <button
                            type="button"
                            disabled={isSaving === s.id}
                            onClick={() => handleMarkAttendance(s.id, "RETARD")}
                            className={cn(
                              "h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer border",
                              status === "RETARD" 
                                ? "bg-amber-600 text-white border-amber-600 shadow-sm" 
                                : "bg-background text-amber-600 border-amber-500/30 hover:bg-amber-500/10 active:scale-95"
                            )}
                          >
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            <span>Retard</span>
                          </button>

                          <button
                            type="button"
                            disabled={isSaving === s.id}
                            onClick={() => handleMarkAttendance(s.id, "EXCUSED")}
                            className={cn(
                              "h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer border",
                              status === "EXCUSED" 
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                                : "bg-background text-blue-600 border-blue-500/30 hover:bg-blue-500/10 active:scale-95"
                            )}
                          >
                            <UserMinus className="w-3.5 h-3.5 mr-1" />
                            <span>Excusé</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* VUE TABLETTE & DESKTOP (>= 768px) : Tableau Traditionnel */}
              <div className="hidden md:block overflow-x-auto touch-pan-x">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5 font-bold">{isSchool ? "Élève" : "Talibé"}</th>
                      <th className="px-6 py-3.5 font-bold">Matricule</th>
                      <th className="px-6 py-3.5 font-bold">Régime</th>
                      <th className="px-6 py-3.5 font-bold text-center">Appel de la Séance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredTalibes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-muted-foreground">
                          Aucun Talibé trouvé dans cette Halqa.
                        </td>
                      </tr>
                    ) : (
                      filteredTalibes.map((s: any) => {
                        const status = getTalibeStatus(s.id);
                        return (
                          <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4 font-bold text-foreground">
                              {s.firstName} {s.lastName}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                              {s.matricule}
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className={s.status === "INTERNE" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-blue-500/10 text-blue-600 border-blue-500/30"}>
                                {s.status || "INTERNE"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <Button 
                                  size="sm"
                                  variant={status === "PRESENT" ? "default" : "outline"}
                                  onClick={() => handleMarkAttendance(s.id, "PRESENT")}
                                  className={status === "PRESENT" ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs" : "text-emerald-600 hover:bg-emerald-500/10 text-xs"}
                                >
                                  <UserCheck className="w-3.5 h-3.5 mr-1" /> Présent
                                </Button>

                                <Button 
                                  size="sm"
                                  variant={status === "ABSENT" ? "default" : "outline"}
                                  onClick={() => handleMarkAttendance(s.id, "ABSENT")}
                                  className={status === "ABSENT" ? "bg-red-600 hover:bg-red-700 text-white font-bold text-xs" : "text-red-600 hover:bg-red-500/10 text-xs"}
                                >
                                  <UserX className="w-3.5 h-3.5 mr-1" /> Absent
                                </Button>

                                <Button 
                                  size="sm"
                                  variant={status === "RETARD" ? "default" : "outline"}
                                  onClick={() => handleMarkAttendance(s.id, "RETARD")}
                                  className={status === "RETARD" ? "bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs" : "text-amber-600 hover:bg-amber-500/10 text-xs"}
                                >
                                  <Clock className="w-3.5 h-3.5 mr-1" /> Retard
                                </Button>

                                <Button 
                                  size="sm"
                                  variant={status === "EXCUSED" ? "default" : "outline"}
                                  onClick={() => handleMarkAttendance(s.id, "EXCUSED")}
                                  className={status === "EXCUSED" ? "bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs" : "text-blue-600 hover:bg-blue-500/10 text-xs"}
                                >
                                  <UserMinus className="w-3.5 h-3.5 mr-1" /> Excusé
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <div className="text-center py-12 border border-dashed rounded-3xl bg-muted/20 space-y-2">
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
