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
  UserPlus 
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

const MOCK_SCHOOL_CLASSES: HalqaItem[] = [
  {
    id: "cls-ci",
    name: "Classe CI (Cours Initiatique)",
    level: "Primaire Initial",
    oustazName: "Mr. Amadou Ba",
    talibes: [
      { id: "sch-1", firstName: "Alioune", lastName: "Badara", matricule: "EP-2026-001", status: "INTERNE", parentName: "Mamadou Badara", parentPhone: "+221 77 123 45 67" },
      { id: "sch-2", firstName: "Fatoumata", lastName: "Sarr", matricule: "EP-2026-002", status: "EXTERNE", parentName: "Oumar Sarr", parentPhone: "+221 78 234 56 78" },
      { id: "sch-3", firstName: "Moussa", lastName: "Kante", matricule: "EP-2026-003", status: "INTERNE", parentName: "Cheikh Kante", parentPhone: "+221 70 345 67 89" },
      { id: "sch-4", firstName: "Coumba", lastName: "Ndiaye", matricule: "EP-2026-004", status: "EXTERNE", parentName: "Balla Ndiaye", parentPhone: "+221 76 111 22 33" },
    ],
    _count: { talibes: 4 }
  },
  {
    id: "cls-cp",
    name: "Classe CP (Cours Préparatoire)",
    level: "Primaire Élémentaire 1",
    oustazName: "Mr. Moussa Ndiaye",
    talibes: [
      { id: "sch-5", firstName: "Aïssatou", lastName: "Fall", matricule: "EP-2026-005", status: "EXTERNE", parentName: "Ibrahima Fall", parentPhone: "+221 77 456 78 90" },
      { id: "sch-6", firstName: "Cheikh Tidiane", lastName: "Sy", matricule: "EP-2026-006", status: "INTERNE", parentName: "Serigne Sy", parentPhone: "+221 76 567 89 01" },
      { id: "sch-7", firstName: "Sokhna", lastName: "Diop", matricule: "EP-2026-007", status: "INTERNE", parentName: "Abdoulaye Diop", parentPhone: "+221 70 222 33 44" }
    ],
    _count: { talibes: 3 }
  },
  {
    id: "cls-ce1",
    name: "Classe CE1 (Cours Élémentaire 1)",
    level: "Primaire Élémentaire 2",
    oustazName: "Mme Fatou Diallo",
    talibes: [
      { id: "sch-8", firstName: "Mariama", lastName: "Bâ", matricule: "EP-2026-008", status: "INTERNE", parentName: "Alassane Bâ", parentPhone: "+221 77 678 90 12" },
      { id: "sch-9", firstName: "Ibrahima", lastName: "Sow", matricule: "EP-2026-009", status: "EXTERNE", parentName: "Amadou Sow", parentPhone: "+221 78 789 01 23" },
      { id: "sch-10", firstName: "Khadidiatou", lastName: "Kane", matricule: "EP-2026-010", status: "EXTERNE", parentName: "Oumar Kane", parentPhone: "+221 77 333 44 55" }
    ],
    _count: { talibes: 3 }
  },
  {
    id: "cls-ce2",
    name: "Classe CE2 (Cours Élémentaire 2)",
    level: "Niveau Moyen 1",
    oustazName: "Mr. Ousmane Diop",
    talibes: [
      { id: "sch-11", firstName: "Abdoulaye", lastName: "Gueye", matricule: "EP-2026-011", status: "INTERNE", parentName: "Modou Gueye", parentPhone: "+221 77 890 12 34" },
      { id: "sch-12", firstName: "Binetou", lastName: "Cissé", matricule: "EP-2026-012", status: "EXTERNE", parentName: "Saliou Cissé", parentPhone: "+221 78 444 55 66" }
    ],
    _count: { talibes: 2 }
  },
  {
    id: "cls-cm1",
    name: "Classe CM1 (Cours Moyen 1)",
    level: "Niveau Moyen 2",
    oustazName: "Mr. Ibrahima Sow",
    talibes: [
      { id: "sch-13", firstName: "Khady", lastName: "Ndiaye", matricule: "EP-2026-013", status: "EXTERNE", parentName: "Balla Ndiaye", parentPhone: "+221 76 901 23 45" },
      { id: "sch-14", firstName: "Mouhamed", lastName: "Mbacké", matricule: "EP-2026-014", status: "INTERNE", parentName: "Serigne Mbacké", parentPhone: "+221 77 555 66 77" }
    ],
    _count: { talibes: 2 }
  },
  {
    id: "cls-cm2",
    name: "Classe CM2 (Cours Moyen 2 - Examen CFEE)",
    level: "Terminal Primaire",
    oustazName: "Mr. Cheikh Kane",
    talibes: [
      { id: "sch-15", firstName: "Ousmane", lastName: "Kane", matricule: "EP-2026-015", status: "INTERNE", parentName: "Saliou Kane", parentPhone: "+221 77 012 34 56" },
      { id: "sch-16", firstName: "Rama", lastName: "Sene", matricule: "EP-2026-016", status: "EXTERNE", parentName: "Alioune Sene", parentPhone: "+221 70 666 77 88" }
    ],
    _count: { talibes: 2 }
  }
];

