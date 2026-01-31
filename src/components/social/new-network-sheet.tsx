"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, Save, Target, Globe, User, Lock, AlertCircle } from "lucide-react";
import {
    SiInstagram,
    SiYoutube,
    SiTiktok,
    SiLinkedin,
    SiFacebook,
    SiX,
    SiPinterest,
    SiBehance,
    SiDribbble,
    SiTwitch
} from "react-icons/si";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger
} from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type SocialGroup = Database['public']['Tables']['social_groups']['Row'];
type SocialProfile = Database['public']['Tables']['social_profiles']['Row'];

const NETWORKS = [
    { id: "Linkedin", label: "LinkedIn", icon: SiLinkedin },
    { id: "X / Twitter", label: "X / Twitter", icon: SiX },
    { id: "Instagram", label: "Instagram", icon: SiInstagram },
    { id: "Facebook", label: "Facebook", icon: SiFacebook },
    { id: "Pinterest", label: "Pinterest", icon: SiPinterest },
    { id: "Behance", label: "Behance", icon: SiBehance },
    { id: "Dribbble", label: "Dribbble", icon: SiDribbble },
    { id: "Twitch", label: "Twitch", icon: SiTwitch },
    { id: "Youtube", label: "YouTube", icon: SiYoutube },
    { id: "Tiktok", label: "TikTok", icon: SiTiktok },
    { id: "Website", label: "Website", icon: Globe },
];

