"use client";

import { useState, useEffect } from "react";
import { 
  UserCheck, 
  BookOpen, 
  Plus, 
  Users, 
  Trash2, 
  Printer, 
  FileSpreadsheet, 
  Grid, 
  Search, 
  UserPlus,
  Phone
} from "lucide-react";
import { createHalqa, deleteClass } from "@/lib/actions/classes";
import { createStudent } from "@/lib/actions/students";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSpace } from "@/components/providers/space-provider";
import { cn } from "@/lib/utils";

interface TalibeItem {
  id: string;
  firstName: string;
  lastName: string;
  matricule: string;
  status: "INTERNE" | "EXTERNE" | "DEMI_PENSION" | string;
  parentName?: string | null;
  parentPhone?: string | null;
}

interface HalqaItem {
  id: string;
  name: string;
  level?: string | null;
  oustazName?: string | null;
  talibes?: TalibeItem[];
  _count?: { talibes: number };
}

interface ClassesClientProps {
  daaraName?: string;
  classes: HalqaItem[];
  subjects?: any[];
}

export function ClassesClient({ daaraName, classes: initialClasses }: ClassesClientProps) {
  const { activeSpace } = useSpace();
  const isSchool = activeSpace === "school";

  const [halqas, setHalqas] = useState<HalqaItem[]>(initialClasses);
  const [activeTab, setActiveTab] = useState<"register" | "grid">("register");
  const [selectedHalqaId, setSelectedHalqaId] = useState<string>(
    initialClasses.length > 0 ? initialClasses[0].id : ""
  );

  const [prevInitialClasses, setPrevInitialClasses] = useState(initialClasses);

  if (initialClasses !== prevInitialClasses) {
    setPrevInitialClasses(initialClasses);
    setHalqas(initialClasses);
    setSelectedHalqaId(initialClasses.length > 0 ? initialClasses[0].id : "");
  }

  // Filtres Registre
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // State Modal Création Halqa
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("MÉMORISATION (Hifz)");
  const [oustazName, setOustazName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Modal Inscription Talibé rapide
  const [showAddTalibeModal, setShowAddTalibeModal] = useState(false);
  const [tFirstName, setTFirstName] = useState("");
  const [tLastName, setTLastName] = useState("");
  const [tStatus, setTStatus] = useState<"INTERNE" | "EXTERNE">("INTERNE");
  const [tParentName, setTParentName] = useState("");
  const [tParentPhone, setTParentPhone] = useState("");
  const [isAddingTalibe, setIsAddingTalibe] = useState(false);

  // Active selected Halqa for Register view
  const currentHalqa = halqas.find(h => h.id === selectedHalqaId) || halqas[0];

  // Talibés filtrés de la Halqa en cours
  const filteredTalibes = (currentHalqa?.talibes || []).filter(t => {
    const matchesSearch = 
      t.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.matricule.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === "ALL" || 
      t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const countInternes = (currentHalqa?.talibes || []).filter(t => t.status === "INTERNE").length;
  const countExternes = (currentHalqa?.talibes || []).filter(t => t.status === "EXTERNE").length;

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
      const newHalqa = { ...res.halqa, talibes: [], _count: { talibes: 0 } };
      setHalqas([...halqas, newHalqa]);
      if (!selectedHalqaId) setSelectedHalqaId(newHalqa.id);
      setShowAddModal(false);
      setName("");
      setOustazName("");
    } else {
      toast.error(res.error || "Erreur lors de la création de la Halqa.");
    }
  };

  const handleAddTalibeToHalqa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tFirstName || !tLastName) {
      toast.error("Le prénom et le nom sont obligatoires.");
      return;
    }

    if (!selectedHalqaId) {
      toast.error("Veuillez sélectionner une Halqa.");
      return;
    }

    setIsAddingTalibe(true);
    const res = await createStudent({
      firstName: tFirstName,
      lastName: tLastName,
      status: tStatus,
      classId: selectedHalqaId,
      parentName: tParentName,
      parentPhone: tParentPhone,
    });

    setIsAddingTalibe(false);

    if (res.success && res.student) {
      toast.success(`Talibé ${tFirstName} ${tLastName} inscrit dans la Halqa ! 🎉`);
      
      const updatedHalqas = halqas.map(h => {
        if (h.id === selectedHalqaId) {
          const updatedTalibes = [...(h.talibes || []), res.student as any];
          return {
            ...h,
            talibes: updatedTalibes,
            _count: { talibes: updatedTalibes.length }
          };
        }
        return h;
      });

      setHalqas(updatedHalqas);
      setShowAddTalibeModal(false);
      setTFirstName("");
      setTLastName("");
      setTParentName("");
      setTParentPhone("");
    } else {
      toast.error(res.error || "Erreur lors de l'inscription.");
    }
  };

  const handleDeleteHalqa = async (id: string, halqaName: string) => {
    if (confirm(`Voulez-vous vraiment supprimer la Halqa "${halqaName}" ?`)) {
      const res = await deleteClass(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Halqa supprimée.");
        const updated = halqas.filter(h => h.id !== id);
        setHalqas(updated);
        if (selectedHalqaId === id && updated.length > 0) {
          setSelectedHalqaId(updated[0].id);
        }
      }
    }
  };

  const handlePrintRegister = () => {
    window.print();
  };

  return (
    <div className="space-y-3 w-full max-w-full font-sans">
      
      {/* TOOLBAR SUPERIEURE ULTRA COMPACTE SUR UNE SEULE LIGNE (100% LARGEUR) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden w-full">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${isSchool ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"}`}>
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-black text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
              <span className="truncate">{isSchool ? "Classes & Salles • École Pathé Pogne" : "Registre Officiel des Halqas"}</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border shrink-0 ${isSchool ? "text-amber-800 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800" : "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800"}`}>
                {halqas.length} {isSchool ? "Classe(s)" : "Cercle(s)"}
              </span>
            </h1>
          </div>
        </div>

        {/* Boutons d'Action Rapides (Imprimer, Inscrire, Nouvelle Halqa, Vues) */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-stretch sm:justify-end text-xs font-bold">
          {activeTab === "register" && currentHalqa && (
            <>
              {/* Modal Ajouter un Talibé / Élève */}
              <Dialog open={showAddTalibeModal} onOpenChange={setShowAddTalibeModal}>
                <DialogTrigger asChild>
                  <Button size="sm" className={isSchool ? "bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 rounded-lg shadow-xs" : "bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 rounded-lg shadow-xs"}>
                    <UserPlus className="w-3.5 h-3.5" /> {isSchool ? "Inscrire un Élève" : "Inscrire un Talibé"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold">
                      <UserPlus className="w-4 h-4 text-emerald-600" /> Inscription dans {currentHalqa.name}
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleAddTalibeToHalqa} className="space-y-3 pt-2 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600">Prénom (الاسم)</label>
                        <Input 
                          placeholder="Ex: آمنة / Amina" 
                          value={tFirstName}
                          onChange={(e) => setTFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600">Nom / اللقب</label>
                        <Input 
                          placeholder="Ex: انجاي / Ndiaye" 
                          value={tLastName}
                          onChange={(e) => setTLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">Régime d'Accueil</label>
                      <select 
                        value={tStatus} 
                        onChange={(e) => setTStatus(e.target.value as any)}
                        className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs font-semibold"
                      >
                        <option value="INTERNE">INTERNAT (Pensionnaire مقيم)</option>
                        <option value="EXTERNE">EXTERNAT (Cours Matin/Soir خارجي)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600">Parent / Tuteur</label>
                        <Input 
                          placeholder="Ex: Ousmane Ndiaye" 
                          value={tParentName}
                          onChange={(e) => setTParentName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600">Téléphone WhatsApp</label>
                        <Input 
                          placeholder="Ex: 77 123 45 67" 
                          value={tParentPhone}
                          onChange={(e) => setTParentPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowAddTalibeModal(false)}>
                        Annuler
                      </Button>
                      <Button type="submit" size="sm" disabled={isAddingTalibe} className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
                        {isAddingTalibe ? "Inscription..." : "Valider"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Button 
                onClick={handlePrintRegister}
                variant="outline" 
                size="sm"
                className="border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs gap-1.5 rounded-lg"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-600" /> Imprimer
              </Button>
            </>
          )}

          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs gap-1.5 rounded-lg">
                <Plus className="w-3.5 h-3.5" /> Nouvelle Halqa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base font-bold">
                  <BookOpen className="w-4 h-4 text-emerald-600" /> Création d'une Halqa Coranique
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreateHalqa} className="space-y-3 pt-2 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Nom de la Halqa</label>
                  <Input 
                    placeholder="Ex: Halqa Omar Ibn Al-Khattab, Halqa Al-Baqara" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Niveau d'Enseignement</label>
                  <select 
                    value={level} 
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs font-semibold"
                  >
                    <option value="DÉBUTANT (Mouqadima)">Débutant / Mouqadima (مبتدئ)</option>
                    <option value="MÉMORISATION (Hifz)">Mémorisation / Hifz (حفظ القرآن)</option>
                    <option value="PERFECTIONNEMENT (Tajwid)">Perfectionnement & Tajwid (تجويد وإتقان)</option>
                    <option value="KHATM & IJAZAH">Khatm & Ijazah (إجازة وخبرة)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Oustaz Référent (Maître)</label>
                  <Input 
                    placeholder="Ex: Oustaz Amal / أستاذ أمل" 
                    value={oustazName}
                    onChange={(e) => setOustazName(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" size="sm" disabled={isSubmitting} className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
                    {isSubmitting ? "Création..." : "Enregistrer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Toggle Vue Feuille Excel / Répertoire */}
          <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab("register")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${activeTab === "register" ? "bg-white dark:bg-slate-700 text-[#107c41] dark:text-emerald-400 shadow-xs font-extrabold" : "text-slate-500"}`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Tableau Excel
            </button>
            <button
              onClick={() => setActiveTab("grid")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${activeTab === "grid" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"}`}
            >
              <Grid className="w-3.5 h-3.5" /> Répertoire des Classes
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VUE 1 : FEUILLE DE CALCUL EXCEL PROFESSIONNELLE (BORDURES FINES, ALIGNEMENTS NETS) */}
      {/* ========================================================================= */}
      {activeTab === "register" && (
        <div className="space-y-4 w-full">
          
          {/* COMPACT & ELEGANT HALQA SELECTOR (HORIZONTAL CHIPS & MODAL TRIGGER) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 shadow-xs print:hidden w-full space-y-2">
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Halqa Coranique Active :
                </span>
              </div>

              {/* Modal Parcourir toutes les Halqas */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 gap-1.5 px-2.5 rounded-lg">
                    <Grid className="w-3.5 h-3.5" /> Voir toutes ({halqas.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold">
                      <BookOpen className="w-5 h-5 text-emerald-600" /> Répertoire Général des {halqas.length} Halqas
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-arabic dir-rtl">
                    {halqas.map((h) => {
                      const isSelected = h.id === selectedHalqaId;
                      const count = h._count?.talibes || h.talibes?.length || 0;
                      return (
                        <button
                          key={h.id}
                          onClick={() => {
                            setSelectedHalqaId(h.id);
                            setSearchQuery("");
                          }}
                          className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between gap-2 text-xs cursor-pointer ${
                            isSelected
                              ? "bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/50"
                              : "bg-slate-50 hover:bg-emerald-50/60 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-sans font-bold text-[10px] px-2 py-0.5 rounded bg-white/20 text-white">
                              {h.level?.includes("Hifz") ? "Hifz / القرآن" : "Tahajji / التهجي"}
                            </span>
                            <span className="font-black text-sm">{h.name}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-black/10 dark:border-white/10 font-sans">
                            <span className="font-bold text-[11px] font-arabic">{h.oustazName ? `أستاذ : ${h.oustazName}` : "بدون أستاذ"}</span>
                            <Badge variant="outline" className={isSelected ? "bg-white text-emerald-900 font-bold" : ""}>
                              {count} Talibé(s)
                            </Badge>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* BARRE DE PILLS HORIZONTALE COMPACTE ET DYNAMIQUE */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar text-xs w-full">
              {halqas.map((h) => {
                const isSelected = h.id === selectedHalqaId;
                const talibeCount = h._count?.talibes || h.talibes?.length || 0;

                return (
                  <button
                    key={h.id}
                    onClick={() => {
                      setSelectedHalqaId(h.id);
                      setSearchQuery("");
                    }}
                    className={`px-3.5 py-1.5 rounded-lg font-bold transition-all shrink-0 flex items-center gap-2 border text-xs cursor-pointer ${
                      isSelected
                        ? "bg-[#107c41] text-white border-[#0d6937] shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>{h.name}</span>
                    <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md font-sans ${
                      isSelected ? "bg-white text-emerald-900" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}>
                      {talibeCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BARRE INTERNE DE RECHERCHE ET FILTRES DANS LE REGISTRE */}
          {currentHalqa && (
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between print:hidden text-xs w-full">
              
              {/* Sélecteur Liste Déroulante Halqa */}
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-slate-700 w-full sm:w-64 font-bold">
                <BookOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <select
                  value={selectedHalqaId}
                  onChange={(e) => {
                    setSelectedHalqaId(e.target.value);
                    setSearchQuery("");
                  }}
                  className="bg-transparent w-full text-xs font-bold outline-none text-emerald-950 dark:text-emerald-200 cursor-pointer"
                >
                  {halqas.map((h) => (
                    <option key={h.id} value={h.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                      {h.name} ({h._count?.talibes || h.talibes?.length || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Champ Recherche */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 w-full sm:w-auto flex-1">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input 
                  type="text"
                  placeholder="Rechercher un Talibé par nom ou prénom dans ce registre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent w-full text-xs font-medium outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg font-bold w-full sm:w-auto">
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-2 sm:px-3 py-1.5 sm:py-1 rounded text-center transition-all ${statusFilter === "ALL" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"}`}
                >
                  Tous ({currentHalqa.talibes?.length || 0})
                </button>
                <button
                  onClick={() => setStatusFilter("INTERNE")}
                  className={`px-2 sm:px-3 py-1.5 sm:py-1 rounded text-center transition-all ${statusFilter === "INTERNE" ? "bg-[#107c41] text-white shadow-xs" : "text-slate-500"}`}
                >
                  Internat ({countInternes})
                </button>
                <button
                  onClick={() => setStatusFilter("EXTERNE")}
                  className={`px-2 sm:px-3 py-1.5 sm:py-1 rounded text-center transition-all ${statusFilter === "EXTERNE" ? "bg-amber-600 text-white shadow-xs" : "text-slate-500"}`}
                >
                  Externat ({countExternes})
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FEUILLE DE CALCUL EXCEL PROFESSIONNELLE (BORDURES FINES, ALIGNEMENTS NETS) */}
          {/* ========================================================================= */}
          {currentHalqa ? (
            <div className="w-full overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm print:border-none print:shadow-none">
              
              {/* EXCEL SHEET RIBBON / BANDEAU SUPÉRIEUR DE FEUILLE */}
              <div className="bg-slate-100 dark:bg-slate-800/90 px-4 py-2.5 border-b border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 font-bold text-slate-800 dark:text-slate-200">
                  <div className="w-5 h-5 rounded bg-[#107c41] text-white flex items-center justify-center font-black text-[10px] shrink-0">
                    X
                  </div>
                  <span className="font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                    {isSchool ? `Feuille : Classe ${currentHalqa.name}` : `Feuille : Halqa ${currentHalqa.name}`}
                  </span>
                  <span className="text-slate-400 font-normal">|</span>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    {currentHalqa.oustazName ? `Enseignant : ${currentHalqa.oustazName}` : "Sans enseignant attitré"}
                  </span>
                  <span className="text-slate-400 font-normal hidden sm:inline">|</span>
                  <span className="text-slate-500 font-mono text-[11px] hidden sm:inline">Année : 2025/2026</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                    {filteredTalibes.length} {isSchool ? "Élève(s)" : "Talibé(s)"}
                  </span>
                  <Button 
                    onClick={() => setShowAddTalibeModal(true)}
                    size="sm"
                    className="h-7 px-2.5 text-xs font-bold bg-[#107c41] hover:bg-[#0d6937] text-white gap-1 rounded"
                  >
                    <Plus className="w-3.5 h-3.5" /> Inscrire
                  </Button>
                </div>
              </div>

              {/* TABLEAU GRILLE EXCEL (DÉFILEMENT HORIZONTAL FLUIDE) */}
              <div className="w-full overflow-x-auto touch-pan-x">
                <table className="w-full min-w-[760px] border-collapse text-left text-xs text-slate-800 dark:text-slate-200">
                  
                  {/* EN-TÊTE DE COLONNES EXCEL (VERT EXCEL #107c41) */}
                  <thead>
                    <tr className="bg-[#107c41] text-white font-bold text-xs uppercase tracking-wider select-none">
                      <th className="w-12 py-2.5 px-2 text-center border-r border-emerald-600/50 bg-[#0d6937] text-white/90 font-mono text-[11px]">
                        N°
                      </th>
                      <th className="w-32 py-2.5 px-3 text-center border-r border-emerald-600/50">
                        Matricule
                      </th>
                      <th className="py-2.5 px-3 border-r border-emerald-600/50 min-w-[150px]">
                        Nom de Famille
                      </th>
                      <th className="py-2.5 px-3 border-r border-emerald-600/50 min-w-[150px]">
                        Prénom(s)
                      </th>
                      <th className="w-32 py-2.5 px-3 text-center border-r border-emerald-600/50">
                        Régime / Statut
                      </th>
                      <th className="py-2.5 px-3 border-r border-emerald-600/50 min-w-[150px]">
                        Parent / Tuteur
                      </th>
                      <th className="w-36 py-2.5 px-3 text-center border-r border-emerald-600/50">
                        Téléphone
                      </th>
                      <th className="w-20 py-2.5 px-2 text-center">
                        WhatsApp
                      </th>
                    </tr>
                  </thead>

                  {/* CORPS DU TABLEAU AVEC QUADRILLAGE FIN EXCEL */}
                  <tbody>
                    {filteredTalibes.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-10 text-center text-slate-400 font-sans border-b border-slate-200 dark:border-slate-800 italic">
                          {searchQuery 
                            ? (isSchool ? "Aucun élève ne correspond à la recherche." : "Aucun Talibé ne correspond à la recherche.") 
                            : (isSchool ? "Aucun élève n'est encore inscrit dans cette classe." : "Aucun Talibé n'est encore inscrit dans cette Halqa.")}
                        </td>
                      </tr>
                    ) : (
                      filteredTalibes.map((talibe, index) => {
                        const isInternat = talibe.status === "INTERNE";
                        const isExternat = talibe.status === "EXTERNE";

                        return (
                          <tr 
                            key={talibe.id} 
                            className={cn(
                              "transition-colors hover:bg-[#e8f4fc] dark:hover:bg-slate-800/80",
                              index % 2 === 1 ? "bg-[#f8fafc] dark:bg-slate-800/40" : "bg-white dark:bg-slate-900"
                            )}
                          >
                            {/* Colonne Numérotation Excel (Grisée comme dans Excel) */}
                            <td className="py-2 px-2 text-center font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-[#f1f3f5] dark:bg-slate-800/70 border-r border-b border-slate-200 dark:border-slate-700/80 select-none">
                              {index + 1}
                            </td>

                            {/* Matricule */}
                            <td className="py-2 px-3 text-center border-r border-b border-slate-200 dark:border-slate-700/80 font-mono font-bold text-emerald-700 dark:text-emerald-400 text-[11px]">
                              {talibe.matricule || `TAL-${String(talibe.id).slice(-4)}`}
                            </td>

                            {/* Nom de Famille */}
                            <td className="py-2 px-3 border-r border-b border-slate-200 dark:border-slate-700/80 font-extrabold text-slate-900 dark:text-slate-100 uppercase">
                              {talibe.lastName}
                            </td>

                            {/* Prénom(s) */}
                            <td className="py-2 px-3 border-r border-b border-slate-200 dark:border-slate-700/80 font-semibold text-slate-800 dark:text-slate-200">
                              {talibe.firstName}
                            </td>

                            {/* Régime / Statut (Style Cellule Excel Pro) */}
                            <td className="py-2 px-3 text-center border-r border-b border-slate-200 dark:border-slate-700/80">
                              <span className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                                isInternat 
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800" 
                                  : isExternat 
                                    ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800" 
                                    : "bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800"
                              )}>
                                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isInternat ? "bg-emerald-600" : isExternat ? "bg-amber-600" : "bg-purple-600")} />
                                {isInternat ? "Internat" : isExternat ? "Externat" : "Demi-Pension"}
                              </span>
                            </td>

                            {/* Parent / Tuteur */}
                            <td className="py-2 px-3 border-r border-b border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 font-medium truncate max-w-[160px]">
                              {talibe.parentName || "—"}
                            </td>

                            {/* Téléphone */}
                            <td className="py-2 px-3 text-center border-r border-b border-slate-200 dark:border-slate-700/80 font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                              {talibe.parentPhone || "—"}
                            </td>

                            {/* Actions WhatsApp */}
                            <td className="py-2 px-2 text-center border-b border-slate-200 dark:border-slate-700/80">
                              {talibe.parentPhone ? (
                                <a 
                                  href={`https://wa.me/${talibe.parentPhone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center w-7 h-7 rounded text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-950/60 transition-all"
                                  title="Ouvrir conversation WhatsApp"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              ) : (
                                <span className="text-slate-400 text-[10px]">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>

                  {/* PIED DU TABLEAU EXCEL (BARRE DE STATUT & TOTAUX) */}
                  <tfoot>
                    <tr className="bg-[#f1f3f5] dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-t-2 border-slate-300 dark:border-slate-600 text-xs select-none">
                      <td colSpan={3} className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500 uppercase tracking-wider text-[10px] mr-2">LIGNES :</span>
                        <span>{filteredTalibes.length} {isSchool ? "Élèves" : "Talibés"} inscrits</span>
                      </td>
                      <td colSpan={3} className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                        <span className="text-emerald-700 dark:text-emerald-400 mr-3">✓ Internes : {countInternes}</span>
                        <span className="text-amber-700 dark:text-amber-400">✓ Externes : {countExternes}</span>
                      </td>
                      <td colSpan={2} className="py-2.5 px-3 text-right font-mono text-[11px] text-slate-500">
                        Feuille active • Prêt
                      </td>
                    </tr>
                  </tfoot>

                </table>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-400">
              Veuillez sélectionner ou créer une Halqa.
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 2 : TABLEAU RÉPERTOIRE DES CLASSES / HALQAS (STYLE EXCEL PROFESSIONNEL) */}
      {/* ========================================================================= */}
      {activeTab === "grid" && (
        <div className="w-full overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm print:border-none print:shadow-none">
          
          {/* EXCEL SHEET RIBBON */}
          <div className="bg-slate-100 dark:bg-slate-800/90 px-4 py-2.5 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <div className="w-5 h-5 rounded bg-[#107c41] text-white flex items-center justify-center font-black text-[10px] shrink-0">
                X
              </div>
              <span className="uppercase tracking-wider">
                {isSchool ? "Feuille : Répertoire des Classes & Paliers Pédagogiques" : "Feuille : Répertoire Général des Halqas Coraniques"}
              </span>
              <span className="text-slate-400 font-mono text-[11px]">({halqas.length} classes enregistrées)</span>
            </div>
          </div>

          <div className="w-full overflow-x-auto touch-pan-x">
            <table className="w-full min-w-[750px] border-collapse text-left text-xs text-slate-800 dark:text-slate-200">
              <thead>
                <tr className="bg-[#107c41] text-white font-bold text-xs uppercase tracking-wider select-none">
                  <th className="w-12 py-2.5 px-2 text-center border-r border-emerald-600/50 bg-[#0d6937] text-white/90 font-mono text-[11px]">N°</th>
                  <th className="py-2.5 px-3 border-r border-emerald-600/50 min-w-[180px]">{isSchool ? "Classe / Niveau" : "Nom de la Halqa / Cercle"}</th>
                  <th className="py-2.5 px-3 border-r border-emerald-600/50 min-w-[150px]">{isSchool ? "Palier Pédagogique" : "Niveau d'Enseignement"}</th>
                  <th className="py-2.5 px-3 border-r border-emerald-600/50 min-w-[160px]">{isSchool ? "Enseignant Titulaire" : "Maître Référent (Oustaz)"}</th>
                  <th className="w-28 py-2.5 px-3 text-center border-r border-emerald-600/50">Effectif</th>
                  <th className="w-40 py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {halqas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 border-b border-slate-200 dark:border-slate-800 italic">
                      Aucune classe configurée. Cliquez sur "Nouvelle Halqa" ci-dessus.
                    </td>
                  </tr>
                ) : (
                  halqas.map((h, idx) => {
                    const count = h._count?.talibes || h.talibes?.length || 0;
                    return (
                      <tr 
                        key={h.id} 
                        className={cn(
                          "transition-colors hover:bg-[#e8f4fc] dark:hover:bg-slate-800/80",
                          idx % 2 === 1 ? "bg-[#f8fafc] dark:bg-slate-800/40" : "bg-white dark:bg-slate-900"
                        )}
                      >
                        <td className="py-2.5 px-2 text-center font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-[#f1f3f5] dark:bg-slate-800/70 border-r border-b border-slate-200 dark:border-slate-700/80 select-none">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-extrabold text-slate-900 dark:text-white border-r border-b border-slate-200 dark:border-slate-700/80">
                          {h.name}
                        </td>
                        <td className="py-2.5 px-3 border-r border-b border-slate-200 dark:border-slate-700/80">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                            {h.level || (isSchool ? "Primaire" : "Hifz")}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300 border-r border-b border-slate-200 dark:border-slate-700/80">
                          {h.oustazName || <span className="text-slate-400 italic font-normal">Non assigné</span>}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-black text-emerald-700 dark:text-emerald-400 border-r border-b border-slate-200 dark:border-slate-700/80">
                          {count} {isSchool ? "Élèves" : "Talibés"}
                        </td>
                        <td className="py-2.5 px-3 text-center border-b border-slate-200 dark:border-slate-700/80">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              onClick={() => {
                                setSelectedHalqaId(h.id);
                                setActiveTab("register");
                              }}
                              size="sm"
                              className="h-7 px-2.5 text-[11px] font-bold bg-[#107c41] hover:bg-[#0d6937] text-white gap-1 rounded"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5" /> Ouvrir Feuille
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteHalqa(h.id, h.name)}
                              className="h-7 w-7 p-0 text-rose-500 hover:bg-rose-500/10 rounded"
                              title="Supprimer la Halqa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr className="bg-[#f1f3f5] dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-t-2 border-slate-300 dark:border-slate-600 text-xs select-none">
                  <td colSpan={4} className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] mr-2">TOTAL :</span>
                    <span>{halqas.length} Classes actives</span>
                  </td>
                  <td colSpan={2} className="py-2.5 px-3 text-right font-mono text-[11px] text-slate-500">
                    Effectif combiné : {halqas.reduce((acc, h) => acc + (h._count?.talibes || h.talibes?.length || 0), 0)} inscrits
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
