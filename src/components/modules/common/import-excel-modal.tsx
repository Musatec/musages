"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, Loader2, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { bulkImportStudents } from "@/lib/actions/students";
import { bulkImportTeachers } from "@/lib/actions/teachers";
import { useSpace } from "@/components/providers/space-provider";

interface ImportExcelModalProps {
  type: "students" | "teachers";
  onSuccess?: () => void;
}

export function ImportExcelModal({ type, onSuccess }: ImportExcelModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const { activeSpace } = useSpace();
  const isSchool = activeSpace === "school";

  const isStudents = type === "students";
  const title = isStudents
    ? isSchool
      ? "Importer des Élèves (Excel / CSV)"
      : "Importer des Talibés (Excel / CSV)"
    : isSchool
    ? "Importer des Enseignants (Excel / CSV)"
    : "Importer des Oustazs (Excel / CSV)";

  const downloadTemplate = async () => {
    const XLSX = await import("xlsx");
    let templateData: any[] = [];

    if (isStudents) {
      templateData = [
        {
          "Prenom": "Moussa",
          "Nom": "Diallo",
          "Genre (M/F)": "M",
          "Statut (INTERNE/EXTERNE/DEMI_PENSION)": isSchool ? "EXTERNE" : "INTERNE",
          "Nom_Parent": "Amadou Diallo",
          "Telephone_Parent": "771234567",
          "Email_Parent": "parent@exemple.com",
          "Notes_Sante": "Néant"
        },
        {
          "Prenom": "Fatou",
          "Nom": "Ndiaye",
          "Genre (M/F)": "F",
          "Statut (INTERNE/EXTERNE/DEMI_PENSION)": "EXTERNE",
          "Nom_Parent": "Marieme Fall",
          "Telephone_Parent": "781234567",
          "Email_Parent": "",
          "Notes_Sante": "Allergie aux arachides"
        }
      ];
    } else {
      templateData = [
        {
          "Prenom": isSchool ? "Ibrahima" : "Oustaz Cheikh",
          "Nom": "Sow",
          "Telephone": "778901234",
          "Email": "prof@exemple.com",
          "Matiere": isSchool ? "Mathématiques" : "Coran & Tajweed",
          "Contrat": "PERMANENT"
        }
      ];
    }

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modele_Import");
    XLSX.writeFile(
      wb,
      `modele_import_${isStudents ? (isSchool ? "eleves" : "talibes") : (isSchool ? "enseignants" : "oustazs")}.xlsx`
    );
    toast.success("Modèle Excel téléchargé ! Remplissez-le et réimportez-le.");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const XLSX = await import("xlsx");
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          setPreview(data);
          toast.info(`${data.length} ligne(s) détectée(s) dans le fichier.`);
        } catch {
          toast.error("Impossible de lire ce fichier Excel.");
        }
      };
      reader.readAsBinaryString(file);
    } catch {
      toast.error("Erreur lors de la lecture du fichier.");
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) {
      toast.error("Veuillez d'abord sélectionner un fichier avec des données.");
      return;
    }

    setLoading(true);

    try {
      if (isStudents) {
        const mapped = preview.map((row: any) => {
          const getVal = (...keys: string[]) => {
            const found = Object.keys(row).find((k) =>
              keys.some((cand) => k.toLowerCase().replace(/[^a-z]/g, "") === cand.toLowerCase().replace(/[^a-z]/g, ""))
            );
            return found ? String(row[found] || "").trim() : "";
          };

          return {
            firstName: getVal("prenom", "firstname", "first_name"),
            lastName: getVal("nom", "lastname", "last_name"),
            gender: getVal("genre", "sexe", "gender")?.toUpperCase() === "F" ? "F" : "M",
            status: (getVal("statut", "status")?.toUpperCase() as any) || (isSchool ? "EXTERNE" : "INTERNE"),
            parentName: getVal("nomparent", "parentname", "parent_name"),
            parentPhone: getVal("telephoneparent", "parentphone", "telephone", "phone"),
            parentEmail: getVal("emailparent", "parentemail", "email"),
            healthNotes: getVal("notessante", "sante", "healthnotes"),
          };
        });

        const res = await bulkImportStudents(mapped);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(`${res.importedCount} ${isSchool ? "élève(s)" : "talibé(s)"} importé(s) avec succès ! 🎉`);
          if (res.errorsCount && res.errorsCount > 0) {
            toast.warning(`${res.errorsCount} ligne(s) ont été ignorées car incomplètes.`);
          }
          setOpen(false);
          setPreview([]);
          if (onSuccess) onSuccess();
        }
      } else {
        const mapped = preview.map((row: any) => {
          const getVal = (...keys: string[]) => {
            const found = Object.keys(row).find((k) =>
              keys.some((cand) => k.toLowerCase().replace(/[^a-z]/g, "") === cand.toLowerCase().replace(/[^a-z]/g, ""))
            );
            return found ? String(row[found] || "").trim() : "";
          };

          return {
            firstName: getVal("prenom", "firstname"),
            lastName: getVal("nom", "lastname"),
            phone: getVal("telephone", "phone", "tel"),
            email: getVal("email", "mail"),
            mainSubject: getVal("matiere", "specialite", "discipline"),
            contractType: getVal("contrat", "contracttype"),
          };
        });

        const res = await bulkImportTeachers(mapped);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(`${res.importedCount} enseignant(s) importé(s) avec succès ! 🎉`);
          setOpen(false);
          setPreview([]);
          if (onSuccess) onSuccess();
        }
      }
    } catch {
      toast.error("Une erreur est survenue pendant l'importation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-xs font-bold gap-1.5 h-9 px-3">
          <Upload className="w-3.5 h-3.5 text-blue-600" />
          <span>Importer Excel</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Étape 1 : Téléchargement du modèle */}
          <div className="p-3 bg-muted/50 rounded-xl border border-border text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">1. Télécharger le modèle prêt à remplir</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={downloadTemplate}
                className="h-8 text-xs font-bold gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Modèle Excel</span>
              </Button>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Téléchargez le modèle type, copiez-collez vos listes, puis déposez le fichier ci-dessous.
            </p>
          </div>

          {/* Étape 2 : Dépôt du fichier */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted-foreground">
              2. Sélectionner votre fichier (.xlsx ou .csv)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="w-full text-xs file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer border border-border rounded-xl p-1 bg-background"
            />
          </div>

          {/* Prévisualisation */}
          {preview.length > 0 && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs space-y-1 text-emerald-900 dark:text-emerald-200">
              <p className="font-bold">✓ Fichier prêt : {preview.length} enregistrement(s) trouvé(s).</p>
              <p className="text-[11px] opacity-80">
                Cliquez sur « Lancer l&apos;importation » pour ajouter directement les lignes à l&apos;espace {isSchool ? "École Pathé Pogne" : "Daara Ibnoul Khayim"}.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen(false);
                setPreview([]);
              }}
              disabled={loading}
              className="text-xs"
            >
              Annuler
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleImport}
              disabled={loading || preview.length === 0}
              className="text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Importation en cours...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Lancer l&apos;importation ({preview.length})</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
