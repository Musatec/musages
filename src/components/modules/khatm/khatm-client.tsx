"use client";

import { useState, useRef } from "react";
import { 
  Award, 
  Sparkles, 
  Search, 
  Plus, 
  CheckCircle2, 
  Printer, 
  Share2, 
  BookOpen, 
  User, 
  Calendar,
  ShieldCheck,
  FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createKhatmRecord } from "@/lib/actions/khatm";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TalibeOption {
  id: string;
  name: string;
  matricule: string;
}

interface KhatmRecordItem {
  id: string;
  completionDate: string | Date;
  qiraatVersion: string;
  oustazName: string;
  notes?: string | null;
  talibe: {
    id: string;
    firstName: string;
    lastName: string;
    matricule: string;
    halqa?: { name: string } | null;
  };
}

interface KhatmClientProps {
  initialRecords: KhatmRecordItem[];
  talibeOptions: TalibeOption[];
  daaraInfo?: { name: string; city?: string | null; logo?: string | null; ninea?: string | null } | null;
}

export function KhatmClient({ initialRecords, talibeOptions, daaraInfo }: KhatmClientProps) {
  const [records, setRecords] = useState<KhatmRecordItem[]>(initialRecords);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKhatm, setSelectedKhatm] = useState<KhatmRecordItem | null>(records[0] || null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCertDialogOpen, setIsCertDialogOpen] = useState(false);

  // Form state
  const [selectedTalibeId, setSelectedTalibeId] = useState(talibeOptions[0]?.id || "");
  const [qiraatVersion, setQiraatVersion] = useState("Warsh 'an Nafi'");
  const [oustazName, setOustazName] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  const filteredRecords = records.filter((r) => {
    const fullName = `${r.talibe.firstName} ${r.talibe.lastName}`.toLowerCase();
    const mat = r.talibe.matricule.toLowerCase();
    const query = searchTerm.toLowerCase();
    return fullName.includes(query) || mat.includes(query);
  });

  const handleCreateKhatm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTalibeId || !oustazName) {
      toast.error("Veuillez sélectionner un Talibé et indiquer le nom du Maître certificateur.");
      return;
    }

    setIsSubmitting(true);
    const res = await createKhatmRecord({
      talibeId: selectedTalibeId,
      qiraatVersion,
      oustazName,
      notes
    });

    setIsSubmitting(false);

    if (res.success && res.khatm) {
      toast.success("Diplôme de Khatm enregistré avec succès ! 🎉");
      setRecords([res.khatm as any, ...records]);
      setIsAddDialogOpen(false);
      setSelectedKhatm(res.khatm as any);
      setIsCertDialogOpen(true);
    } else {
      toast.error(res.error || "Impossible d'enregistrer le diplôme.");
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-emerald-950 to-teal-950 p-6 md:p-8 text-white border border-amber-500/20 shadow-2xl">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-8 -translate-y-8">
          <Award className="w-96 h-96 text-amber-400" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-amber-400" /> Registre Officiel des Ijazahs & Khatm Coranique
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-arabic leading-snug text-white drop-shadow-md">
            شهادات ختم القرآن الكريم والإجازات القرآنيّة
          </h1>
          <p className="text-amber-100/80 text-sm md:text-base leading-relaxed">
            Délivrez et imprimez les attestations de mémorisation intégrale du Saint Coran (60 Hizbs) certifiées par les Shuyukhs du Daara.
          </p>
        </div>
      </div>

      {/* Quick Stats Grid — 2x2 sur Mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="bg-card border-amber-500/20 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Khatimins</p>
              <h3 className="text-2xl font-black">{records.length} Diplômés</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-emerald-500/20 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Récitation Principale</p>
              <h3 className="text-2xl font-black">Warsh 'an Nafi'</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-teal-500/20 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center border border-teal-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Établissement Certifié</p>
              <h3 className="text-2xl font-black truncate">{daaraInfo?.name || "Daara.net"}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/40 p-4 rounded-2xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un Khatim par nom ou matricule..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-sm bg-background"
          />
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2 shadow-lg shadow-amber-600/20">
              <Plus className="w-4 h-4" /> Décerné un Nouveau Khatm
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Award className="w-5 h-5 text-amber-500" /> Enregistrer un Khatm Al-Quran
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateKhatm} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sélectionner le Talibé</label>
                <select 
                  value={selectedTalibeId} 
                  onChange={(e) => setSelectedTalibeId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-semibold"
                >
                  {talibeOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.matricule} - {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Récitation (Qira'at)</label>
                <select 
                  value={qiraatVersion} 
                  onChange={(e) => setQiraatVersion(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-semibold"
                >
                  <option value="Warsh 'an Nafi'">Warsh 'an Nafi' (ورش عن نافع)</option>
                  <option value="Hafs 'an 'Asim">Hafs 'an 'Asim (حفص عن عاصم)</option>
                  <option value="Qaloun 'an Nafi'">Qaloun 'an Nafi' (قالون عن نافع)</option>
                  <option value="Al-Duri 'an Abi 'Amr">Al-Duri 'an Abi 'Amr (الدوري عن أبي عمرو)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Oustaz / Sheikh Certificateur</label>
                <Input 
                  placeholder="Ex: Oustaz Serigne Cheikh Ndiaye" 
                  value={oustazName}
                  onChange={(e) => setOustazName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Appréciation / Notes</label>
                <Input 
                  placeholder="Ex: Récitation intégrale avec maîtrise parfaite du Tajwid." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
                  {isSubmitting ? "Enregistrement..." : "Valider & Générer le Diplôme"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Diplômes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.length === 0 ? (
          <div className="col-span-full text-center py-12 border border-dashed rounded-3xl bg-muted/20 space-y-3">
            <Award className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
            <h3 className="text-lg font-bold text-muted-foreground">Aucun diplôme enregistré pour le moment.</h3>
            <p className="text-xs text-muted-foreground">Cliquez sur "Décerné un Nouveau Khatm" pour enregistrer une fin de mémorisation.</p>
          </div>
        ) : (
          filteredRecords.map((r) => (
            <Card key={r.id} className="relative group overflow-hidden border border-amber-500/20 hover:border-amber-500/50 transition-all shadow-md hover:shadow-xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 font-mono text-[10px] font-bold">
                    {r.talibe.matricule}
                  </Badge>
                  <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                    60 HIZB KHATM
                  </Badge>
                </div>
                <CardTitle className="text-lg font-extrabold text-foreground pt-2">
                  {r.talibe.firstName} {r.talibe.lastName}
                </CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-500" /> Certifié par {r.oustazName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="p-3 rounded-xl bg-muted/40 text-xs space-y-1.5 border border-border/50">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-semibold">Récitation :</span>
                    <span className="font-bold text-emerald-600 font-arabic">{r.qiraatVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-semibold">Date d'obtention :</span>
                    <span className="font-bold">{format(new Date(r.completionDate), "dd MMMM yyyy", { locale: fr })}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    setSelectedKhatm(r);
                    setIsCertDialogOpen(true);
                  }}
                  className="w-full bg-amber-600/10 text-amber-700 hover:bg-amber-600 hover:text-white border border-amber-500/30 font-bold gap-2 text-xs transition-all"
                >
                  <FileCheck className="w-4 h-4" /> Voir & Imprimer l'Ijazah
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Official Certificate Modal */}
      {selectedKhatm && (
        <Dialog open={isCertDialogOpen} onOpenChange={setIsCertDialogOpen}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden bg-stone-900 border border-amber-500/40">
            <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-amber-300 text-sm uppercase tracking-wider">Diplôme Officiel d'Ijazah Coranique</span>
              </div>
              <Button onClick={handlePrintCertificate} className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-2">
                <Printer className="w-4 h-4" /> Imprimer / Télécharger PDF
              </Button>
            </div>

            {/* Printable Certificate Template */}
            <div ref={printRef} className="p-8 md:p-12 bg-amber-50/95 text-stone-900 border-8 border-double border-amber-700 m-4 rounded-xl relative shadow-2xl font-serif">
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 text-amber-800 text-2xl font-arabic">۞</div>
              <div className="absolute top-2 right-2 text-amber-800 text-2xl font-arabic">۞</div>
              <div className="absolute bottom-2 left-2 text-amber-800 text-2xl font-arabic">۞</div>
              <div className="absolute bottom-2 right-2 text-amber-800 text-2xl font-arabic">۞</div>

              <div className="text-center space-y-6">
                {/* Basmala */}
                <div className="text-2xl md:text-3xl font-bold font-arabic text-amber-900 leading-relaxed">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-stone-800 tracking-wider uppercase">{daaraInfo?.name || "ÉTABLISSEMENT CORANIQUE DAARA.NET"}</h3>
                  <p className="text-xs font-sans text-amber-900 font-semibold">{daaraInfo?.city || "Sénégal"} {daaraInfo?.ninea ? `• NINEA: ${daaraInfo.ninea}` : ""}</p>
                </div>

                <div className="py-2 border-y border-amber-800/30">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-amber-950 font-arabic tracking-wide">
                    شهادة ختم حفظ القرآن الكريم الإجازة المباركة
                  </h2>
                  <p className="text-xs font-sans font-bold text-stone-600 uppercase tracking-widest pt-1">
                    Attestation d'Excellence & de Mémorisation Intégrale
                  </p>
                </div>

                {/* Certificate Body */}
                <div className="space-y-4 text-center max-w-xl mx-auto py-2">
                  <p className="text-sm text-stone-700 italic">
                    Il est certifié que le Talibé honoré :
                  </p>
                  
                  <div className="text-2xl font-black text-amber-950 underline decoration-amber-600 decoration-2 underline-offset-4">
                    {selectedKhatm.talibe.firstName} {selectedKhatm.talibe.lastName}
                  </div>

                  <p className="text-xs text-stone-600 font-mono font-bold">
                    Matricule Officiel : <span className="text-amber-900">{selectedKhatm.talibe.matricule}</span>
                  </p>

                  <p className="text-sm text-stone-800 leading-relaxed pt-2">
                    A achevé avec brio et mémorisé dans son intégralité la totalité des **60 Hizbs du Saint Coran** selon la récitation bénie de <strong className="text-amber-900 font-arabic">{selectedKhatm.qiraatVersion}</strong>.
                  </p>
                </div>

                {/* Signatures & Date */}
                <div className="grid grid-cols-2 gap-8 pt-8 text-xs border-t border-amber-800/30">
                  <div className="text-left space-y-1">
                    <p className="font-bold text-stone-500 uppercase text-[10px]">Date de délivrance</p>
                    <p className="font-bold text-stone-900">{format(new Date(selectedKhatm.completionDate), "dd MMMM yyyy", { locale: fr })}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="font-bold text-stone-500 uppercase text-[10px]">Le Maître Certificateur (Oustaz)</p>
                    <p className="font-bold text-amber-950 text-sm font-arabic">{selectedKhatm.oustazName}</p>
                    <div className="pt-4 text-[10px] text-amber-800 font-bold uppercase tracking-widest">[ Cachet & Signature ]</div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
