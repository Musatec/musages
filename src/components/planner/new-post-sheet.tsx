"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Loader2, Calendar as CalIcon, Image as ImageIcon, X } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger
} from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase";

const PLATFORMS = [
    { id: "linkedin", label: "LinkedIn", color: "bg-[#0077b5]" },
    { id: "twitter", label: "Twitter / X", color: "bg-black border border-white/20" },
    { id: "instagram", label: "Instagram", color: "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500" },
    { id: "facebook", label: "Facebook", color: "bg-[#1877F2]" },
    { id: "tiktok", label: "TikTok", color: "bg-black border border-white/20" },
];

export function NewPostSheet({ onSuccess }: { onSuccess?: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        content: "",
        platform: "linkedin",
        scheduled_date: "", // format YYYY-MM-DDTHH:mm
        image_url: ""
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) return;

            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `post-${Math.random()}.${fileExt}`;
            const filePath = `posts/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

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
                alert("Connecte-toi d'abord !");
                return;
            }

            const { error } = await supabase
                .from('posts')
                .insert({
                    content: formData.content,
                    platform: formData.platform,
                    scheduled_date: formData.scheduled_date ? new Date(formData.scheduled_date).toISOString() : null,
                    status: 'scheduled',
                    image_url: formData.image_url || null,
                    user_id: user.id
                });

            if (error) throw error;

            setIsOpen(false);
            setFormData({
                content: "",
                platform: "linkedin",
                scheduled_date: "",
                image_url: ""
            });
            setPreviewUrl(null);
            if (onSuccess) onSuccess();

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Error saving post:', error);
            alert("Erreur: " + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <button className="bg-primary text-black font-bold px-5 py-3 rounded-xl hover:bg-orange-400 transition flex items-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                    <Plus className="h-5 w-5" />
                    <span>Nouveau Post</span>
                </button>
            </SheetTrigger>

            <SheetContent side="right" className="w-full sm:w-[540px] border-l border-white/10 bg-[#0B101B]/95 backdrop-blur-xl p-0 flex flex-col h-full">
                <div className="p-6 pb-2 border-b border-white/5">
                    <SheetHeader>
                        <SheetTitle className="text-2xl font-bold text-white">Planifier un Post</SheetTitle>
                        <SheetDescription className="text-muted-foreground">
                            Rédige ton contenu et choisis quand le publier.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    <form id="post-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* Plateforme */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Réseau Social</label>
                            <div className="flex gap-2 flex-wrap">
                                {PLATFORMS.map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, platform: p.id })}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${formData.platform === p.id
                                            ? "bg-white text-black ring-2 ring-primary ring-offset-2 ring-offset-[#0B101B]"
                                            : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${p.color}`} />
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Contenu</label>
                            <textarea
                                required
                                rows={6}
                                placeholder="Quoi de neuf aujourd'hui ?"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition resize-none"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            />
                            <p className="text-xs text-right text-muted-foreground">{formData.content.length} caractères</p>
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Média (Image/Visuel)</label>
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
                                    <div className={`w-full h-24 border border-dashed border-white/20 rounded-xl flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 transition-colors`}>
                                        {uploading ? <Loader2 className="animate-spin" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
                                        <span className="text-sm text-muted-foreground">Ajouter une image</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Date de publication</label>
                            <div className="relative">
                                <CalIcon className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="datetime-local"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-primary/50 outline-none transition [color-scheme:dark]"
                                    value={formData.scheduled_date}
                                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                                />
                            </div>
                        </div>

                    </form>
                </div>

                <div className="p-6 border-t border-white/5 bg-[#0B101B]/95 backdrop-blur-xl">
                    <button
                        form="post-form"
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full bg-white text-black font-bold text-lg h-14 rounded-xl hover:bg-gray-200 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/5"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Planification...
                            </>
                        ) : (
                            <>
                                <CalIcon className="h-5 w-5" />
                                Planifier le Post
                            </>
                        )}
                    </button>
                </div>

            </SheetContent>
        </Sheet>
    );
}
