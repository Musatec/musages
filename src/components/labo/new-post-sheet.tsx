"use client";

import { useState, useEffect } from "react";
import type { Database } from "@/types/supabase";

type Post = Database['public']['Tables']['posts']['Row'];
import {
    Plus,
    Loader2,
    Save,
    Calendar,
    Youtube,
    Instagram,
    Twitter,
    Linkedin,
    Facebook,
    Globe,
    Mail,
    Smartphone
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger
} from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PLATFORMS = [
    { name: "Youtube", icon: Youtube },
    { name: "Instagram", icon: Instagram },
    { name: "Tiktok", icon: Smartphone },
    { name: "Linkedin", icon: Linkedin },
    { name: "X / Twitter", icon: Twitter },
    { name: "Facebook", icon: Facebook },
    { name: "Blog", icon: Globe },
    { name: "Newsletter", icon: Mail },
];

export function NewPostSheet({ onSuccess, post, open, onOpenChange }: { onSuccess?: () => void, post?: Post | null, open?: boolean, onOpenChange?: (open: boolean) => void }) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = open !== undefined ? open : internalOpen;
    const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: post?.title || "",
        platform: post?.platform || "Youtube",
        content: post?.content || "",
        scheduled_date: post?.scheduled_date ? new Date(post.scheduled_date).toISOString().split('T')[0] : ""
    });

    // Update form when post changes
    useEffect(() => {
        if (post) {
            setFormData({
                title: post.title,
                platform: post.platform,
                content: post.content || "",
                scheduled_date: post.scheduled_date ? new Date(post.scheduled_date).toISOString().split('T')[0] : ""
            });
        } else {
            setFormData({ title: "", platform: "Youtube", content: "", scheduled_date: "" });
        }
    }, [post]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Utilisateur non connecté !");
                return;
            }

            if (post) {
                // UPDATE
                const { error } = await supabase.from('posts').update({
                    title: formData.title,
                    platform: formData.platform,
                    content: formData.content,
                    scheduled_date: formData.scheduled_date || null,
                    // updated_at is handled by DB ideally, but we can add it if needed
                }).eq('id', post.id);

                if (error) throw error;
                toast.success("Projet mis à jour !");
            } else {
                // INSERT
                const { error } = await supabase.from('posts').insert({
                    title: formData.title,
                    platform: formData.platform,
                    content: formData.content,
                    scheduled_date: formData.scheduled_date || null,
                    status: "idea",
                    user_id: user.id
                });

                if (error) throw error;
                toast.success("Idée ajoutée au labo !");
            }

            setIsOpen(false);
            if (!post) setFormData({ title: "", platform: "Youtube", content: "", scheduled_date: "" });
            if (onSuccess) onSuccess();

        } catch (error) {
            toast.error("Erreur: " + (error instanceof Error ? error.message : "Erreur inconnue"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <button className="relative group overflow-hidden bg-[#F97316] text-white font-bold h-11 px-6 rounded-xl hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Nouveau Projet</span>
                </button>
            </SheetTrigger>

            <SheetContent side="right" className="w-full sm:w-[540px] border-l border-white/5 bg-[#050505] p-0 flex flex-col h-full shadow-2xl selection:bg-orange-500/30">
                {/* Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-50" />

                <div className="p-8 border-b border-white/5 bg-white/[0.02] backdrop-blur-md relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 blur-[80px] rounded-full" />

                    <div className="relative z-10">
                        <SheetHeader>
                            <SheetTitle className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                    <Plus className="w-5 h-5 text-orange-500" />
                                </div>
                                Lancer une Idée
                            </SheetTitle>
                            <SheetDescription className="text-gray-500 text-sm mt-2">
                                Définissez les bases de votre prochain contenu.
                            </SheetDescription>
                        </SheetHeader>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">

                    {/* Title Input */}
                    <div className="space-y-3 group">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-orange-500 transition-colors">Titre du Projet</label>
                        <input
                            autoFocus
                            type="text"
                            required
                            placeholder="Ex: Les secrets de la productivité..."
                            className="w-full bg-[#111] border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-orange-500/30 focus:shadow-[0_0_20px_rgba(249,115,22,0.05)] outline-none text-xl font-medium transition-all placeholder:text-gray-700"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {/* Platform Selector */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Destination</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {PLATFORMS.map(p => (
                                <button
                                    key={p.name}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, platform: p.name })}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all duration-300",
                                        formData.platform === p.name
                                            ? "bg-white text-black border-white shadow-xl scale-105"
                                            : "bg-[#111] text-gray-500 border-white/5 hover:border-white/10 hover:text-gray-300"
                                    )}
                                >
                                    <p.icon className={cn("w-5 h-5", formData.platform === p.name ? "text-orange-600" : "text-gray-600")} />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">{p.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content / Notes */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Notes & Structure</label>
                        <textarea
                            rows={6}
                            className="w-full bg-[#111] border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-orange-500/30 outline-none resize-none leading-relaxed text-sm placeholder:text-gray-700 transition-all"
                            placeholder="Points clés, hook, structure du script..."
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>

                    {/* Due Date */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Objectif Publication</label>
                        <div className="relative group">
                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="date"
                                className="w-full bg-[#111] border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-white focus:border-orange-500/30 outline-none transition-all appearance-none"
                                value={formData.scheduled_date}
                                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                            />
                        </div>
                    </div>

                </form>

                <div className="p-8 border-t border-white/5 bg-[#080808]/80 backdrop-blur-xl">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !formData.title}
                        className="w-full bg-white text-black font-bold h-14 rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3 disabled:opacity-20 shadow-xl shadow-black/20 group active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>
                                <Save className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" />
                                <span className="uppercase tracking-widest text-sm">Sauvegarder dans le Labo</span>
                            </>
                        )}
                    </button>
                </div>

            </SheetContent>
        </Sheet>
    );
}
