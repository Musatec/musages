"use client";

import { useState } from "react";
import { 
  UserCheck, 
  Plus, 
  Printer, 
  Search, 
  Phone, 
  BookOpen, 
  GraduationCap, 
  UserPlus, 
  FileSpreadsheet,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

interface HalqaItem {
  id: string;
  name: string;
  level?: string | null;
  oustazName?: string | null;
  _count?: { talibes: number };
}

interface OustazsClientProps {
  daaraName?: string;
  halqas: HalqaItem[];
  oustazUsers?: any[];
}

export function OustazsClient({ daaraName, halqas, oustazUsers = [] }: OustazsClientProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Ajout d'un Oustaz
  const [showAddModal, setShowAddModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"INTERNAT" | "EXTERNAT">("INTERNAT");
  const [option, setOption] = useState("القرآن");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Liste par défaut des Oustazs du Daara Ibnoul Khayim (depuis la capture Excel)
  const defaultOustazsList = [
    { id: "1", firstName: "OUSTAZ MOUHAMED", lastName: "ndaw", phone: "78 190 01 53", status: "INTERNAT", option: "القرآن", halqaName: "حلقة أستاذ محمد انضاو" },
    { id: "2", firstName: "OUSTAZ MOUSSA", lastName: "ndaw", phone: "76 763 28 64", status: "INTERNAT", option: "القرآن", halqaName: "حلقة أستاذ موسى انضاو" },
    { id: "3", firstName: "OUSTAZ MOUSTAPHA", lastName: "AMAR", phone: "75 740 10 70", status: "INTERNAT", option: "القرآن", halqaName: "حلقة عمر بن الخطاب" },
    { id: "4", firstName: "OUSTAZ MOUHAMED", lastName: "TOP", phone: "77 953 72 76", status: "INTERNAT", option: "القرآن", halqaName: "حلقة أستاذ محمد توبر" },
    { id: "5", firstName: "OUSTAZ MBAYE", lastName: "DIEYE", phone: "70 688 95 70", status: "EXTERNAT", option: "التهجي", halqaName: "حلقة أستاذ إمباي جِي" },
    { id: "6", firstName: "SEYDA MAME BOUSSO", lastName: "DIAKHATE", phone: "78 317 06 80", status: "INTERNAT", option: "القرآن", halqaName: "حلقة سيدة حوا حجي" },
    { id: "7", firstName: "SEYDA AWA", lastName: "DIAKHATE", phone: "78 117 09 26", status: "INTERNAT", option: "التهجي", halqaName: "حلقة سيدة حوا" },
  ];

  const [oustazList, setOustazList] = useState(defaultOustazsList);

  const filteredOustazs = oustazList.filter(o => {
    const fullStr = `${o.firstName} ${o.lastName} ${o.phone} ${o.option}`.toLowerCase();
    return fullStr.includes(searchQuery.toLowerCase());
  });

  const handleCreateOustaz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      toast.error("Le prénom et le nom sont obligatoires.");
      return;
    }

    const newOustaz = {
      id: String(oustazList.length + 1),
      firstName: firstName.toUpperCase(),
      lastName: lastName,
      phone: phone || "N/A",
      status: status,
      option: option,
      halqaName: `حلقة ${firstName} ${lastName}`
    };

    setOustazList([...oustazList, newOustaz]);
    toast.success(`Oustaz ${firstName} ${lastName} enregistré avec succès ! 🎉`);
    setShowAddModal(false);
    setFirstName("");
    setLastName("");
    setPhone("");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans w-full">
      
      {/* TOOLBAR SUPERIEURE ULTRA COMPACTE (AUCUNE GRANDE CARTE BOUFFIE - 1 SEULE LIGNE) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Registre Officiel des Oustazs & Enseignants</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                {oustazList.length} Maîtres
              </span>
            </h1>
          </div>
        </div>

        {/* Boutons d'Action Rapides */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end text-xs font-bold">
          <Button 
            onClick={handlePrint}
            variant="outline" 
            size="sm"
            className="border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs gap-1.5 rounded-lg"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-600" /> Imprimer le Registre
          </Button>

          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 rounded-lg shadow-xs">
                <UserPlus className="w-3.5 h-3.5" /> Nouvel Oustaz
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md font-sans">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base font-bold">
                  <UserPlus className="w-4 h-4 text-emerald-600" /> Enregistrement d'un Maître / Oustaz
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreateOustaz} className="space-y-3 pt-2 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Prénom (الاسم)</label>
                    <Input 
                      placeholder="Ex: OUSTAZ MOUHAMED" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Nom (اللقب)</label>
                    <Input 
                      placeholder="Ex: NDAW" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Téléphone WhatsApp</label>
                  <Input 
                    placeholder="Ex: 78 190 01 53" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Régime / STATUT</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs font-semibold"
                    >
                      <option value="INTERNAT">INTERNAT (Pensionnaire)</option>
                      <option value="EXTERNE">EXTERNAT (Externe)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Option / Spécialité</label>
                    <select 
                      value={option} 
                      onChange={(e) => setOption(e.target.value)}
                      className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs font-semibold"
                    >
                      <option value="القرآن">القرآن (Coran & Hifz)</option>
                      <option value="التهجي">التهجي (Initiation Tahajji)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
                    Enregistrer l'Oustaz
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* BARRE INTERNE DE RECHERCHE DANS LE REGISTRE DES OUSTAZS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 shadow-xs flex items-center justify-between print:hidden text-xs w-full">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 w-full">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="text"
            placeholder="Rechercher un Oustaz par prénom, nom, téléphone ou option (القرآن / التهجي)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent w-full text-xs font-medium outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* --- REGISTRE EXCEL PRO DES OUSTAZS --- */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none">
        {/* Barre de Titre Feuille Excel */}
        <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="bg-[#107c41] text-white px-2 py-0.5 rounded font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-sm">
              <span>XLSX</span>
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              Feuille : Les Oustaz du Daara Ibnoul Khayim Al Diawziya • 2025/2026
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {filteredOustazs.length} enseignants
            </span>
          </div>
        </div>

        {/* Grille Excel */}
        <div className="w-full overflow-x-auto touch-pan-x">
          <table className="w-full min-w-[700px] border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#107c41] text-white select-none">
                <th className="w-12 text-center px-2 py-2 text-[10px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50">N°</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[140px]">Prénom</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[140px]">Nom</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[130px] font-mono">Téléphone</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 text-center w-36">Statut</th>
                <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-b border-emerald-600/50 text-center font-arabic w-32">Option (التخصص)</th>
              </tr>
            </thead>
            <tbody>
              {filteredOustazs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground border-b border-slate-200 dark:border-slate-700/80 italic bg-white dark:bg-slate-900">
                    Aucun Oustaz ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                filteredOustazs.map((o, index) => {
                  const isInternat = o.status === "INTERNAT";
                  return (
                    <tr 
                      key={o.id} 
                      className={cn(
                        "transition-colors hover:bg-[#e8f4fc] dark:hover:bg-slate-800/80",
                        index % 2 === 1 ? "bg-[#f8fafc] dark:bg-slate-900/60" : "bg-white dark:bg-slate-900"
                      )}
                    >
                      <td className="w-12 text-center bg-[#f1f3f5] dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px] font-bold border-r border-b border-slate-200 dark:border-slate-700/80 select-none">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">
                        {o.firstName}
                      </td>
                      <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">
                        {o.lastName}
                      </td>
                      <td className="px-3 py-2 font-mono font-medium text-slate-700 dark:text-slate-300 border-r border-b border-slate-200 dark:border-slate-700/80">
                        {o.phone || "—"}
                      </td>
                      <td className="px-3 py-2 text-center border-r border-b border-slate-200 dark:border-slate-700/80">
                        <span className={cn(
                          "inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase border",
                          isInternat 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300" 
                            : "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300"
                        )}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center font-arabic font-bold text-sm text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700/80">
                        {o.option}
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
            <span>Affichage : {filteredOustazs.length} Oustazs & Seydas</span>
          </div>
          <div className="flex items-center gap-3 font-arabic">
            <span>مدرسة ابن قيم الجوزية • Daara Ibnoul Khayim Al Diawziya</span>
          </div>
        </div>
      </div>
    </div>
  );
}
