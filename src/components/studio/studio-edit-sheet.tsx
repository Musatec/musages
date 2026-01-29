"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Project, CategoryId } from "@/types/studio";
import { CATEGORIES } from "./constants";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Loader2, Image as ImageIcon, Trash2, Upload, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { optimizeImage } from "@/lib/image-optimizer";

interface StudioEditSheetProps {
    project: Project | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: () => void;
}

export function StudioEditSheet({ project, open, onOpenChange, onUpdate }: StudioEditSheetProps) {
    const t = useTranslations("Studio");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<CategoryId>("idea");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isPublic, setIsPublic] = useState(false);

    // Image handling
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);

    // Sync state when project changes
    useEffect(() => {
        if (project) {
            setTitle(project.title);
            setDescription(project.description || "");
            setCategory(project.category as CategoryId);
            setImageUrl(project.image_url);
            setIsPublic(project.is_public || false);
            setImageFile(null);
        }
    }, [project]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project) return;
        setLoading(true);

        try {
            let finalImageUrl = imageUrl;

            // Handle Image Upload
            if (imageFile) {
                // Optimize
                const optimizedFile = await optimizeImage(imageFile);
                const fileExt = "jpg";
                const fileName = `${Math.random()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('project-images')
                    .upload(fileName, optimizedFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage.from('project-images').getPublicUrl(fileName);
                finalImageUrl = publicUrl;
            }

            const { error } = await supabase
                .from('projects')
                .update({
                    title,
                    description,
                    category,
                    image_url: finalImageUrl,
                    is_public: isPublic
                })
                .eq('id', project.id);

            if (error) throw error;

            toast.success(t('save_success'));
            onUpdate(); // Trigger refresh
            onOpenChange(false); // Close sheet
        } catch (error) {
            console.error("Erreur update:", error);
            toast.error(t('save_error_toast'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl bg-background border-l border-border shadow-2xl overflow-y-auto w-full">
                {/* Ambient Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none rounded-full" />

                <SheetHeader className="mb-10 pl-1 relative z-10">
                    <SheetTitle className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <span className="w-2 h-8 bg-primary rounded-full inline-block" />
                        {t('edit_title')}
                    </SheetTitle>
                    <SheetDescription className="text-muted-foreground text-base font-light pl-5">
                        {t('edit_desc')}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    {/* Categories */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-primary uppercase tracking-widest pl-1">{t('content_type')}</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategory(cat.id)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                                        category === cat.id
                                            ? cn("bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105")
                                            : "bg-muted text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                                    )}
                                >
                                    <cat.icon className={cn("w-3.5 h-3.5", category === cat.id ? "text-primary-foreground" : "opacity-50")} />
                                    {t('category_' + cat.id)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-primary uppercase tracking-widest pl-1">{t('image_cover')}</label>

                        <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-2xl border border-border">
                            {/* Preview */}
                            <div className="relative w-24 h-24 shrink-0 bg-background/40 rounded-xl overflow-hidden border border-border group">
                                {imageUrl ? (
                                    <>
                                        <Image src={imageUrl} alt="Cover" className="w-full h-full object-cover" width={100} height={100} unoptimized />
                                        <button
                                            type="button"
                                            onClick={() => { setImageUrl(null); setImageFile(null); }}
                                            className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-foreground"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex-1 space-y-3">
                                <p className="text-sm text-muted-foreground font-light">
                                    Une image vaut mille mots. Ajoutez une capture pour illustrer votre découverte.
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setImageFile(file);
                                                setImageUrl(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 bg-accent/10 hover:bg-accent/20 text-foreground text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 border border-border"
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        {imageUrl ? "Changer l'image" : "Ajouter une image"}
                                    </button>
                                    {imageUrl && (
                                        <button
                                            type="button"
                                            onClick={() => { setImageUrl(null); setImageFile(null); }}
                                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold rounded-lg transition-colors border border-red-500/10"
                                        >
                                            Supprimer
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Title */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-primary uppercase tracking-widest pl-1">Titre</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-muted border border-border rounded-2xl p-5 text-foreground focus:border-primary focus:bg-muted/80 outline-none transition-all text-lg font-medium placeholder:text-muted-foreground shadow-inner"
                            placeholder={t('title_placeholder')}
                        />
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-primary uppercase tracking-widest pl-1">Contenu</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={10}
                            className="w-full bg-muted border border-border rounded-2xl p-5 text-muted-foreground focus:border-primary focus:bg-muted/80 outline-none transition-all resize-none leading-relaxed placeholder:text-muted-foreground/50 font-light shadow-inner text-sm scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                            placeholder={t('content_placeholder')}
                        />
                    </div>

                    {/* Visibility */}
                    <div className="p-6 bg-primary/5 border border-primary/20 rounded-[2rem] flex items-center justify-between group/visibility">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover/visibility:scale-110 transition-transform">
                                <Globe className="w-6 h-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-foreground tracking-tight">{t('share_community')}</p>
                                <p className="text-[10px] text-muted-foreground max-w-[200px] leading-relaxed italic">
                                    {t('share_desc')}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsPublic(!isPublic)}
                            className={cn(
                                "w-14 h-7 rounded-full relative transition-all duration-300",
                                isPublic ? "bg-primary shadow-[0_0_15px_rgba(249,115,22,0.3)]" : "bg-muted"
                            )}
                        >
                            <div className={cn(
                                "absolute top-1 w-5 h-5 bg-foreground rounded-full transition-all duration-300 shadow-sm",
                                isPublic ? "left-8" : "left-1"
                            )} />
                        </button>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-8 flex items-center justify-end gap-4 border-t border-border mt-auto pb-4">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="px-6 py-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 hover:shadow-primary/20 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save')}
                        </button>
                    </div>
                </form>
            </SheetContent>
        </Sheet >
    );
}
