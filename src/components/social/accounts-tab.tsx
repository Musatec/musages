"use client";

import {
    SiLinkedin,
    SiInstagram,
    SiYoutube,
    SiTiktok,
    SiFacebook,
    SiPinterest,
    SiBehance,
    SiDribbble,
    SiTwitch,
    SiX
} from "react-icons/si";
import {
    Target,
    Plus,
    Trash2,
    Settings2,
    ExternalLink,
    Globe,
    AlertCircle,
    CheckCircle2,
    ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { NewNetworkSheet } from "./new-network-sheet";
import { CredentialsView } from "./credentials-view";
import Image from "next/image";

const PLATFORM_CONFIG: Record<string, { icon: React.ElementType, brandColor: string }> = {
    "Linkedin": { icon: SiLinkedin, brandColor: "#0077B5" },
    "Instagram": { icon: SiInstagram, brandColor: "#E4405F" },
    "Youtube": { icon: SiYoutube, brandColor: "#FF0000" },
    "Tiktok": { icon: SiTiktok, brandColor: "#FFFFFF" },
    "Facebook": { icon: SiFacebook, brandColor: "#1877F2" },
    "Pinterest": { icon: SiPinterest, brandColor: "#BD081C" },
    "Behance": { icon: SiBehance, brandColor: "#1769FF" },
    "Dribbble": { icon: SiDribbble, brandColor: "#EA4C89" },
    "Twitch": { icon: SiTwitch, brandColor: "#9146FF" },
    "X / Twitter": { icon: SiX, brandColor: "#FFFFFF" },
    "Twitter": { icon: SiX, brandColor: "#FFFFFF" },
    "Website": { icon: Globe, brandColor: "#10B981" },
};

const STATUS_CONFIG: Record<string, { icon: React.ElementType, color: string, bg: string, border: string, label: string }> = {
    "Actif": { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Actif" },
    "Attention": { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Attention" },
    "Suspendu": { icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", label: "Suspendu" },
};

type Group = Database['public']['Tables']['social_groups']['Row'] & { website_url?: string; banner_url?: string };
type Profile = Database['public']['Tables']['social_profiles']['Row'] & { status?: string };

interface AccountsTabProps {
    groups: Group[];
    profiles: Profile[];
    fetchData: () => Promise<void>;
    setProfiles: (profiles: Profile[]) => void;
}

export function AccountsTab({ groups, profiles, fetchData, setProfiles }: AccountsTabProps) {
    const t = useTranslations("Growth");

    // Override labels with translations
    const translatedStatus = {
        "Actif": { ...STATUS_CONFIG.Actif, label: t('status_active') || "Actif" },
        "Attention": { ...STATUS_CONFIG.Attention, label: t('status_attention') || "Attention" },
        "Suspendu": { ...STATUS_CONFIG.Suspendu, label: t('status_suspended') || "Suspendu" },
    };

    const deleteProfile = async (id: string) => {
        const toastId = toast.loading(t('deleting_profile') || "Déconnexion...");

        try {
            const { error } = await supabase.from('social_profiles').delete().eq('id', id);
            if (error) throw error;

            setProfiles(profiles.filter((p) => p.id !== id));
            toast.success(t('profile_disconnected'), { id: toastId });
        } catch {
            toast.error(t('error_delete') || "Échec de la déconnexion.", { id: toastId });
        }
    };

    return (
        <div className="space-y-20 pb-20">
            {groups.map((group) => (
                <section key={group.id} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    {/* Brand Header */}
                    <div className="group relative overflow-hidden rounded-[3rem] border border-border bg-card shadow-2xl">
                        {/* Banner */}
                        <div className="h-48 w-full relative overflow-hidden">
                            {group.banner_url ? (
                                <Image src={group.banner_url} alt={group.name} fill className="object-cover brightness-50 group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/20 via-card to-background" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                        </div>

                        {/* Brand Info */}
                        <div className="px-10 pb-10 -mt-12 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="flex items-end gap-6">
                                <div className="w-24 h-24 rounded-3xl bg-secondary border-4 border-card shadow-2xl flex items-center justify-center overflow-hidden">
                                    {group.banner_url ? (
                                        <Image src={group.banner_url} alt={group.name} width={96} height={96} className="object-cover" />
                                    ) : (
                                        <Target className="w-10 h-10 text-primary" />
                                    )}
                                </div>
                                <div className="pb-2">
                                    <h2 className="text-4xl font-black italic tracking-tighter text-foreground uppercase">{group.name}</h2>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <Globe className="w-3.5 h-3.5" />
                                            <span>{t('official_entity')}</span>
                                        </div>
                                        {group.website_url && (
                                            <a href={group.website_url} target="_blank" className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline underline-offset-4">
                                                SITE WEB <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <NewNetworkSheet
                                    onSuccess={fetchData}
                                    trigger={
                                        <button className="bg-transparent border border-zinc-700 text-white hover:border-orange-500 hover:text-orange-500 hover:bg-orange-500/10 font-black px-6 py-3 rounded-2xl transition-all flex items-center gap-2 shadow-xl active:scale-95 uppercase text-[10px] tracking-widest">
                                            <Plus className="h-4 w-4" />
                                            S&apos;étendre
                                        </button>
                                    }
                                />
                                <button className="p-3 bg-secondary/50 border border-border rounded-2xl text-muted-foreground hover:text-foreground transition-all">
                                    <Settings2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Profiles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {profiles.filter((p) => p.group_id === group.id).map((profile) => {
                            const config = PLATFORM_CONFIG[profile.platform] || { icon: Globe, brandColor: "#FFFFFF" };
                            const status = translatedStatus[profile.status as keyof typeof translatedStatus] || translatedStatus["Actif"];
                            const Icon = config.icon;
                            const StatusIcon = status.icon;

                            return (
                                <div
                                    key={profile.id}
                                    className="group relative bg-card border border-border rounded-[2rem] p-6 hover:bg-accent/10 hover:border-primary/50 transition-all duration-300 shadow-xl shadow-black/10 flex flex-col h-full"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-secondary border border-border flex items-center justify-center shadow-lg">
                                                <Icon className="w-5 h-5 transition-colors" style={{ color: config.brandColor }} />
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="text-xs font-black text-foreground uppercase tracking-tight truncate max-w-[120px]">{profile.platform}</h3>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">{profile.username || "Identifié"}</p>
                                            </div>
                                        </div>
                                        <div className={cn("px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5", status.bg, status.color, status.border)}>
                                            <StatusIcon className="w-3 h-3" />
                                            {status.label}
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        {profile.bio && (
                                            <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-2">&quot;{profile.bio}&quot;</p>
                                        )}
                                        {profile.goal && (
                                            <div className="bg-secondary/30 rounded-xl p-3 border border-border/50">
                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Cible Stratégique</p>
                                                <p className="text-xs font-bold text-foreground">{profile.goal}</p>
                                            </div>
                                        )}

                                        <CredentialsView username={profile.username} password={profile.password} />
                                    </div>

                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                                        <a href={profile.url || '#'} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 group/link uppercase tracking-widest">
                                            Visualiser <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                        </a>

                                        <div className="flex items-center gap-2">
                                            <NewNetworkSheet
                                                onSuccess={fetchData}
                                                profileToEdit={profile}
                                                trigger={
                                                    <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary">
                                                        <Settings2 className="w-3.5 h-3.5" />
                                                    </button>
                                                }
                                            />
                                            <button onClick={() => deleteProfile(profile.id)} className="p-2 text-muted-foreground hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-500/10">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}

            {groups.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 bg-card border-2 border-dashed border-border rounded-[3rem] animate-in fade-in zoom-in-95 shadow-2xl">
                    <Target className="w-20 h-20 text-muted-foreground/30 mb-8" />
                    <h3 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">Votre empire est en sommeil.</h3>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.3em] mt-2 mb-10 text-center px-10">Connectez votre premier point de contact pour commencer l&apos;expansion.</p>
                    <NewNetworkSheet onSuccess={fetchData} />
                </div>
            )}
        </div>
    );
}