export function ClassesClient({ daaraName, classes: initialClasses }: ClassesClientProps) {
  const { activeSpace } = useSpace();
  const isSchool = activeSpace === "school";

  const [halqas, setHalqas] = useState<HalqaItem[]>(isSchool ? MOCK_SCHOOL_CLASSES : initialClasses);
  const [activeTab, setActiveTab] = useState<"register" | "grid">("register");
  const [selectedHalqaId, setSelectedHalqaId] = useState<string>(
    isSchool ? MOCK_SCHOOL_CLASSES[0].id : (initialClasses.length > 0 ? initialClasses[0].id : "")
  );

  useEffect(() => {
    if (isSchool) {
      setHalqas(MOCK_SCHOOL_CLASSES);
      setSelectedHalqaId(MOCK_SCHOOL_CLASSES[0].id);
    } else {
      setHalqas(initialClasses);
      if (initialClasses.length > 0) {
        setSelectedHalqaId(initialClasses[0].id);
      }
    }
  }, [isSchool, initialClasses]);

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
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden w-full">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${isSchool ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"}`}>
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isSchool ? "Classes & Salles de Cours • École Pathé Pogne" : "Registre Officiel des Halqas"}</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${isSchool ? "text-amber-800 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800" : "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800"}`}>
                {halqas.length} {isSchool ? "Classe(s)" : "Cercle(s)"}
              </span>
            </h1>
          </div>
        </div>

        {/* Boutons d'Action Rapides (Imprimer, Inscrire, Nouvelle Halqa, Vues) */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end text-xs font-bold">
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

          {/* Toggle Vue Registre / Fiches */}
          <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab("register")}
              className={`px-3 py-1 rounded-md transition-all ${activeTab === "register" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"}`}
            >
              Registre Word
            </button>
            <button
              onClick={() => setActiveTab("grid")}
              className={`px-3 py-1 rounded-md transition-all ${activeTab === "grid" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"}`}
            >
              Fiches Halqas
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VUE REGISTRE STYLE TABLEAU WORD (100% LARGEUR, VRAIES BORDURES DE CELLULES) */}
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

            {/* BARRE DE PILLS HORIZONTALE COMPACTE ET DYNAMIQUE (1 SEULE LIGNE DE DÉFILEMENT) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar font-arabic text-xs w-full dir-rtl">
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
                        ? "bg-emerald-800 text-white border-emerald-900 shadow-xs ring-1 ring-emerald-500"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:border-emerald-300"
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
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-slate-700 w-full sm:w-64 font-bold font-arabic">
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

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg font-bold">
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-3 py-1 rounded transition-all ${statusFilter === "ALL" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"}`}
                >
                  Tous ({currentHalqa.talibes?.length || 0})
                </button>
                <button
                  onClick={() => setStatusFilter("INTERNE")}
                  className={`px-3 py-1 rounded transition-all ${statusFilter === "INTERNE" ? "bg-emerald-700 text-white shadow-xs" : "text-slate-500"}`}
                >
                  Internat ({countInternes})
                </button>
                <button
                  onClick={() => setStatusFilter("EXTERNE")}
                  className={`px-3 py-1 rounded transition-all ${statusFilter === "EXTERNE" ? "bg-rose-700 text-white shadow-xs" : "text-slate-500"}`}
                >
                  Externat ({countExternes})
                </button>
              </div>
            </div>
          )}

          {/* VRAI TABLEAU DE STYLE WORD (LARGEUR 100%, BORDURES SUR TOUTES LES CELLULES) */}
          {currentHalqa ? (
            <div className="w-full overflow-x-auto touch-pan-x bg-white dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-700 shadow-sm print:border-none print:shadow-none">
              
              <table className="w-full min-w-[550px] border-collapse border-2 border-slate-400 dark:border-slate-700 text-right dir-rtl font-arabic">
                
                {/* EN-TÊTE DU TABLEAU WORD (DIRECTEMENT LES LIGNES DU TABLEAU INTEGREES) */}
                <thead>
                  {/* LIGNE 1 : Nom de la Halqa / Classe */}
                  <tr>
                    <th colSpan={4} className={isSchool ? "bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 text-center py-3 px-4 border border-slate-400 dark:border-slate-700 text-base sm:text-lg font-black" : "bg-emerald-50 dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 text-center py-3 px-4 border border-slate-400 dark:border-slate-700 text-base sm:text-lg font-black"}>
                      {currentHalqa.name}
                    </th>
                  </tr>

                  {/* LIGNE 2 : Oustaz / Enseignant Référent */}
                  <tr>
                    <th colSpan={4} className={isSchool ? "bg-amber-700 text-white text-center py-2.5 px-4 border border-slate-400 dark:border-slate-700 text-xs sm:text-sm font-bold" : "bg-sky-600 text-white text-center py-2.5 px-4 border border-slate-400 dark:border-slate-700 text-xs sm:text-sm font-bold"}>
                      {currentHalqa.oustazName ? (isSchool ? `Enseignant Titulaire : ${currentHalqa.oustazName}` : `أستاذ : ${currentHalqa.oustazName}`) : (isSchool ? "Enseignant non spécifié" : "أستاذ غير محدد")}
                    </th>
                  </tr>

                  {/* LIGNE 3 : Année Scolaire (En-tête Noir/Slate) */}
                  <tr>
                    <th colSpan={4} className="bg-slate-900 text-white text-center py-2 px-4 border border-slate-400 dark:border-slate-700 text-xs font-black uppercase tracking-widest font-sans">
                      ANNEE SCOLAIRE : 2025 / 2026
                    </th>
                  </tr>

                  {/* LIGNE 4 : Colonnes du Tableau avec bordures complètes */}
                  <tr className={isSchool ? "bg-amber-200/80 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-black" : "bg-emerald-200/80 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-black"}>
                    <th className="p-3 text-center border border-slate-400 dark:border-slate-700 w-36">
                      STATUT / Régime
                    </th>
                    <th className="p-3 border border-slate-400 dark:border-slate-700 text-right">
                      Nom / الألقاب
                    </th>
                    <th className="p-3 border border-slate-400 dark:border-slate-700 text-right">
                      Prénom / الأسماء
                    </th>
                    <th className={isSchool ? "p-3 text-center border border-slate-400 dark:border-slate-700 bg-amber-600 text-white w-20" : "p-3 text-center border border-slate-400 dark:border-slate-700 bg-blue-600 text-white w-20"}>
                      N° / الرقم
                    </th>
                  </tr>
                </thead>

                {/* CORPS DU TABLEAU AVEC BORDURES DE CELLULES STYLE WORD */}
                <tbody className="text-xs sm:text-sm">
                  {filteredTalibes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 font-sans border border-slate-400 dark:border-slate-700">
                        {searchQuery ? (isSchool ? "Aucun élève ne correspond à la recherche." : "Aucun Talibé ne correspond à la recherche.") : (isSchool ? "Aucun élève n'est inscrit dans cette classe." : "Aucun Talibé n'est inscrit dans cette Halqa.")}
                      </td>
                    </tr>
                  ) : (
                    filteredTalibes.map((talibe, index) => {
                      const isInternat = talibe.status === "INTERNE";
                      const isExternat = talibe.status === "EXTERNE";

                      return (
                        <tr key={talibe.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          
                          {/* Statut Badge Pill avec bordure de cellule */}
                          <td className="p-2.5 text-center border border-slate-400 dark:border-slate-700">
                            <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-xs ${
                              isInternat 
                                ? (isSchool ? "bg-amber-600 text-white border border-amber-700" : "bg-emerald-600 text-white border border-emerald-700")
                                : isExternat 
                                  ? "bg-rose-600 text-white border border-rose-700" 
                                  : "bg-sky-600 text-white border border-sky-700"
                            }`}>
                              {isInternat ? "INTERNAT" : isExternat ? "EXTERNAT" : "DEMI-PENSION"}
                            </span>
                          </td>

                          {/* Nom / اللقب */}
                          <td className="p-2.5 border border-slate-400 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                            {talibe.lastName}
                          </td>

                          {/* Prénom / الاسم */}
                          <td className="p-2.5 border border-slate-400 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                            {talibe.firstName}
                          </td>

                          {/* Numéro / الرقم */}
                          <td className={`p-2.5 text-center font-black border border-slate-400 dark:border-slate-700 text-xs sm:text-sm ${isSchool ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200" : "bg-sky-100 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200"}`}>
                            {index + 1}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>

                {/* PIED DU TABLEAU WORD */}
                <tfoot>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-sans text-xs">
                    <td colSpan={2} className="p-3 border border-slate-400 dark:border-slate-700 font-semibold text-left dir-ltr">
                      Effectif total : {filteredTalibes.length} {isSchool ? "Élève(s)" : "Talibé(s)"}
                    </td>
                    <td colSpan={2} className="p-3 border border-slate-400 dark:border-slate-700 font-arabic font-bold text-right">
                      {isSchool ? "مدرسة باثي بونغ الفرنكو عربية • École Pathé Pogne" : "مدرسة ابن قيم الجوزية • Daara.net"}
                    </td>
                  </tr>
                </tfoot>

              </table>

            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-slate-400 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-400">
              Veuillez sélectionner ou créer une Halqa.
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 2 : FICHES HALQAS (GRID VIEW COMPACT) */}
      {/* ========================================================================= */}
      {activeTab === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {halqas.length === 0 ? (
            <div className="col-span-full text-center py-12 border border-dashed rounded-xl bg-white dark:bg-slate-900 space-y-2 text-xs">
              <UserCheck className="w-10 h-10 text-slate-400 mx-auto opacity-40" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300">Aucune Halqa configurée.</h3>
              <p className="text-slate-500">Cliquez sur "Nouvelle Halqa" pour ajouter la première classe coranique.</p>
            </div>
          ) : (
            halqas.map((h) => (
              <Card key={h.id} className="relative group overflow-hidden border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 transition-all shadow-xs rounded-xl bg-white dark:bg-slate-900">
                <CardHeader className="pb-2.5 flex flex-row items-start justify-between gap-2 p-4">
                  <div>
                    <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 text-[10px] font-bold">
                      {h.level || "Hifz"}
                    </Badge>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white pt-1.5">
                      {h.name}
                    </CardTitle>
                  </div>

                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => handleDeleteHalqa(h.id, h.name)}
                    className="text-rose-500 hover:bg-rose-500/10 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>

                <CardContent className="space-y-3 p-4 pt-0 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-1.5 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Maître Référent :</span>
                      <span className="font-bold text-slate-900 dark:text-white">{h.oustazName || "Non assigné"}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-1.5">
                      <span className="text-slate-500 font-medium">Effectif Talibés :</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">{h._count?.talibes || h.talibes?.length || 0} Talibé(s)</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedHalqaId(h.id);
                      setActiveTab("register");
                    }}
                    size="sm"
                    className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-700 hover:text-white text-slate-800 dark:text-slate-200 text-xs font-bold gap-2 rounded-lg transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Ouvrir le Registre Word/Excel
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

    </div>
  );
}
