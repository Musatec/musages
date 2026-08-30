"use client";

import { useState } from "react";
import { 
  BookOpen, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  Search, 
  User,
  Star,
  ChevronRight,
  Flame,
  PenTool,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface TalibeHifz {
  id: string;
  matricule: string;
  name: string;
  halqa: string;
  hizbValidated: number; // 0 to 60
  lastHizb: number;
  lastUpdate: string;
  allwaStatus: string;
  status: "INTERNE" | "EXTERNE";
}

const MOCK_TALIBES: TalibeHifz[] = [
  { id: "1", matricule: "DAA-001", name: "Moustapha Ndiaye", halqa: "Halqa Al-Baqara", hizbValidated: 42, lastHizb: 43, lastUpdate: "Aujourd'hui, 08h30", allwaStatus: "Sabi: Sourate Al-Kahf (v. 1-15)", status: "INTERNE" },
  { id: "2", matricule: "DAA-002", name: "Ibrahima Diallo", halqa: "Halqa Juz Amma", hizbValidated: 18, lastHizb: 19, lastUpdate: "Hier, 17h00", allwaStatus: "Sabi: Sourate Yasin (v. 1-20)", status: "INTERNE" },
  { id: "3", matricule: "DAA-003", name: "Amath Fall", halqa: "Halqa Warsh", hizbValidated: 60, lastHizb: 60, lastUpdate: "24/08/2026", allwaStatus: "KHATM COMPLÉTÉ (Ijazah)", status: "INTERNE" },
  { id: "4", matricule: "DAA-004", name: "Khadim Seck", halqa: "Halqa Al-Baqara", hizbValidated: 29, lastHizb: 30, lastUpdate: "Aujourd'hui, 09h15", allwaStatus: "Sabi: Sourate Maryam (v. 1-30)", status: "EXTERNE" },
];

export function HifzTracker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTalibe, setSelectedTalibe] = useState<TalibeHifz>(MOCK_TALIBES[0]);
  const [activeTab, setActiveTab] = useState("tracker");

  // State local pour la saisie quotidienne du Hizb
  const [currentHizb, setCurrentHizb] = useState<number>(selectedTalibe.lastHizb);
  const [evaluation, setEvaluation] = useState<string>("MUMTAZ");
  const [category, setCategory] = useState<string>("SABI");
  const [allwaNotes, setAllwaNotes] = useState<string>("");

  const filteredTalibes = MOCK_TALIBES.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.matricule.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveHifz = () => {
    toast.success(`Hifz enregistré avec succès pour ${selectedTalibe.name} !`, {
      description: `Hizb ${currentHizb} - Évaluation: ${evaluation}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 p-6 md:p-8 text-white border border-emerald-500/20 shadow-xl">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-8 -translate-y-8">
          <BookOpen className="w-96 h-96 text-emerald-400" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Suivi de Mémorisation Coranique (Hifz & Tajwid)
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-arabic">
            جدول متابعة حفظ القرآن الكريم (٦٠ حزباً)
          </h1>
          <p className="text-emerald-100/80 text-sm md:text-base leading-relaxed">
            Gérez la progression quotidienne des Talibés sur l'Allwa (لوح), la révision récente (*Muraja'a*) et la révision globale (*Tillawa*).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne 1: Liste des Talibés */}
        <Card className="lg:col-span-1 border-border/50 shadow-md">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span>Effectif du Daara</span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                {filteredTalibes.length} Talibés
              </Badge>
            </CardTitle>
            <div className="relative mt-2">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input 
                placeholder="Rechercher par nom ou matricule..." 
                className="pl-9 h-9 text-xs"
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-2 space-y-1 max-h-[600px] overflow-y-auto">
            {filteredTalibes.map((talibe) => {
              const isSelected = selectedTalibe.id === talibe.id;
              const percentage = Math.round((talibe.hizbValidated / 60) * 100);
              return (
                <button
                  key={talibe.id}
                  onClick={() => {
                    setSelectedTalibe(talibe);
                    setCurrentHizb(talibe.lastHizb);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between border ${
                    isSelected 
                      ? "bg-emerald-500/10 border-emerald-500/40 text-foreground shadow-sm" 
                      : "hover:bg-accent/50 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                      {talibe.hizbValidated}H
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[140px]">{talibe.name}</p>
                      <p className="text-[11px] text-muted-foreground">{talibe.halqa}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-400">{percentage}%</span>
                    <p className="text-[10px] text-muted-foreground">Progression</p>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Colonne 2 & 3: Grille des 60 Hizb et Fiche Talibé */}
        <Card className="lg:col-span-2 border-border/50 shadow-md">
          <CardHeader className="p-6 border-b flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold">{selectedTalibe.name}</h2>
                <Badge className={selectedTalibe.status === "INTERNE" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}>
                  {selectedTalibe.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Matricule: <span className="font-mono font-bold text-foreground">{selectedTalibe.matricule}</span> • {selectedTalibe.halqa}
              </p>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold gap-2">
                  <PenTool className="w-4 h-4" /> Saisir la Séance du Jour
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" /> Saisie Hifz — {selectedTalibe.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-3">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase">Hizb Évalué (1 à 60)</label>
                    <Input 
                      type="number" 
                      min={1} 
                      max={60} 
                      value={currentHizb} 
                      onChange={(e: any) => setCurrentHizb(Number(e.target.value))}
                      className="mt-1 font-mono text-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase">Catégorie d'Évaluation</label>
                    <select 
                      value={category} 
                      onChange={(e: any) => setCategory(e.target.value)}
                      className="w-full mt-1 p-2 bg-background border rounded-lg text-sm"
                    >
                      <option value="SABI">Sabi (Nouveau verset sur l'Allwa)</option>
                      <option value="MURAJAA_QARIBA">Muraja'a Qariba (Révision récents Hizb)</option>
                      <option value="MURAJAA_BAIDA">Muraja'a Ba'ida (Tillawa générale)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase">Évaluation / Note</label>
                    <select 
                      value={evaluation} 
                      onChange={(e: any) => setEvaluation(e.target.value)}
                      className="w-full mt-1 p-2 bg-background border rounded-lg text-sm"
                    >
                      <option value="MUMTAZ">Mumtaz (ممتاز - Excellent / Parfait)</option>
                      <option value="JAYYID_JIDDAN">Jayyid Jiddan (جيد جداً - Très Bien)</option>
                      <option value="JAYYID">Jayyid (جيد - Bien)</option>
                      <option value="A_REVISER">A Réviser (يحتاج مراجعة)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase">Notes sur l'Allwa / Sourate (لوح)</label>
                    <Input 
                      placeholder="Ex: Sourate Al-Kahf versets 1 à 25" 
                      value={allwaNotes} 
                      onChange={(e: any) => setAllwaNotes(e.target.value)}
                      className="mt-1 text-xs"
                    />
                  </div>

                  <Button onClick={handleSaveHifz} className="w-full bg-emerald-500 text-black font-bold gap-2">
                    <Save className="w-4 h-4" /> Enregistrer la Récitation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Statut Allwa Actuel */}
            <div className="p-4 rounded-xl bg-accent/30 border border-border/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Écriture sur l'Allwa (لوح)</span>
                <p className="text-sm font-bold mt-0.5">{selectedTalibe.allwaStatus}</p>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                Dernière séance: {selectedTalibe.lastUpdate}
              </Badge>
            </div>

            {/* Grille Visuelle des 60 Hizb */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-emerald-400" /> Grille de Progression Coranique (60 Hizb)
                </h3>
                <span className="text-xs text-muted-foreground font-mono">
                  {selectedTalibe.hizbValidated} / 60 Hizb Mémorisés
                </span>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                {Array.from({ length: 60 }, (_, i) => i + 1).map((hizbNum) => {
                  const isValidated = hizbNum <= selectedTalibe.hizbValidated;
                  const isCurrent = hizbNum === selectedTalibe.lastHizb;

                  return (
                    <div
                      key={hizbNum}
                      className={`h-11 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer relative group ${
                        isValidated 
                          ? "bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-sm" 
                          : isCurrent 
                            ? "bg-amber-500/20 border-amber-500 text-amber-400 font-bold animate-pulse" 
                            : "bg-background/50 border-border/40 text-muted-foreground hover:border-emerald-500/50"
                      }`}
                    >
                      <span className="text-xs">{hizbNum}</span>
                      <span className="text-[8px] opacity-75 font-mono">Hizb</span>
                      
                      {/* Tooltip Hover */}
                      <div className="absolute bottom-full mb-1 hidden group-hover:block z-20 px-2 py-1 bg-popover text-popover-foreground text-[10px] rounded shadow-md whitespace-nowrap border">
                        Hizb {hizbNum} {isValidated ? "— Mémorisé ✓" : isCurrent ? "— En cours" : "— Non entamé"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Légende */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span>Hizb Mémorisé & Validé</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500" />
                <span>En Cours sur l'Allwa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-background border" />
                <span>Non Mémorisé</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
