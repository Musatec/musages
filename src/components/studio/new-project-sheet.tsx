"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import { Plus, Loader2, Save, Calendar, Image as ImageIcon, X } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger
} from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase";

const PROJECT_CATEGORIES = [
    { id: "dev", label: "Développement" },
    { id: "writing", label: "Écriture / Blog" },
    { id: "design", label: "Design / Graphisme" },
    { id: "video", label: "Vidéo / Montage" },
    { id: "learning", label: "Formation / Recherche" },
    { id: "personal", label: "Personnel" },
];

export function NewProjectSheet() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // État du formulaire
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "dev",
        due_date: "",
        image_url: ""
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `project-covers/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL
            const { data } = supabase.storage.from('images').getPublicUrl(filePath);

            if (data) {
                setFormData({ ...formData, image_url: data.publicUrl });
                setPreviewUrl(data.publicUrl);
            }

        } catch {
            alert('Error uploading image!');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setFormData({ ...formData, image_url: "" });
        setPreviewUrl(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert("Tu dois être connecté !");
                setLoading(false);
                return;
            }

            const { error } = await supabase
                .from('projects')
                .insert({
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
                    user_id: user.id,
                    progress: 0,
                    status: 'idee',
                    image_url: formData.image_url || null
                });

            if (error) throw error;

            setIsOpen(false);
            setFormData({
                title: "",
                description: "",
                category: "dev",
                due_date: "",
                image_url: ""
            });
            setPreviewUrl(null);

            router.push('/studio');
            router.refresh();

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Error saving project:', error);
            alert("Erreur détaillée : " + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <button className="bg-primary text-black font-bold px-5 py-3 rounded-xl hover:bg-orange-400 transition flex items-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                    <Plus className="h-5 w-5" />
                    <span>Nouveau Projet</span>
                </button>
            </SheetTrigger>

            <SheetContent side="right" className="w-full sm:w-[540px] border-l border-white/10 bg-[#0B101B]/95 backdrop-blur-xl p-0 flex flex-col h-full">

                <div className="p-6 pb-2 border-b border-white/5">
                    <SheetHeader>
                        <SheetTitle className="text-2xl font-bold text-white">Lancer un Projet</SheetTitle>
                        <SheetDescription className="text-muted-foreground">
                            Démarre une nouvelle aventure avec style.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    <form id="project-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* Image Upload - Visuel fort dès le début */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-300">Image de couverture</label>

                            {previewUrl ? (
                                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10 group">
                                    <Image src={previewUrl} alt="Cover" className="w-full h-full object-cover" width={500} height={300} unoptimized />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/80 p-2 rounded-full text-white transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        disabled={uploading}
                                    />
                                    <div className={`w-full h-32 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 bg-white/5 transition-colors ${uploading ? 'opacity-50' : 'hover:bg-white/10 hover:border-primary/30'}`}>
                                        {uploading ? (
                                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                        ) : (
                                            <>
                                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">Clique pour ajouter une image</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Nom du Projet <span className="text-primary">*</span></label>
                            <input
                                required
                                type="text"
                                placeholder="Ex: Écrire mon Livre - Chapitre 1"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Domaine</label>
                            <div className="grid grid-cols-2 gap-2">
                                {PROJECT_CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, category: cat.id })}
                                        className={`px-3 py-2 rounded-lg text-sm text-left transition-all ${formData.category === cat.id
                                            ? "bg-primary text-black font-bold shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                                            : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                            }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Description / Objectif</label>
                            <textarea
                                rows={4}
                                placeholder="Quel est le but de ce projet ?"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Date limite (Optionnel)</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="date"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition [color-scheme:dark]"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                />
                            </div>
                        </div>

                    </form>
                </div>

                <div className="p-6 border-t border-white/5 bg-[#0B101B]/95 backdrop-blur-xl">
                    <button
                        form="project-form"
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full bg-white text-black font-bold text-lg h-14 rounded-xl hover:bg-gray-200 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/5"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Création...
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5" />
                                Créer le Projet
                            </>
                        )}
                    </button>
                </div>

            </SheetContent>
        </Sheet>
    );
}
