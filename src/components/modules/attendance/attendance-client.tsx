"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AttendanceClientProps {
  classes: any[];
  todaysAttendances: any[];
  recentIssues: any[];
  schoolName: string;
}

export function AttendanceClient({ 
  classes, 
  todaysAttendances: initialAttendances, 
  recentIssues,
  schoolName
}: AttendanceClientProps) {
  const [attendances, setAttendances] = useState<any[]>(initialAttendances);
  const [activeTab, setActiveTab] = useState<"APPEL" | "HISTORIQUE">("APPEL");
  const [selectedSession, setSelectedSession] = useState<string>("HALQA_MORNING");
  
  // Appel state
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const selectedClass = classes.find(c => c.id === selectedClassId);

  const getTalibeStatus = (talibeId: string) => {
    const record = attendances.find(a => (a.talibeId === talibeId || a.studentId === talibeId));
    return record?.status || null;
  };

  const handleMarkAttendance = async (talibeId: string, status: "PRESENT" | "ABSENT" | "RETARD" | "EXCUSED") => {
    setIsSaving(talibeId);
    
    // Optimistic UI update
    setAttendances(prev => {
      const filtered = prev.filter(a => (a.talibeId !== talibeId && a.studentId !== talibeId));
      return [...filtered, { talibeId, status, date: new Date() }];
    });

    const res = await saveAttendance({
      studentId: talibeId,
      status,
      date: new Date(),
    });

    setIsSaving(null);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Statut de présence enregistré ! ✓");
    }
  };

  const handleSendWhatsAppAlert = async (attendanceId: string, phone: string, parentName: string, studentName: string, status: string) => {
    const statusText = status === "ABSENT" ? "est absent(e)" : "est en retard";
    const message = encodeURIComponent(
      `Assalamu alaykum ${parentName || "Parent"}, le Daara ${schoolName} vous informe que votre enfant ${studentName} ${statusText} à la séance de Halqa aujourd'hui. Merci de nous contacter. Baraka Allahou Feekum.`
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 p-6 md:p-8 text-white border border-emerald-500/20 shadow-2xl">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-8 -translate-y-8">
          <CalendarCheck className="w-96 h-96 text-emerald-400" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Gestion des Présences & Alertes Parents WhatsApp
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-arabic leading-snug text-white drop-shadow-md">
            تسجيل حضور وغياب الطلاب بالحلقات
          </h1>
          <p className="text-emerald-100/80 text-sm md:text-base leading-relaxed">
            Effectuez l'appel des séances de Halqa (Subh/Fajr, Matin, Après-midi, Isha) et prévenez instantanément les parents en cas d'absence.
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center justify-between gap-4 bg-muted/40 p-2 rounded-2xl border border-border">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("APPEL")}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2",
              activeTab === "APPEL" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <UserCheck className="w-4 h-4" /> Faire l'Appel de la Séance
          </button>
          <button 
            onClick={() => setActiveTab("HISTORIQUE")}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2",
              activeTab === "HISTORIQUE" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <AlertTriangle className="w-4 h-4" /> Suivi & Incidents (30J)
          </button>
        </div>

        {/* Sessions Filter */}
        <div className="hidden sm:flex items-center gap-1.5 bg-background p-1 rounded-xl border border-border">
          <button 
            onClick={() => setSelectedSession("HALQA_FAJR")} 
            className={cn("px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase", selectedSession === "HALQA_FAJR" ? "bg-emerald-500/20 text-emerald-600" : "text-muted-foreground")}
          >
            Subh / Fajr
          </button>
          <button 
            onClick={() => setSelectedSession("HALQA_MORNING")} 
            className={cn("px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase", selectedSession === "HALQA_MORNING" ? "bg-emerald-500/20 text-emerald-600" : "text-muted-foreground")}
          >
            Matin
          </button>
          <button 
            onClick={() => setSelectedSession("HALQA_AFTERNOON")} 
            className={cn("px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase", selectedSession === "HALQA_AFTERNOON" ? "bg-emerald-500/20 text-emerald-600" : "text-muted-foreground")}
          >
            Après-midi
          </button>
          <button 
            onClick={() => setSelectedSession("HALQA_EVENING")} 
            className={cn("px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase", selectedSession === "HALQA_EVENING" ? "bg-emerald-500/20 text-emerald-600" : "text-muted-foreground")}
          >
            Nuit / Isha
          </button>
        </div>
      </div>

      {activeTab === "APPEL" && (
        <div className="space-y-6">
          {/* Halqa Selection & Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="flex-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Sélectionner la Halqa</label>
              <select 
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full bg-background border border-input rounded-xl px-4 py-2.5 text-sm font-bold text-foreground"
              >
                <option value="">-- Choisir une Halqa --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.talibes?.length || c.students?.length || 0} Talibés)</option>
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
                  placeholder="Rechercher un Talibé..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Student Table */}
          {selectedClassId ? (
            <Card className="border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5 font-bold">Talibé</th>
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
