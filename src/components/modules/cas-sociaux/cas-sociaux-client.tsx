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
    <div className="space-y-6">
      {/* En-tête / Bannière */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 p-6 md:p-8 text-white border border-emerald-500/20 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5" /> {t("title")}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-arabic text-white drop-shadow-md">
            سجل الحالات الاجتماعية والمعفين من الرسوم
          </h1>
          <p className="text-emerald-100/80 text-sm md:text-base leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 shadow-sm bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("total_exempted")}</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{stats.totalSocialCases} Talibés</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Exonération totale des frais mensuels</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("internes_exempted")}</p>
              <h3 className="text-2xl font-black text-foreground mt-1">{stats.totalInternesExempted} Pensionnaires</h3>
              <p className="text-[11px] text-emerald-400 font-bold mt-0.5">Nourriture & Hébergement inclus</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Effectif Total Daara</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">{stats.totalTalibes} Talibés</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {stats.totalTalibes > 0 
                  ? `${Math.round((stats.totalSocialCases / stats.totalTalibes) * 100)}% de prise en charge sociale`
                  : "0%"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche & Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input 
            placeholder={t("search_placeholder")} 
            className="pl-9 h-10 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleOpenDialog} 
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold gap-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" /> {t("add_social_case")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-400" /> {t("add_social_case")}
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
                className="w-full bg-emerald-500 text-black font-bold"
              >
                {submitting ? tCommon("loading") : "Valider le Statut Cas Social"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste Synchronisée des Cas Sociaux */}
      <Card className="border-border/50 shadow-md">
        <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Liste Officielle des Talibés Cas Sociaux
          </CardTitle>
          <Badge variant="outline" className="text-xs font-bold bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            {filtered.length} Enregistrés
          </Badge>
        </CardHeader>
        <CardContent className="p-0 divide-y">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm space-y-2">
              <Info className="w-8 h-8 mx-auto text-muted-foreground/50" />
              <p>{t("no_cases")}</p>
            </div>
          ) : (
            filtered.map((item) => {
              const arrivalYear = item.createdAt ? new Date(item.createdAt).getFullYear() : new Date().getFullYear();
              return (
                <div 
                  key={item.id} 
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-accent/20 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-1 sm:mt-0">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-2 flex-wrap">
                        {item.firstName} {item.lastName}
                        <Badge variant="outline" className="text-[10px] bg-slate-500/10 text-muted-foreground border-slate-500/30">
                          Matricule: {item.matricule}
                        </Badge>
                        <Badge className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                          {item.status || "INTERNE"}
                        </Badge>
                      </h4>
                      
                      <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                        <p className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">{t("parent_name")}:</span> {item.parentName || "Non spécifié"} 
                          {item.parentPhone && (
                            <span className="text-muted-foreground flex items-center gap-1 ml-1">
                              (<Phone className="w-3 h-3 text-emerald-400 inline" /> {item.parentPhone})
                            </span>
                          )}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-amber-400" />
                          <span className="font-semibold text-foreground">{t("arrival_year")}:</span> {arrivalYear}
                        </p>
                        {item.socialNotes && (
                          <p className="text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block mt-1 text-[11px]">
                            {t("social_notes")}: {item.socialNotes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold px-3 py-1">
                      Exonéré (100%) ✓
                    </Badge>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSocialCase(item.id, `${item.firstName} ${item.lastName}`)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs gap-1"
                      title={t("remove_social_case")}
                    >
                      <UserX className="w-4 h-4" />
                      <span className="hidden sm:inline">{t("remove_social_case")}</span>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
