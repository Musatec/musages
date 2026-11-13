"use client";

import { useState, useEffect } from "react";
import { 
  HeartHandshake, 
  UserCheck, 
  Search, 
  Plus, 
  Phone, 
  ShieldCheck,
  Calendar,
  UserX,
  Sparkles,
  Info,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getSocialCases, getAvailableTalibesForSocialCase, toggleSocialCase } from "@/lib/actions/cas-sociaux";
import { cn } from "@/lib/utils";

interface CasSociauxClientProps {
  initialSocialCases?: any[];
  initialStats?: {
    totalTalibes: number;
    totalSocialCases: number;
    totalInternesExempted: number;
  };
}

export function CasSociauxClient({
  initialSocialCases = [],
  initialStats = { totalTalibes: 0, totalSocialCases: 0, totalInternesExempted: 0 }
}: CasSociauxClientProps) {
  const t = useTranslations("CasSociaux");
  const tCommon = useTranslations("Common");

  const [searchTerm, setSearchTerm] = useState("");
  const [socialCases, setSocialCases] = useState<any[]>(initialSocialCases);
  const [stats, setStats] = useState(initialStats);
  const [availableTalibes, setAvailableTalibes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // States pour ajouter un cas social
  const [selectedTalibeId, setSelectedTalibeId] = useState("");
  const [socialNotes, setSocialNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Charger les données initiales ou rafraîchir
  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await getSocialCases();
      if (res.success) {
        setSocialCases(res.socialCases);
        setStats(res.stats);
      }
      const resAvailable = await getAvailableTalibesForSocialCase();
      if (resAvailable.success) {
        setAvailableTalibes(resAvailable.talibes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleOpenDialog = async () => {
    const resAvailable = await getAvailableTalibesForSocialCase();
    if (resAvailable.success) {
      setAvailableTalibes(resAvailable.talibes);
    }
    setIsDialogOpen(true);
  };

  const handleAddSocialCase = async () => {
    if (!selectedTalibeId) {
      toast.error(t("select_student"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await toggleSocialCase(selectedTalibeId, true, socialNotes);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Talibé ajouté aux Cas Sociaux avec succès !");
        setSelectedTalibeId("");
        setSocialNotes("");
        setIsDialogOpen(false);
        await refreshData();
      }
    } catch (err) {
      toast.error("Une erreur s'est produite lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveSocialCase = async (talibeId: string, talibeName: string) => {
    if (!confirm(`Voulez-vous retirer ${talibeName} des Cas Sociaux ?`)) return;

    try {
      const res = await toggleSocialCase(talibeId, false);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`${talibeName} n'est plus marqué comme Cas Social.`);
        await refreshData();
      }
    } catch (err) {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  const filtered = socialCases.filter((item) => {
    const full = `${item.firstName} ${item.lastName} ${item.parentName || ""} ${item.socialNotes || ""}`.toLowerCase();
    return full.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-3">
      {/* TOOLBAR COMPACTE PRO - SANS GRANDES CARTES */}
      <div className="bg-card border border-border rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold shrink-0 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-black text-foreground">
                {t("title")}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-arabic">
                الحالات الاجتماعية
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Action + Enregistrer Cas Social */}
        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={handleOpenDialog} 
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 rounded-lg shadow-xs"
              >
                <Plus className="w-4 h-4" /> {t("add_social_case")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-emerald-500" /> {t("add_social_case")}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">{t("select_student")}</label>
                  <select
                    value={selectedTalibeId}
                    onChange={(e) => setSelectedTalibeId(e.target.value)}
                    className="w-full mt-1 p-2 text-xs border rounded-md bg-background text-foreground"
                  >
                    <option value="">-- Sélectionner un Talibé --</option>
                    {availableTalibes.map((talibe) => (
                      <option key={talibe.id} value={talibe.id}>
                        {talibe.firstName} {talibe.lastName} ({talibe.matricule}) — Parent: {talibe.parentName || "N/A"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">{t("social_notes")}</label>
                  <Textarea 
                    placeholder={t("reason_placeholder")} 
                    value={socialNotes}
                    onChange={(e) => setSocialNotes(e.target.value)}
                    className="mt-1 text-xs min-h-[90px]"
                  />
                </div>

                <Button 
                  onClick={handleAddSocialCase} 
                  disabled={submitting} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {submitting ? tCommon("loading") : "Valider le Statut Cas Social"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Mini-Barre de Métriques Compacte (1 seule ligne) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card border border-border rounded-lg px-3 py-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">{t("total_exempted")}</p>
            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{stats.totalSocialCases} Talibés</p>
          </div>
          <HeartHandshake className="w-4 h-4 text-emerald-500 shrink-0" />
        </div>
        <div className="bg-card border border-border rounded-lg px-3 py-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">{t("internes_exempted")}</p>
            <p className="text-sm font-black text-foreground">{stats.totalInternesExempted} Pensionnaires</p>
          </div>
          <UserCheck className="w-4 h-4 text-blue-500 shrink-0" />
        </div>
        <div className="bg-card border border-border rounded-lg px-3 py-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Taux Exonération</p>
            <p className="text-sm font-black text-amber-500">
              {stats.totalTalibes > 0 ? `${Math.round((stats.totalSocialCases / stats.totalTalibes) * 100)}%` : "0%"}
            </p>
          </div>
          <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
        </div>
      </div>

      {/* Barre de Recherche Compacte */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
        <Input 
          placeholder={t("search_placeholder")} 
          className="pl-9 h-9 text-xs bg-card border-border"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- REGISTRE EXCEL PRO DES CAS SOCIAUX --- */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none">
        {/* Barre de Titre Feuille Excel */}
        <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="bg-[#107c41] text-white px-2 py-0.5 rounded font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-sm">
              <span>XLSX</span>
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              Feuille : Cas Sociaux & Exonérations de Frais
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {filtered.length} {filtered.length > 1 ? "bénéficiaires" : "bénéficiaire"}
            </span>
          </div>
        </div>

        {/* Grille Excel */}
        <div className="w-full overflow-x-auto touch-pan-x">
          <table className="w-full min-w-[850px] border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#107c41] text-white select-none">
                <th className="w-12 text-center px-2 py-2 text-[10px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50">N°</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[180px]">Talibé (Nom & Prénom)</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[100px] text-center">Matricule</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[90px] text-center">Régime</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[180px]">Parent / Tuteur & Contact</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[90px] text-center">Année Entrée</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[160px]">Motif Prise en Charge</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[110px] text-center">Exonération</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-b border-emerald-600/50 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-muted-foreground border-b border-slate-200 dark:border-slate-700/80 italic bg-white dark:bg-slate-900">
                    {t("no_cases")}
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const arrivalYear = item.createdAt ? new Date(item.createdAt).getFullYear() : new Date().getFullYear();
                  return (
                    <tr 
                      key={item.id} 
                      className={cn(
                        "transition-colors hover:bg-[#e8f4fc] dark:hover:bg-slate-800/80",
                        idx % 2 === 1 ? "bg-[#f8fafc] dark:bg-slate-900/60" : "bg-white dark:bg-slate-900"
                      )}
                    >
                      <td className="w-12 text-center bg-[#f1f3f5] dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px] font-bold border-r border-b border-slate-200 dark:border-slate-700/80 select-none">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">
                        {item.firstName} {item.lastName}
                      </td>
                      <td className="px-3 py-2 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400 text-[11px] border-r border-b border-slate-200 dark:border-slate-700/80">
                        {item.matricule}
                      </td>
                      <td className="px-3 py-2 text-center border-r border-b border-slate-200 dark:border-slate-700/80">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {item.status || "INTERNE"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300 border-r border-b border-slate-200 dark:border-slate-700/80">
                        <div className="font-semibold">{item.parentName || "Non spécifié"}</div>
                        {item.parentPhone && (
                          <div className="font-mono text-[11px] text-muted-foreground">Tél: {item.parentPhone}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center font-mono font-bold text-slate-700 dark:text-slate-300 border-r border-b border-slate-200 dark:border-slate-700/80">
                        {arrivalYear}
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300 border-r border-b border-slate-200 dark:border-slate-700/80">
                        {item.socialNotes || "Prise en charge intégrale daara"}
                      </td>
                      <td className="px-3 py-2 text-center border-r border-b border-slate-200 dark:border-slate-700/80">
                        <span className="inline-block font-black text-[10px] uppercase px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                          100% Exonéré
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center border-b border-slate-200 dark:border-slate-700/80">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSocialCase(item.id, `${item.firstName} ${item.lastName}`)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs p-1 h-auto"
                          title={t("remove_social_case")}
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Barre d'état Excel */}
        <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium select-none">
          <div className="flex items-center gap-3">
            <span className="font-bold text-emerald-800 dark:text-emerald-400">PRÊT</span>
            <span>•</span>
            <span>Affichage : {filtered.length} talibés</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">Taux d'exonération : 100% (Prise en charge sociale totale)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
