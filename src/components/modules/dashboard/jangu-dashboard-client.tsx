"use client";

import { motion } from "framer-motion";
import { Users, BookOpen, GraduationCap, CreditCard, CheckCircle2, Clock, AlertTriangle, MessageSquare, ArrowUpRight, Plus, Download } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { generateMonthlyTuitions } from "@/lib/actions/tuition";

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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/90 via-primary to-emerald-700 p-6 md:p-10 text-white shadow-2xl">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <GraduationCap className="w-96 h-96" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
            <span>Jangu ERP — Sénégal</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">{schoolName}</h1>
          <p className="text-white/80 text-sm md:text-base max-w-xl">
            Tableau de bord de suivi des écolages, des présences et des performances académiques pour le mois de <span className="font-bold underline">{MONTH_NAMES[currentMonth - 1]} {currentYear}</span>.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerateMonthlyTuitions}
              disabled={generating}
              className="px-5 py-2.5 bg-white text-primary font-bold text-xs md:text-sm rounded-xl shadow-lg hover:bg-white/90 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {generating ? "Génération en cours..." : `Générer Écolages (${MONTH_NAMES[currentMonth - 1]})`}
            </button>
            <Link
              href="/tuition"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs md:text-sm rounded-xl transition-all flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Recouvrement Écolages
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Élèves */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Élèves Inscrits</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black">{totalStudents}</span>
            <span className="text-xs text-muted-foreground ml-2">élèves répertoriés</span>
          </div>
          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
            <span className="font-semibold text-foreground">{totalClasses}</span> classes configurées
          </div>
        </motion.div>

        {/* Taux de Recouvrement */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Taux de Recouvrement</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-emerald-500">{collectionRate}%</span>
            <span className="text-xs text-muted-foreground ml-2">mensualités encaissées</span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${collectionRate}%` }} />
          </div>
        </motion.div>

        {/* Écolages Collectés */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Collecté ce mois</span>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black">{totalAmountPaid.toLocaleString('fr-FR')} <span className="text-xs font-normal">FCFA</span></span>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Sur un objectif de <span className="font-semibold">{totalAmountDue.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </motion.div>

        {/* Enseignants */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Corps Enseignant</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black">{totalTeachers}</span>
            <span className="text-xs text-muted-foreground ml-2">professeurs / vacataires</span>
          </div>
          <Link href="/teachers" className="mt-3 text-xs text-primary font-semibold hover:underline flex items-center gap-1">
            Gérer les vacances <ArrowUpRight className="w-3 h-3" />
          </Link>
        </motion.div>
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
            {/* Vue Desktop: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground font-semibold uppercase tracking-wider">
                    <th className="pb-3">Élève</th>
                    <th className="pb-3">Classe</th>
                    <th className="pb-3">Mois</th>
                    <th className="pb-3">Montant</th>
                    <th className="pb-3">Statut</th>
                    <th className="pb-3 text-right">Actions WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {recentTuitions.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-all">
                      <td className="py-3 font-semibold">
                        {item.student.firstName} {item.student.lastName}
                        <div className="text-[10px] text-muted-foreground font-normal">Matricule: {item.student.matricule}</div>
                      </td>
                      <td className="py-3 text-muted-foreground font-medium">{item.student.class.name}</td>
                      <td className="py-3 font-medium">{MONTH_NAMES[item.month - 1]} {item.year}</td>
                      <td className="py-3 font-bold">{item.amount.toLocaleString('fr-FR')} FCFA</td>
                      <td className="py-3">
                        {item.status === "PAID" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> PAYÉ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 font-bold text-[10px]">
                            <Clock className="w-3 h-3" /> EN ATTENTE
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => handleSendWhatsAppReminder(item.student.parentPhone, item.student.parentName, item.student.firstName, item.amount)}
                          className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white font-bold rounded-lg transition-all inline-flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vue Mobile: Cartes */}
            <div className="md:hidden flex flex-col gap-3">
              {recentTuitions.map((item) => (
                <div key={item.id} className="bg-background border border-border/50 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sm">{item.student.firstName} {item.student.lastName}</span>
                      <div className="text-xs text-muted-foreground">{item.student.class.name}</div>
                    </div>
                    <div>
                      {item.status === "PAID" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-bold text-[9px] uppercase">
                          Payé
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 font-bold text-[9px] uppercase">
                          En attente
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-black">{item.amount.toLocaleString('fr-FR')} FCFA</span>
                    <span className="text-xs text-muted-foreground">{MONTH_NAMES[item.month - 1]} {item.year}</span>
                  </div>
                  <button
                    onClick={() => handleSendWhatsAppReminder(item.student.parentPhone, item.student.parentName, item.student.firstName, item.amount)}
                    className="w-full mt-2 py-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1"
                  >
                    <MessageSquare className="w-4 h-4" /> Relancer via WhatsApp
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
