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
                    <div className="group relative overflow-hidden rounded-2xl md:rounded-[2.5rem] border-2 border-orange-500/30 bg-gradient-to-br from-orange-950/20 via-[#0a0a0a] to-[#0a0a0a] shadow-2xl shadow-orange-900/10">
                        {/* Banner */}
                        <div className="h-20 md:h-28 w-full relative overflow-hidden border-b border-orange-500/20">
                            {group.banner_url ? (
                                <Image src={group.banner_url} alt={group.name} fill className="object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-r from-orange-600/20 via-zinc-900 to-orange-600/10" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
                        </div>

                        {/* Brand Info */}
                        <div className="px-5 md:px-8 pb-5 md:pb-6 -mt-4 md:-mt-6 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-zinc-900 border-2 border-orange-500/50 shadow-2xl flex items-center justify-center overflow-hidden shrink-0 group-hover:border-orange-500 transition-colors">
                                    {group.banner_url ? (
                                        <Image src={group.banner_url} alt={group.name} width={64} height={64} className="object-cover" />
                                    ) : (
                                        <Target className="w-6 h-6 text-orange-500" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-xl md:text-2xl font-black italic tracking-tighter text-white uppercase truncate group-hover:text-orange-500 transition-colors">{group.name}</h2>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-[8px] font-bold text-orange-500/70 uppercase tracking-widest">
                                            <Globe className="w-2.5 h-2.5" />
                                            <span>ENTITÉ OFFICIELLE</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <NewNetworkSheet
                                    onSuccess={fetchData}
                                    trigger={
                                        <button className="flex-1 md:flex-none bg-orange-600 text-white border border-orange-400/50 px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-lg shadow-orange-900/40">
                                            <Plus className="h-3.5 w-3.5" />
                                            <span>S&apos;ÉTENDRE</span>
                                        </button>
                                    }
                                />
                                <button className="p-2.5 bg-zinc-900 border border-white/10 rounded-xl text-zinc-500 hover:text-orange-500 transition-all">
                                    <Settings2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Profiles Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center">
                        {profiles.filter((p) => p.group_id === group.id).map((profile) => {
                            const config = PLATFORM_CONFIG[profile.platform] || { icon: Globe, brandColor: "#FFFFFF" };
                            const status = translatedStatus[profile.status as keyof typeof translatedStatus] || translatedStatus["Actif"];
                            const Icon = config.icon;
                            const StatusIcon = status.icon;

                            return (
                                <div
                                    key={profile.id}
                                    className="group relative bg-[#111111]/80 backdrop-blur-sm border border-white/5 rounded-2xl p-4 hover:border-primary/30 transition-all duration-500 shadow-2xl flex flex-col h-full w-full max-w-[280px] sm:max-w-none mx-auto"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shadow-lg">
                                                <Icon className="w-5 h-5" style={{ color: config.brandColor }} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <h3 className="text-[10px] font-black text-white uppercase tracking-tight truncate">{profile.platform}</h3>
                                                <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest truncate">{profile.username || "ACTIF"}</p>
                                            </div>
                                        </div>
                                        <div className={cn("p-1.5 rounded-lg border flex items-center shrink-0", status.bg, status.color, status.border)}>
                                            <StatusIcon className="w-3 h-3" />
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        {profile.bio && (
                                            <p className="text-[10px] text-zinc-400 leading-relaxed italic line-clamp-2 px-1 border-l border-zinc-800">
                                                &quot;{profile.bio}&quot;
                                            </p>
                                        )}
                                        {profile.goal && (
                                            <div className="bg-zinc-900/50 rounded-lg p-2.5 border border-white/5">
                                                <p className="text-[7px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">CIBLE STRATÉGIQUE</p>
                                                <p className="text-[10px] font-bold text-white truncate">{profile.goal}</p>
                                            </div>
                                        )}

                                        <CredentialsView username={profile.username} password={profile.password} />
                                    </div>

                                    <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/5">
                                        <a href={profile.url || '#'} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-orange-500 hover:text-orange-400 flex items-center gap-1.5 transition-colors uppercase tracking-[0.15em]">
                                            VISUALISER <ExternalLink className="w-2.5 h-2.5" />
                                        </a>

                                        <div className="flex items-center gap-1">
                                            <NewNetworkSheet
                                                onSuccess={fetchData}
                                                profileToEdit={profile}
                                                trigger={
                                                    <button className="p-1.5 text-zinc-600 hover:text-zinc-300 transition-colors">
                                                        <Settings2 className="w-3 h-3" />
                                                    </button>
                                                }
                                            />
                                            <button onClick={() => deleteProfile(profile.id)} className="p-1.5 text-zinc-600 hover:text-rose-500 transition-colors">
                                                <Trash2 className="w-3 h-3" />
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