export function NewNetworkSheet({ onSuccess, profileToEdit, trigger }: { onSuccess?: () => void, profileToEdit?: SocialProfile, trigger?: React.ReactNode }) {
    const t = useTranslations("Growth");
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState<SocialGroup[]>([]);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");

    const [formData, setFormData] = useState({
        platform: "Instagram",
        url: "",
        bio: "",
        goal: "",
        group_id: "",
        username: "",
        password: "",
        status: "Actif",
        tags: ""
    });

    const [brandMeta, setBrandMeta] = useState({
        banner_url: "",
        website_url: ""
    });

    const resetForm = useCallback(() => {
        setFormData({
            platform: "Instagram",
            url: "",
            bio: "",
            goal: "",
            group_id: groups[0]?.id || "",
            username: "",
            password: "",
            status: "Actif",
            tags: ""
        });
    }, [groups]);

    const fetchGroups = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('social_groups')
                .select('*')
                .eq('user_id', user.id);

            if (error) throw error;
            if (data) {
                setGroups(data);
                if (data.length > 0 && !formData.group_id && !profileToEdit) {
                    setFormData(prev => ({ ...prev, group_id: data[0].id }));
                }
            }
        } catch (error) {
            console.error("Fetch Groups Error:", error);
        }
    }, [formData.group_id, profileToEdit]);

    useEffect(() => {
        if (isOpen) {
            fetchGroups();
            if (profileToEdit) {
                setFormData({
                    platform: profileToEdit.platform,
                    url: profileToEdit.url || "",
                    bio: profileToEdit.bio || "",
                    goal: profileToEdit.goal || "",
                    group_id: profileToEdit.group_id || "",
                    username: profileToEdit.username || "",
                    password: profileToEdit.password || "",
                    status: (profileToEdit as SocialProfile & { status: string }).status || "Actif",
                    tags: Array.isArray((profileToEdit as SocialProfile & { tags: string[] }).tags) ? (profileToEdit as SocialProfile & { tags: string[] }).tags.join(", ") : ""
                });
            }
        } else {
            if (!profileToEdit) resetForm();
        }
    }, [isOpen, profileToEdit, fetchGroups, resetForm]);

    const createGroup = async () => {
        if (!newGroupName.trim()) return;
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Non connecté");

            const payload = {
                name: newGroupName,
                user_id: user.id,
                banner_url: brandMeta.banner_url || null,
                website_url: brandMeta.website_url || null
            };

            const { data, error } = await supabase.from('social_groups').insert(payload).select().single();

            if (error) throw error;

            if (data) {
                setGroups([...groups, data]);
                setFormData(prev => ({ ...prev, group_id: data.id }));
                setNewGroupName("");
                setBrandMeta({ banner_url: "", website_url: "" });
                setIsCreatingGroup(false);
                toast.success(t('brand_created'));
            }
        } catch {
            toast.error("Erreur de création");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Connectez-vous d'abord");

            const payload = {
                platform: formData.platform,
                url: formData.url,
                bio: formData.bio,
                goal: formData.goal,
                group_id: formData.group_id,
                username: formData.username || null,
                password: formData.password || null,
                status: formData.status,
                tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
                user_id: user.id
            };

            if (profileToEdit) {
                const { error } = await supabase
                    .from('social_profiles')
                    .update(payload)
                    .eq('id', profileToEdit.id);
                if (error) throw error;
                toast.success(t('profile_updated'));
            } else {
                const { error } = await supabase
                    .from('social_profiles')
                    .insert(payload);
                if (error) throw error;
                toast.success(t('profile_added'));
            }

            setIsOpen(false);
            if (!profileToEdit) resetForm();
            if (onSuccess) onSuccess();

        } catch (error: unknown) {
            console.error('Submit error:', error);
            const message = error instanceof Error ? error.message : "Erreur";
            toast.error(`Échec : ${message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                {trigger ? trigger : (
                    <button className="w-fit bg-foreground text-background font-black px-4 py-2.5 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-2 shadow-xl active:scale-95 uppercase text-[9px] tracking-widest">
                        <Plus className="h-4 w-4" />
                        <span>AJOUTER UN COMPTE</span>
                    </button>
                )}
            </SheetTrigger>

            <SheetContent side="right" className="w-[100%] sm:w-[600px] border-l border-border bg-background p-0 flex flex-col h-full shadow-2xl">
                <div className="p-6 md:p-10 border-b border-border bg-card/50 backdrop-blur-xl">
                    <SheetHeader>
                        <SheetTitle className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-foreground">
                            {profileToEdit ? t('edit_actif').split('l\'Actif')[0] : t('linker_actif').split('l\'Actif')[0]} <span className="text-primary">{t('linker_actif').includes('l\'Actif') ? "l'Actif." : 'Asset.'}</span>
                        </SheetTitle>
                        <SheetDescription className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
                            {t('sync_desc')}
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 scrollbar-hide">
                    <form id="social-form" onSubmit={handleSubmit} className="space-y-10">

                        {/* Choisir la Marque */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Propriétaire / Marque</label>
                            <div className="flex gap-3">
                                {groups.length === 0 ? (
                                    <div className="flex-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <span>Initialisez une marque avant de continuer.</span>
                                    </div>
                                ) : (
                                    <select
                                        className="flex-1 bg-card border border-border rounded-2xl px-5 py-4 text-foreground focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer font-bold shadow-inner"
                                        value={formData.group_id}
                                        onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                                        required
                                    >
                                        <option value="" disabled className="bg-card">Sélectionner une entité</option>
                                        {groups.map(g => (
                                            <option key={g.id} value={g.id} className="bg-card font-bold">{g.name}</option>
                                        ))}
                                    </select>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setIsCreatingGroup(!isCreatingGroup)}
                                    className={cn(
                                        "px-5 py-4 bg-card border border-border rounded-2xl transition-all hover:bg-accent shadow-xl",
                                        isCreatingGroup && "bg-primary text-primary-foreground border-primary"
                                    )}
                                >
                                    <Plus className="h-6 w-6" />
                                </button>
                            </div>

                            {isCreatingGroup && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4 mt-6 p-8 bg-card rounded-[2.5rem] border border-border shadow-2xl"
                                >
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nom de l&apos;entité</label>
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Ex: MINDOS Studio"
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-foreground text-sm outline-none focus:border-primary/50 transition-all font-bold"
                                            value={newGroupName}
                                            onChange={e => setNewGroupName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">URL Image (Bannière)</label>
                                        <input
                                            type="text"
                                            placeholder="https://images.unsplash.com/..."
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-foreground text-xs outline-none focus:border-primary/50 transition-all"
                                            value={brandMeta.banner_url}
                                            onChange={e => setBrandMeta({ ...brandMeta, banner_url: e.target.value })}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={createGroup}
                                        disabled={loading || !newGroupName}
                                        className="w-full py-4.5 bg-foreground text-background font-black text-[10px] uppercase rounded-xl hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50 shadow-xl"
                                    >
                                        {loading ? t('creating_entity') : t('create_entity_button')}
                                    </button>
                                </motion.div>
                            )}
                        </div>

                        <div className="space-y-5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{t('entity_targeted')}</label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {NETWORKS.map(net => {
                                    const Icon = net.icon;
                                    return (
                                        <button
                                            key={net.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, platform: net.id })}
                                            className={cn(
                                                "flex flex-col items-center gap-3 p-4 rounded-2xl transition-all border shadow-lg",
                                                formData.platform === net.id
                                                    ? "bg-foreground text-background border-foreground"
                                                    : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                                            )}
                                        >
                                            <Icon className="w-6 h-6" />
                                            <span className="text-[8px] font-black uppercase">{net.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{t('link_asset')}</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/50" />
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-4 text-sm text-foreground focus:border-primary/50 outline-none transition-all shadow-inner"
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Priorité / État</label>
                                <select
                                    className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-foreground focus:border-primary/50 outline-none appearance-none cursor-pointer font-bold shadow-inner"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Actif" className="bg-card font-bold text-emerald-500">✅ ACTIF</option>
                                    <option value="Attention" className="bg-card font-bold text-amber-500">⚠️ ATTENTION</option>
                                    <option value="Suspendu" className="bg-card font-bold text-rose-500">🚫 SUSPENDU</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{t('access_info')}</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative">
                                    <User className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/50" />
                                    <input
                                        type="text"
                                        placeholder="ID / Username"
                                        className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-4 text-sm text-foreground focus:border-primary/50 outline-none transition-all shadow-inner font-bold"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/50" />
                                    <input
                                        type="password"
                                        placeholder="🔐 Secret Key"
                                        className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-4 text-sm text-foreground focus:border-primary/50 outline-none transition-all shadow-inner font-bold"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{t('business_goal')}</label>
                            <div className="relative">
                                <Target className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/50" />
                                <input
                                    type="text"
                                    placeholder="Ex: Conversion 5% ou 10k Subs"
                                    className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-4 text-sm text-foreground focus:border-primary/50 outline-none transition-all shadow-inner font-bold italic"
                                    value={formData.goal}
                                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 md:p-10 border-t border-border bg-card/80 backdrop-blur-2xl">
                    <button
                        form="social-form"
                        type="submit"
                        disabled={loading || groups.length === 0}
                        className="w-full bg-foreground text-background font-black text-[11px] uppercase tracking-[0.3em] h-16 rounded-2xl hover:bg-primary hover:text-primary-foreground transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale shadow-2xl"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Save className="h-6 w-6" />
                                {profileToEdit ? t('update_profile') : t('save_profile')}
                            </>
                        )}
                    </button>
                    {groups.length === 0 && (
                        <p className="text-[9px] text-center mt-6 font-black text-amber-500 uppercase tracking-[0.2em] animate-pulse">
                            {t('action_required_entity')}
                        </p>
                    )}
                </div>

            </SheetContent>
        </Sheet>
    );
}
