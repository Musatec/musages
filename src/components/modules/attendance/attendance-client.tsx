"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Check
} from "lucide-react";
import { saveAttendance, markParentNotified } from "@/lib/actions/attendance";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AttendanceClientProps {
  classes: any[];
  todaysAttendances: any[];
  recentIssues: any[];
  schoolName: string;
}

export function AttendanceClient({ 
  classes, 
  todaysAttendances, 
  recentIssues,
  schoolName
}: AttendanceClientProps) {
  const [activeTab, setActiveTab] = useState<"APPEL" | "HISTORIQUE">("APPEL");
  
  // Appel state
  const [selectedClassId, setSelectedClassId] = useState("");
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const selectedClass = classes.find(c => c.id === selectedClassId);

  // Pour optimiser l'affichage de l'appel
  const getStudentStatus = (studentId: string) => {
    const record = todaysAttendances.find(a => a.studentId === studentId);
    return record?.status || null;
  };

  const handleMarkAttendance = async (studentId: string, status: "PRESENT" | "ABSENT" | "RETARD" | "EXCUSED") => {
    setIsSaving(studentId);
    
    // Optimistic UI update could be added here
    const res = await saveAttendance({
      studentId,
      status,
      date: new Date(),
    });

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Appel enregistré.");
      // In a real app we might update local state instead of reload, but reload is safe for now
      // Or just wait for the server action revalidatePath to kick in
    }
    
    setIsSaving(null);
  };

  const handleSendWhatsAppAlert = async (attendanceId: string, phone: string, parentName: string, studentName: string, status: string) => {
    const statusText = status === "ABSENT" ? "est absent(e)" : "est en retard";
    const message = encodeURIComponent(
      `Bonjour ${parentName}, l'école ${schoolName} vous informe que votre enfant ${studentName} ${statusText} aujourd'hui. Merci de nous contacter pour justifier cette situation. Cordialement.`
    );
    
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    
    // Marquer comme notifié
    await markParentNotified(attendanceId);
  };

  const filteredStudents = selectedClass?.students.filter((s: any) => 
    s.firstName.toLowerCase().includes(search.toLowerCase()) || 
    s.lastName.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic">Présences & Retards / الحضور</h1>
          <p className="text-sm text-muted-foreground">Appel quotidien et suivi d'assiduité.</p>
        </div>
        <div className="flex bg-card p-1 rounded-2xl border border-border/50">
          <button 
            onClick={() => setActiveTab("APPEL")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              activeTab === "APPEL" ? "bg-primary text-black shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            Faire l'Appel
          </button>
          <button 
            onClick={() => setActiveTab("HISTORIQUE")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              activeTab === "HISTORIQUE" ? "bg-primary text-black shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            Historique (30J)
          </button>
        </div>
      </div>

      {activeTab === "APPEL" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 bg-card border border-border/50 p-4 rounded-2xl">
            <div className="flex-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Classe / الصف</label>
              <select 
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
              >
                <option value="">Sélectionner une classe...</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-[2] relative flex flex-col justify-end">
              <Search className="absolute left-3 top-[38px] w-4 h-4 text-muted-foreground" />
              <input 
                type="text"
                disabled={!selectedClassId}
                placeholder="Rechercher un élève..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background border border-border/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {selectedClassId ? (
            <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Élève</th>
                    <th className="px-6 py-4 font-semibold text-center">Présent</th>
                    <th className="px-6 py-4 font-semibold text-center">Absent</th>
                    <th className="px-6 py-4 font-semibold text-center">Retard</th>
                    <th className="px-6 py-4 font-semibold text-center">Excusé</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        Aucun élève trouvé dans cette classe.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s: any) => {
                      const currentStatus = getStudentStatus(s.id);
                      return (
                        <tr key={s.id} className="hover:bg-muted/20 transition-all">
                          <td className="px-6 py-3">
                            <div className="font-bold text-foreground">{s.firstName} {s.lastName}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{s.matricule}</div>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <button
                              onClick={() => handleMarkAttendance(s.id, "PRESENT")}
                              disabled={isSaving === s.id}
                              className={cn(
                                "p-3 rounded-full transition-all border-2",
                                currentStatus === "PRESENT" ? "bg-emerald-500 border-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "border-border/50 text-muted-foreground hover:border-emerald-500 hover:text-emerald-500"
                              )}
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <button
                              onClick={() => handleMarkAttendance(s.id, "ABSENT")}
                              disabled={isSaving === s.id}
                              className={cn(
                                "p-3 rounded-full transition-all border-2",
                                currentStatus === "ABSENT" ? "bg-red-500 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "border-border/50 text-muted-foreground hover:border-red-500 hover:text-red-500"
                              )}
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <button
                              onClick={() => handleMarkAttendance(s.id, "RETARD")}
                              disabled={isSaving === s.id}
                              className={cn(
                                "p-3 rounded-full transition-all border-2",
                                currentStatus === "RETARD" ? "bg-amber-500 border-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "border-border/50 text-muted-foreground hover:border-amber-500 hover:text-amber-500"
                              )}
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <button
                              onClick={() => handleMarkAttendance(s.id, "EXCUSED")}
                              disabled={isSaving === s.id}
                              className={cn(
                                "p-3 rounded-full transition-all border-2",
                                currentStatus === "EXCUSED" ? "bg-blue-500 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border-border/50 text-muted-foreground hover:border-blue-500 hover:text-blue-500"
                              )}
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
              <CalendarCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Veuillez sélectionner une classe pour faire l'appel.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "HISTORIQUE" && (
        <div className="space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-muted/20">
              <h2 className="font-bold text-sm">Absences et Retards Récents (30 derniers jours)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Élève</th>
                    <th className="px-6 py-4 font-semibold">Classe</th>
                    <th className="px-6 py-4 font-semibold">Statut</th>
                    <th className="px-6 py-4 font-semibold text-right">Alerte Parent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {recentIssues.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        Aucun incident (absence/retard) enregistré sur les 30 derniers jours.
                      </td>
                    </tr>
                  ) : (
                    recentIssues.map((issue) => (
                      <tr key={issue.id} className="hover:bg-muted/20 transition-all">
                        <td className="px-6 py-4 font-mono text-xs">
                          {new Date(issue.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}
                        </td>
                        <td className="px-6 py-4 font-medium">{issue.student.firstName} {issue.student.lastName}</td>
                        <td className="px-6 py-4 text-muted-foreground">{issue.student.class.name}</td>
                        <td className="px-6 py-4">
                          {issue.status === "ABSENT" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 font-bold text-[10px] uppercase tracking-wider">
                              <UserX className="w-3.5 h-3.5" /> Absent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 font-bold text-[10px] uppercase tracking-wider">
                              <Clock className="w-3.5 h-3.5" /> Retard
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {issue.parentNotified ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] uppercase tracking-wider mr-2">
                              <Check className="w-3.5 h-3.5" /> Notifié
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleSendWhatsAppAlert(issue.id, issue.student.parentPhone, issue.student.parentName, issue.student.firstName, issue.status)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-black hover:bg-emerald-600 font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-emerald-500/20"
                            >
                              <MessageSquare className="w-3.5 h-3.5" /> Alerter
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
        </div>
      )}
    </div>
  );
}
