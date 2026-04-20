
"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/lib/storage";
import { toast } from "sonner";
import { SafeImage } from "./safe-image";
import imageCompression from "browser-image-compression";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation simple
        if (!file.type.startsWith("image/")) {
            toast.error("Veuillez sélectionner une image valide.");
            return;
        }

        setLoading(true);
        try {
            // --- COMPRESSION LOGIC ---
            const options = {
                maxSizeMB: 0.3, // Compresser à ~300Ko max
                maxWidthOrHeight: 800, // Taille idéale pour le POS
                useWebWorker: true,
            };
            
            const compressedFile = await imageCompression(file, options);
            
            const res = await uploadImage(compressedFile);
            if (res.success && res.url) {
                onChange(res.url);
                toast.success("Image optimisée et envoyée !");
            } else {
                toast.error(res.error || "Erreur lors du téléchargement");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'optimisation.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("space-y-4 w-full", className)}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* UPLOAD BOX */}
                <div 
                    onClick={() => !loading && fileInputRef.current?.click()}
                    className={cn(
                        "relative w-24 h-24 rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all overflow-hidden group shrink-0",
                        loading && "opacity-50 cursor-not-allowed",
                        value && "border-solid border-primary/20"
                    )}
                >
                    {value ? (
                        <SafeImage src={value} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <>
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            ) : (
                                <>
                                    <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <span className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">Photo</span>
                                </>
                            )}
                        </>
                    )}
                    
                    {value && !loading && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                    )}
                </div>

                {/* URL INPUT & CONTROLS */}
                <div className="flex-1 w-full space-y-2">
                    <div className="relative group">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="OU COLLEZ UN LIEN D'IMAGE ICI..."
                            className="w-full pl-10 pr-4 py-3 bg-muted/20 border border-border/50 rounded-xl text-[10px] font-black uppercase tracking-widest focus:border-primary/30 outline-none transition-all"
                        />
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-50">
                            {loading ? "TRAITEMENT EN COURS..." : "PNG, JPG OU LIEN WEB"}
                        </p>
                        {value && (
                            <button 
                                type="button"
                                onClick={() => onChange("")}
                                className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                            >
                                EFFACER TOUT
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <input 
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                accept="image/*"
                className="hidden"
            />
        </div>
    );
}
