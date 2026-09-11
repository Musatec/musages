"use client";

import { useState } from "react";
import { 
  UserCheck, 
  BookOpen, 
  Plus, 
  Users, 
  Trash2, 
  PenTool, 
  Sparkles,
  Shield,
  GraduationCap
} from "lucide-react";
import { createHalqa, deleteClass, updateHalqa } from "@/lib/actions/classes";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface HalqaItem {
  id: string;
  name: string;
  level?: string | null;
  oustazName?: string | null;
  _count?: { talibes: number };
}

interface ClassesClientProps {
  classes: HalqaItem[];
  subjects?: any[];
}

export function ClassesClient({ classes: initialClasses }: ClassesClientProps) {
  const [halqas, setHalqas] = useState<HalqaItem[]>(initialClasses);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("MÉMORISATION (Hifz)");
  const [oustazName, setOustazName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateHalqa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Le nom de la Halqa est obligatoire.");
      return;
    }

    setIsSubmitting(true);
    const res = await createHalqa({
      name,
      level,
      oustazName
    });

    setIsSubmitting(false);

    if (res.success && res.halqa) {
      toast.success("Halqa créée avec succès ! 🎉");
      setHalqas([...halqas, { ...res.halqa, _count: { talibes: 0 } }]);
      setShowAddModal(false);
      setName("");
      setOustazName("");
    } else {
      toast.error(res.error || "Erreur lors de la création de la Halqa.");
    }
  };

  const handleDeleteHalqa = async (id: string, halqaName: string) => {
    if (confirm(`Voulez-vous vraiment supprimer la Halqa "${halqaName}" ?`)) {
      const res = await deleteClass(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Halqa supprimée.");
        setHalqas(halqas.filter(h => h.id !== id));
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 p-6 md:p-8 text-white border border-emerald-500/20 shadow-2xl">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-8 -translate-y-8">
          <UserCheck className="w-96 h-96 text-emerald-400" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Cercles d'Études & Maîtres Coraniques
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-arabic leading-snug text-white drop-shadow-md">
            الحلقات القرآنيّة ومشايخ الإقراء
          </h1>
          <p className="text-emerald-100/80 text-sm md:text-base leading-relaxed">
            Organisez les Halqas de récitation et attribuez les Maîtres Oustazs référents pour l'encadrement des Talibés.
          </p>
        </div>
      </div>

      {/* Main Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/40 p-4 rounded-2xl border border-border">
        <div>
          <h3 className="text-base font-extrabold flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <span>Effectif des Halqas ({halqas.length})</span>
          </h3>
          <p className="text-xs text-muted-foreground">Chaque Halqa regroupe un groupe de mémorisation sous la tutelle d'un Oustaz.</p>
        </div>

        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-lg shadow-emerald-600/20">
              <Plus className="w-4 h-4" /> Créer une Nouvelle Halqa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <BookOpen className="w-5 h-5 text-emerald-600" /> Création d'une Halqa Coranique
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateHalqa} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nom de la Halqa</label>
                <Input 
                  placeholder="Ex: Halqa Al-Baqara, Halqa Juz Amma, Halqa Warsh" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Niveau d'Enseignement</label>
                <select 
                  value={level} 
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-semibold"
                >
                  <option value="DÉBUTANT (Mouqadima)">Débutant / Mouqadima (مبتدئ)</option>
                  <option value="MÉMORISATION (Hifz)">Mémorisation / Hifz (حفظ القرآن)</option>
                  <option value="PERFECTIONNEMENT (Tajwid)">Perfectionnement & Tajwid (تجويد وإتقان)</option>
                  <option value="KHATM & IJAZAH">Khatm & Ijazah (إجازة وخبرة)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Oustaz Referent (Maître)</label>
                <Input 
                  placeholder="Ex: Oustaz Serigne Cheikh Ndiaye" 
                  value={oustazName}
                  onChange={(e) => setOustazName(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  {isSubmitting ? "Création..." : "Enregistrer la Halqa"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Halqas Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {halqas.length === 0 ? (
          <div className="col-span-full text-center py-12 border border-dashed rounded-3xl bg-muted/20 space-y-3">
            <UserCheck className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
            <h3 className="text-lg font-bold text-muted-foreground">Aucune Halqa configurée.</h3>
            <p className="text-xs text-muted-foreground">Cliquez sur "Créer une Nouvelle Halqa" pour ajouter la première classe coranique.</p>
          </div>
        ) : (
          halqas.map((h) => (
            <Card key={h.id} className="relative group overflow-hidden border border-emerald-500/20 hover:border-emerald-500/50 transition-all shadow-md hover:shadow-xl">
              <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
                <div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                    {h.level || "Hifz"}
                  </Badge>
                  <CardTitle className="text-xl font-extrabold text-foreground pt-2">
                    {h.name}
                  </CardTitle>
                </div>

                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => handleDeleteHalqa(h.id, h.name)}
                  className="text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="p-3.5 rounded-xl bg-muted/40 text-xs space-y-2 border border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-600" /> Maître Referent :
                    </span>
                    <span className="font-bold text-foreground">{h.oustazName || "Non assigné"}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/50 pt-2">
                    <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-600" /> Effectif Talibés :
                    </span>
                    <span className="font-extrabold font-mono text-emerald-600 text-sm">{h._count?.talibes || 0} Talibés</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
