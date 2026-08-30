"use client";

import { useState } from "react";
import { 
  HeartHandshake, 
  UserCheck, 
  Sparkles, 
  Search, 
  Plus, 
  Phone, 
  DollarSign, 
  ShieldCheck,
  Calendar,
  CheckCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Sponsorship {
  id: string;
  sponsorName: string;
  sponsorPhone: string;
  talibeName: string;
  monthlyAmount: number; // in FCFA
  status: "ACTIVE" | "PAUSED";
  lastPaymentDate: string;
  type: "NDEYI_DAARA" | "PARRAIN";
}

const MOCK_SPONSORSHIPS: Sponsorship[] = [
  { id: "1", sponsorName: "Sokhna Mariama Niang (Ndeyi Daara)", sponsorPhone: "+221 77 654 32 10", talibeName: "Moustapha Ndiaye", monthlyAmount: 15000, status: "ACTIVE", lastPaymentDate: "15/08/2026", type: "NDEYI_DAARA" },
  { id: "2", sponsorName: "El-Hadj Serigne Mbaye", sponsorPhone: "+221 78 123 45 67", talibeName: "Ibrahima Diallo", monthlyAmount: 25000, status: "ACTIVE", lastPaymentDate: "01/08/2026", type: "PARRAIN" },
  { id: "3", sponsorName: "Association Ndeyi Daara Touba", sponsorPhone: "+221 33 890 00 11", talibeName: "Amath Fall", monthlyAmount: 20000, status: "ACTIVE", lastPaymentDate: "10/08/2026", type: "NDEYI_DAARA" },
];

export function NdeyiDaaraDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>(MOCK_SPONSORSHIPS);

  // States pour nouveau parrainage
  const [newSponsorName, setNewSponsorName] = useState("");
  const [newSponsorPhone, setNewSponsorPhone] = useState("");
  const [newTalibeName, setNewTalibeName] = useState("");
  const [newAmount, setNewAmount] = useState("15000");

  const filtered = sponsorships.filter(s => 
    s.sponsorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.talibeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMonthlyTakaful = sponsorships.reduce((acc, curr) => acc + curr.monthlyAmount, 0);

  const handleAddSponsorship = () => {
    if (!newSponsorName || !newTalibeName) {
      toast.error("Veuillez remplir les champs requis !");
      return;
    }

    const created: Sponsorship = {
      id: Date.now().toString(),
      sponsorName: newSponsorName,
      sponsorPhone: newSponsorPhone || "+221 77 000 00 00",
      talibeName: newTalibeName,
      monthlyAmount: Number(newAmount) || 15000,
      status: "ACTIVE",
      lastPaymentDate: "Aujourd'hui",
      type: newSponsorName.toLowerCase().includes("sokhna") ? "NDEYI_DAARA" : "PARRAIN"
    };

    setSponsorships([created, ...sponsorships]);
    toast.success(`Parrainage enregistré avec succès pour ${newTalibeName} !`);
    setNewSponsorName("");
    setNewTalibeName("");
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 shadow-sm bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Collecte Mensuelle</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{totalMonthlyTakaful.toLocaleString()} FCFA</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Versés directement aux repas & soins</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Talibés Parrainés</p>
              <h3 className="text-2xl font-black text-foreground mt-1">{sponsorships.length} Talibés</h3>
              <p className="text-[11px] text-emerald-400 font-bold mt-0.5">100% Prise en charge</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ndeyi Daara Actives</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">
                {sponsorships.filter(s => s.type === "NDEYI_DAARA").length} Marraines
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
                <label className="text-xs font-bold text-muted-foreground uppercase">Nom du Talibé Parrainé</label>
                <Input 
                  placeholder="Ex: Modou Diop" 
                  value={newTalibeName}
                  onChange={(e: any) => setNewTalibeName(e.target.value)}
                  className="mt-1 text-xs"
                />
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

              <Button onClick={handleAddSponsorship} className="w-full bg-emerald-500 text-black font-bold">
                Valider la Prise en Charge
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
                      {item.type === "NDEYI_DAARA" ? "Ndeyi Daara" : "Parrain"}
                    </Badge>
                  </h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <Phone className="w-3 h-3 text-muted-foreground" /> {item.sponsorPhone} • Talibé: <span className="font-bold text-foreground">{item.talibeName}</span>
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
