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
import { cn } from "@/lib/utils";

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
    <div className="space-y-3">
      {/* TOOLBAR COMPACTE PRO - SANS GRANDES CARTES */}
      <div className="bg-card border border-border rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold shrink-0 bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-black text-foreground">
                Registre Officiel des Ijazahs & Khatm Coranique
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-arabic">
                ختم القرآن
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Attestations de mémorisation intégrale (60 Hizbs) certifiées par les Shuyukhs
            </p>
          </div>
        </div>

        {/* Action + Nouveau Khatm */}
        <div className="flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 rounded-lg shadow-xs">
                <Plus className="w-4 h-4" /> Décerner un Nouveau Khatm
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

                <Button type="submit" disabled={isSubmitting} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 rounded-xl">
                  {isSubmitting ? "Enregistrement..." : "Enregistrer et Valider"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Mini-Barre de Métriques Compacte (1 seule ligne) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card border border-border rounded-lg px-3 py-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Total Khatimins</p>
            <p className="text-sm font-black text-amber-500">{records.length} Diplômés</p>
          </div>
          <Award className="w-4 h-4 text-amber-500 shrink-0" />
        </div>
        <div className="bg-card border border-border rounded-lg px-3 py-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Récitation</p>
            <p className="text-sm font-black text-foreground">Warsh 'an Nafi'</p>
          </div>
          <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
        </div>
        <div className="bg-card border border-border rounded-lg px-3 py-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Établissement</p>
            <p className="text-sm font-black text-teal-600 dark:text-teal-400 truncate max-w-[150px]">{daaraInfo?.name || "Daara Ibnoul Khayim"}</p>
          </div>
          <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0" />
        </div>
      </div>

      {/* Barre de Recherche Compacte */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
        <Input 
          placeholder="Rechercher un Khatim par nom ou matricule..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-9 text-xs bg-card border-border"
        />
      </div>

      {/* --- REGISTRE EXCEL PRO DES DIPLÔMÉS KHATM AL-QUR'AN --- */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none">
        {/* Barre de Titre Feuille Excel */}
        <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="bg-[#107c41] text-white px-2 py-0.5 rounded font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-sm">
              <span>XLSX</span>
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              Feuille : Registre Officiel des Ijazahs & Khatm Coranique
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {filteredRecords.length} {filteredRecords.length > 1 ? "diplômés" : "diplômé"}
            </span>
          </div>
        </div>

        {/* Grille Excel */}
        <div className="w-full overflow-x-auto touch-pan-x">
          <table className="w-full min-w-[800px] border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#107c41] text-white select-none">
                <th className="w-12 text-center px-2 py-2 text-[10px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50">N°</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[180px]">Talibé / Récitateur (Hafiz)</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[100px] text-center">Matricule</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[160px]">Maître Validateur (Oustaz)</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[140px] text-center">Version de Lecture (Qirā'at)</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[110px] text-center">Consécration</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[120px] text-center">Date de Khatm</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-b border-emerald-600/50 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-muted-foreground border-b border-slate-200 dark:border-slate-700/80 italic bg-white dark:bg-slate-900">
                    Aucun diplôme enregistré pour le moment.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => (
                  <tr 
                    key={r.id} 
                    className={cn(
                      "transition-colors hover:bg-[#e8f4fc] dark:hover:bg-slate-800/80",
                      idx % 2 === 1 ? "bg-[#f8fafc] dark:bg-slate-900/60" : "bg-white dark:bg-slate-900"
                    )}
                  >
                    <td className="w-12 text-center bg-[#f1f3f5] dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px] font-bold border-r border-b border-slate-200 dark:border-slate-700/80 select-none">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">
                      {r.talibe.firstName} {r.talibe.lastName}
                    </td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400 text-[11px] border-r border-b border-slate-200 dark:border-slate-700/80">
                      {r.talibe.matricule}
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-300 border-r border-b border-slate-200 dark:border-slate-700/80">
                      {r.oustazName}
                    </td>
                    <td className="px-3 py-2 text-center font-arabic font-bold text-emerald-700 dark:text-emerald-400 text-sm border-r border-b border-slate-200 dark:border-slate-700/80">
                      {r.qiraatVersion}
                    </td>
                    <td className="px-3 py-2 text-center border-r border-b border-slate-200 dark:border-slate-700/80">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                        60 HIZB KHATM
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center font-mono text-xs text-slate-600 dark:text-slate-400 border-r border-b border-slate-200 dark:border-slate-700/80">
                      {format(new Date(r.completionDate), "dd MMM yyyy", { locale: fr })}
                    </td>
                    <td className="px-3 py-2 text-center border-b border-slate-200 dark:border-slate-700/80">
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedKhatm(r);
                          setIsCertDialogOpen(true);
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1.5 text-[11px] h-7 px-2.5 shadow-sm"
                      >
                        <FileCheck className="w-3.5 h-3.5" /> Voir l'Ijazah
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Barre d'état Excel */}
        <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium select-none">
          <div className="flex items-center gap-3">
            <span className="font-bold text-emerald-800 dark:text-emerald-400">PRÊT</span>
            <span>•</span>
            <span>Affichage : {filteredRecords.length} diplômés certifiés</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Récitation prédominante : Warsh 'an Nafi' (60 Hizbs)</span>
          </div>
        </div>
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
                  <h3 className="text-xl font-bold text-stone-800 tracking-wider uppercase">{daaraInfo?.name || "DAARA IBNOUL KHAYIM AL DIAWZIYA"}</h3>
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
