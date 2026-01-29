"use client";

import { useState } from "react";
import { Plus, Loader2, Save } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger
} from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase";

// Catégories disponibles
const CATEGORIES = [
    { id: "ai", label: "Intelligence Artificielle" },
    { id: "prompts", label: "Prompts" },
    { id: "dev", label: "Dev Tools" },
    { id: "design", label: "Design" },
    { id: "inspiration", label: "Inspiration" },
];

export function NewResourceSheet() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // État du formulaire
    const [formData, setFormData] = useState({
        title: "",
        url: "",
        category: "ai",
        description: "",
        tags: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert("Tu dois être connecté pour sauvegarder !"); // Simple fallback for now
                setLoading(false);
                return;
            }

            // 2. Insert data
            const { error } = await supabase
                .from('resources')
                .insert({
                    title: formData.title,
                    url: formData.url,
                    category: formData.category,
                    description: formData.description,
                    tags: formData.tags.split(',').map(tag => tag.trim()).filter(t => t.length > 0),
                    user_id: user.id
                });

            if (error) throw error;

            // Success
            setIsOpen(false);
            setFormData({
                title: "",
                url: "",
                category: "ai",
                description: "",
                tags: ""
            });

            // Optional: Refresh page data (we will implement a refresh trigger later)
            window.location.reload();

        } catch (error) {
            console.error('Error saving resource:', error);
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <button className="bg-primary text-black font-bold px-5 py-3 rounded-xl hover:bg-orange-400 transition flex items-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                    <Plus className="h-5 w-5" />
                    <span>Nouvelle trouvaille</span>
                </button>
            </SheetTrigger>

            <SheetContent side="right" className="w-full sm:w-[540px] border-l border-white/10 bg-[#0B101B]/95 backdrop-blur-xl p-0 flex flex-col h-full">

                {/* Header Fixe */}
                <div className="p-6 pb-2 border-b border-white/5">
                    <SheetHeader>
                        <SheetTitle className="text-2xl font-bold text-white">Ajouter une Découverte</SheetTitle>
                        <SheetDescription className="text-muted-foreground">
                            Capture une nouvelle idée, un outil ou un prompt.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                {/* Contenu Défilant */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    <form id="resource-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* Titre */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Titre <span className="text-primary">*</span></label>
                            <input
                                required
                                type="text"
                                placeholder="Ex: Midjourney v6"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        {/* URL */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Lien (URL)</label>
                            <input
                                type="url"
                                placeholder="https://..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            />
                        </div>

                        {/* Catégorie */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Catégorie</label>
                            <div className="grid grid-cols-2 gap-2">
                                {CATEGORIES.map(cat => (
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

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Notes / Description</label>
                            <textarea
                                rows={4}
                                placeholder="Pourquoi c'est intéressant ? Comment l'utiliser ?"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Tags (séparés par virgule)</label>
                            <input
                                type="text"
                                placeholder="IA, Design, Futur..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            />
                        </div>
                    </form>
                </div>

                {/* Footer Fixe avec le bouton */}
                <div className="p-6 border-t border-white/5 bg-[#0B101B]/95 backdrop-blur-xl">
                    <button
                        form="resource-form"
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-bold text-lg h-14 rounded-xl hover:bg-gray-200 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/5"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Sauvegarde...
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5" />
                                Enregistrer la découverte
                            </>
                        )}
                    </button>
                </div>

            </SheetContent>
        </Sheet>
    );
}
