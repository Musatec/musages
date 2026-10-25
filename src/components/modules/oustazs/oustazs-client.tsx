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

      {/* REGISTRE OFFICIEL DES OUSTAZS (STYLE TABLEAU WORD PLEINE LARGEUR - EXACT MATCH SCREENSHOT EXCEL) */}
      <div className="md:hidden flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-3 py-1.5 rounded-lg border border-amber-300/60 dark:border-amber-800">
        <span>👈 Glissez horizontalement avec votre doigt pour voir toutes les colonnes du registre 👉</span>
      </div>
      <div className="w-full overflow-x-auto touch-pan-x bg-white dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-700 shadow-sm print:border-none print:shadow-none">
        
        <table className="w-full min-w-[700px] border-collapse border-2 border-slate-400 dark:border-slate-700 text-left font-sans">
          
          {/* EN-TÊTE DU REGISTRE DES OUSTAZS (REPRODUCTION FIDÈLE DU REGISTRE EXCEL) */}
          <thead>
            {/* LIGNE 1 : Titre Arabe & Année Scolaire */}
            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-b-2 border-slate-400 dark:border-slate-700">
              <th colSpan={4} className="p-3 text-center border-r border-slate-400 dark:border-slate-700">
                <h2 className="text-xl font-black font-arabic">الأساتذة</h2>
              </th>
              <th colSpan={2} className="p-3 text-center text-lg font-black font-sans">
                2025/2026
              </th>
            </tr>

            {/* LIGNE 2 : Subheader Rouge/Bordeaux Identique au Document */}
            <tr>
              <th colSpan={6} className="bg-white dark:bg-slate-900 text-rose-800 dark:text-rose-400 text-center py-2.5 px-4 border-b-2 border-slate-400 dark:border-slate-700 text-sm font-black uppercase tracking-wider">
                LES OUSTAZ DU DAARA IBNOUL KHAYIM AL DIAWZIYA
              </th>
            </tr>

            {/* LIGNE 3 : Entêtes de Colonnes en Vert Foncé avec Texte Blanc */}
            <tr className="bg-emerald-800 text-white text-xs font-black uppercase tracking-wider border-b-2 border-slate-400 dark:border-slate-700">
              <th className="p-3 text-center border-r border-emerald-900 w-16">N°</th>
              <th className="p-3 border-r border-emerald-900">Prénom</th>
              <th className="p-3 border-r border-emerald-900">Nom</th>
              <th className="p-3 border-r border-emerald-900 font-mono">Téléphone</th>
              <th className="p-3 text-center border-r border-emerald-900 w-36">STATUT</th>
              <th className="p-3 text-center font-arabic w-32">OPTION</th>
            </tr>
          </thead>

          {/* CORPS DU TABLEAU AVEC BORDURES COMPLETES SUR CHAQUE CELLULE */}
          <tbody className="divide-y divide-slate-300 dark:divide-slate-800 text-xs sm:text-sm font-semibold">
            {filteredOustazs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                  Aucun Oustaz ne correspond à votre recherche.
                </td>
              </tr>
            ) : (
              filteredOustazs.map((o, index) => {
                const isInternat = o.status === "INTERNAT";
                return (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    
                    {/* N° */}
                    <td className="p-3 text-center font-black bg-slate-100 dark:bg-slate-800 border-r border-slate-400 dark:border-slate-700 text-slate-900 dark:text-white">
                      {index + 1}
                    </td>

                    {/* Prénom */}
                    <td className="p-3 font-bold border-r border-slate-400 dark:border-slate-700 text-slate-900 dark:text-white">
                      {o.firstName}
                    </td>

                    {/* Nom */}
                    <td className="p-3 font-bold border-r border-slate-400 dark:border-slate-700 text-slate-900 dark:text-white">
                      {o.lastName}
                    </td>

                    {/* Téléphone */}
                    <td className="p-3 font-mono font-bold border-r border-slate-400 dark:border-slate-700 text-emerald-700 dark:text-emerald-400">
                      {o.phone}
                    </td>

                    {/* STATUT (Badge vert INTERNAT / rouge EXTERNAT) */}
                    <td className="p-2.5 text-center border-r border-slate-400 dark:border-slate-700">
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-xs ${
                        isInternat 
                          ? "bg-emerald-600 text-white border border-emerald-700" 
                          : "bg-rose-600 text-white border border-rose-700"
                      }`}>
                        {o.status}
                      </span>
                    </td>

                    {/* OPTION (القرآن / التهجي) */}
                    <td className="p-2.5 text-center font-arabic font-bold text-sm bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white border-l border-slate-400 dark:border-slate-700">
                      {o.option}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* PIED DE REGISTRE DES OUSTAZS */}
          <tfoot>
            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border-t-2 border-slate-400 dark:border-slate-700">
              <td colSpan={3} className="p-3 border-r border-slate-400 dark:border-slate-700">
                Total Enseignants Référents : {filteredOustazs.length} Oustazs & Seydas
              </td>
              <td colSpan={3} className="p-3 text-right font-arabic">
                مدرسة ابن قيم الجوزية • Daara Ibnoul Khayim Al Diawziya
              </td>
            </tr>
          </tfoot>

        </table>

      </div>

    </div>
  );
}
