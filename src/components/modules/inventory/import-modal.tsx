
"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, X, Plus } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { bulkCreateProducts } from "@/lib/actions/inventory";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ImportModal() {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [preview, setPreview] = useState<any[]>([]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            setPreview(data);
            toast.info(`${data.length} lignes détectées.`);
        };
        reader.readAsBinaryString(file);
    };

    const handleImport = async () => {
        if (preview.length === 0) return;
        setLoading(true);

        // Mapping des colonnes (flexibilité sur les noms de colonnes)
        const mappedProducts = preview.map(row => ({
            name: row.Nom || row.name || row.Désignation || "Produit sans nom",
            price: Number(row.Prix || row.price || row.PV || 0),
            costPrice: Number(row.Achat || row.costPrice || row.PA || 0),
            stock: Number(row.Stock || row.quantity || row.Quantité || 0),
            minStock: Number(row.Alerte || row.minStock || 5),
            sku: row.SKU || row.Référence || "",
            category: row.Catégorie || row.category || "Standard"
        }));

        const result = await bulkCreateProducts(mappedProducts);

        if (result.success) {
            toast.success(`${result.count} produits importés avec succès !`);
            setOpen(false);
            setPreview([]);
            window.location.reload(); // Recharger pour voir les nouveaux produits
        } else {
            toast.error(result.error);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="bg-muted/50 text-foreground border border-border h-10 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-muted transition-all active:scale-95 shadow-sm">
                    <Upload className="w-4 h-4" /> Importer
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl bg-card border border-border p-8 rounded-3xl shadow-2xl">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                        <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
                        Importation Massive
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                        Téléchargez votre fichier Excel (.xlsx) ou CSV. Votre fichier doit contenir les colonnes : 
                        <span className="font-bold text-foreground"> Nom, Prix, Achat, Stock</span>.
                    </p>
                </DialogHeader>

                <div className="space-y-6">
                    {preview.length === 0 ? (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors mb-4" />
                                <p className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors">Cliquez pour choisir un fichier</p>
                                <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-widest font-black">Excel ou CSV uniquement</p>
                            </div>
                            <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
                        </label>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <div>
                                        <p className="text-sm font-bold text-emerald-500">{preview.length} produits prêts à l'import</p>
                                        <p className="text-[10px] text-emerald-500/60 uppercase font-black">Données lues avec succès</p>
                                    </div>
                                </div>
                                <button onClick={() => setPreview([])} className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors">
                                    <X className="w-4 h-4 text-emerald-500" />
                                </button>
                            </div>

                            <div className="max-h-48 overflow-y-auto border border-border rounded-xl bg-muted/20">
                                <table className="w-full text-[10px] text-left border-collapse">
                                    <thead className="bg-muted/50 sticky top-0 font-black uppercase text-muted-foreground/60">
                                        <tr>
                                            <th className="px-4 py-2 border-b border-border">Produit</th>
                                            <th className="px-4 py-2 border-b border-border">Prix</th>
                                            <th className="px-4 py-2 border-b border-border">Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {preview.slice(0, 10).map((row, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-2 font-bold truncate max-w-[200px]">{row.Nom || row.name || row.Désignation}</td>
                                                <td className="px-4 py-2 font-mono">{row.Prix || row.price || row.PV} F</td>
                                                <td className="px-4 py-2 text-primary">{row.Stock || row.quantity || row.Quantité}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {preview.length > 10 && (
                                    <p className="p-3 text-[9px] text-center text-muted-foreground italic">Et {preview.length - 10} autres produits...</p>
                                )}
                            </div>

                            <button 
                                onClick={handleImport}
                                disabled={loading}
                                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                Lancer l'importation de {preview.length} articles
                            </button>
                        </div>
                    )}

                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                        <p className="text-[11px] text-amber-500/80 font-medium leading-relaxed">
                            Attention : L'importation créera de nouveaux produits. Si un produit avec le même nom existe déjà, il sera dupliqué. Vérifiez votre fichier avant de valider.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
