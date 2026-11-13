"use client";

import { useCallback, useEffect, useState } from "react";
import { 
  HeartHandshake, 
  UserCheck, 
  Search, 
  Plus, 
  Phone, 
  DollarSign, 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createSponsorship, getSponsorshipTalibes, getSponsorships } from "@/lib/actions/sponsorships";

interface Sponsorship {
  id: string;
  sponsorName: string;
  sponsorPhone: string;
  talibe: { id: string; firstName: string; lastName: string; matricule: string };
  monthlyAmount: number; // in FCFA
  status: string;
  startDate: string;
  notes?: string | null;
}

export function NdeyiDaaraDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [talibes, setTalibes] = useState<{ id: string; firstName: string; lastName: string; matricule: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const [totalMonthlyCommitment, setTotalMonthlyCommitment] = useState(0);
  const [activeSponsorCount, setActiveSponsorCount] = useState(0);

  // States pour nouveau parrainage
  const [newSponsorName, setNewSponsorName] = useState("");
  const [newSponsorPhone, setNewSponsorPhone] = useState("");
  const [newTalibeId, setNewTalibeId] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [sponsorResult, talibeResult] = await Promise.all([getSponsorships(), getSponsorshipTalibes()]);
      if (!sponsorResult.success) toast.error(sponsorResult.error);
      else {
        setSponsorships(sponsorResult.sponsorships.map((item) => ({ ...item, startDate: item.startDate.toISOString() })));
        setActiveCount(sponsorResult.activeCount);
        setTotalMonthlyCommitment(sponsorResult.totalMonthlyCommitment);
        setActiveSponsorCount(sponsorResult.activeSponsorCount);
      }
      if (!talibeResult.success) toast.error(talibeResult.error);
      else setTalibes(talibeResult.talibes);
    } catch {
      toast.error("Impossible de charger les données de parrainage.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const filtered = sponsorships.filter(s => 
    s.sponsorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    `${s.talibe.firstName} ${s.talibe.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSponsorship = async () => {
    if (!newSponsorName.trim() || !newSponsorPhone.trim() || !newTalibeId || !Number.isFinite(Number(newAmount)) || Number(newAmount) <= 0) {
      toast.error("Renseignez le parrain, le Talibé et un montant mensuel valide.");
      return;
    }
    setSaving(true);
    try {
      const result = await createSponsorship({
        sponsorName: newSponsorName,
        sponsorPhone: newSponsorPhone,
        talibeId: newTalibeId,
        monthlyAmount: Number(newAmount),
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Engagement de parrainage enregistré.");
      setNewSponsorName("");
      setNewSponsorPhone("");
      setNewTalibeId("");
      setNewAmount("");
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 md:p-8 text-white border border-emerald-500/20 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5" /> Solidarité Takaful & Ndeyi Daara
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-arabic">
            كفالة طلاب العلم الشرعي (أمهات الدار والرعاة)
          </h1>
          <p className="text-emerald-100/80 text-sm md:text-base leading-relaxed">
            Suivez la prise en charge des Talibés pensionnaires par les *Ndeyi Daara* (marraines protectrices) et parrains donateurs.
          </p>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="border-border/50 shadow-sm bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Engagement mensuel actif</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{totalMonthlyCommitment.toLocaleString()} FCFA</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Montant engagé, non reçu ni encaissé</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Parrainages actifs</p>
              <h3 className="text-2xl font-black text-foreground mt-1">{activeCount} Parrainages</h3>
              <p className="text-[11px] text-emerald-400 font-bold mt-0.5">Engagements actifs enregistrés</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Parrains actifs</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">
                {activeSponsorCount} Parrains
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Réseau de solidarité locale</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input 
            placeholder="Rechercher une Ndeyi Daara ou Talibé..." 
            className="pl-9 h-10 text-xs"
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" /> Nouveau Parrainage / Ndeyi Daara
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-400" /> Ajouter un Parrainage Takaful
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Nom de la Ndeyi Daara / Parrain</label>
                <Input 
                  placeholder="Ex: Sokhna Mariama Niang" 
                  value={newSponsorName}
                  onChange={(e: any) => setNewSponsorName(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Téléphone WhatsApp</label>
                <Input 
                  placeholder="Ex: +221 77 123 45 67" 
                  value={newSponsorPhone}
                  onChange={(e: any) => setNewSponsorPhone(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Talibé concerné</label>
                <select
                  value={newTalibeId}
                  onChange={(e) => setNewTalibeId(e.target.value)}
                  className="w-full mt-1 p-2 bg-background border rounded-lg text-sm"
                  required
                >
                  <option value="">Choisir un Talibé</option>
                  {talibes.map((talibe) => (
                    <option key={talibe.id} value={talibe.id}>
                      {talibe.firstName} {talibe.lastName} — {talibe.matricule}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Montant Mensuel (FCFA)</label>
                <Input 
                  type="number" 
                  value={newAmount}
                  onChange={(e: any) => setNewAmount(e.target.value)}
                  className="mt-1 font-mono font-bold"
                />
              </div>

              <Button onClick={handleAddSponsorship} disabled={saving || !talibes.length} className="w-full bg-emerald-500 text-black font-bold">
                {saving ? "Enregistrement…" : "Enregistrer l'engagement"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des Parrainages */}
      <Card className="border-border/50 shadow-md">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-base font-bold">Liste des Engagement Takaful</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y">
          {!loading && filtered.length === 0 && <p className="p-6 text-sm text-muted-foreground">Aucun parrainage enregistré.</p>}
          {filtered.map((item) => (
            <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-accent/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    {item.sponsorName}
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      {item.status === "ACTIVE" ? "Actif" : item.status === "PAUSED" ? "En pause" : "Terminé"}
                    </Badge>
                  </h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <Phone className="w-3 h-3 text-muted-foreground" /> {item.sponsorPhone} • Talibé: <span className="font-bold text-foreground">{item.talibe.firstName} {item.talibe.lastName}</span>
                  </p>
                </div>
              </div>

              <div className="text-right flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                <div>
                  <span className="text-sm font-extrabold text-emerald-400">{item.monthlyAmount.toLocaleString()} FCFA</span>
                  <p className="text-[10px] text-muted-foreground">Par mois</p>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Actif ✓
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
