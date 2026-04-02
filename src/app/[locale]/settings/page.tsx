"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { supabase } from "@/lib/supabase";
import {
    User,
    Bell,
    Camera,
    Save,
    Loader2,
    ShieldCheck,
    Mail,
    Lock,
    Palette,
    Sun,
    Moon,
    Waves,
    Globe
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter, usePathname } from "@/i18n/routing";
import { useTheme } from "next-themes";
import { useLocale } from "next-intl";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export default function SettingsPage() {
    const { user } = useSupabase();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const locale = useLocale();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications' | 'appearance' | 'language'>('profile');

    // Profile State
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    // Preferences State
    const [notifSettings, setNotifSettings] = useState({
        email_digests: true,
        project_updates: true,
        book_reminders: false,
        system_announcements: true
    });

    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id || '')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setFullName(data.full_name || "");
                setUsername(data.username || "");
                setBio(data.bio || "");
                setAvatarUrl(data.avatar_url || "");
                if (data.settings && typeof data.settings === 'object' && 'notifications' in data.settings) {
                    setNotifSettings(data.settings.notifications as typeof notifSettings);
                }
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user, fetchProfile]);

    const handleToggleNotification = async (key: keyof typeof notifSettings) => {
        const newSettings = { ...notifSettings, [key]: !notifSettings[key] };
        setNotifSettings(newSettings);

        try {
            const { error } = await supabase.from('profiles').update({
                settings: {
                    notifications: newSettings
                }
            }).eq('id', user?.id);

            if (error) throw error;
            toast.success("Préférence mise à jour");
        } catch {
            toast.error("Erreur de sauvegarde");
            setNotifSettings(notifSettings);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                full_name: fullName,
                username,
                bio,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            });

            if (error) throw error;
            toast.success("Profil mis à jour avec succès ! ✨");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erreur inconnue";
            toast.error(message || "Erreur lors de la mise à jour");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateEmail = async (newEmail: string) => {
        try {
            const { error } = await supabase.auth.updateUser({ email: newEmail });
            if (error) throw error;
            toast.success("Un email de confirmation a été envoyé ! 📧");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erreur inconnue";
            toast.error(message || "Erreur");
        }
    };

    const handleUpdatePassword = async (newPass: string) => {
        try {
            const { error } = await supabase.auth.updateUser({ password: newPass });
            if (error) throw error;
            toast.success("Mot de passe mis à jour ! 🔐");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erreur inconnue";
            toast.error(message || "Erreur");
        }
    };


    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/avatar.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(data.publicUrl);
            toast.success("Avatar téléversé !");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erreur inconnue";
            toast.error(message || "Erreur de téléversement");
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-background text-foreground p-4 md:p-8 selection:bg-primary/30 relative overflow-hidden">

            {/* Ambient background */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto space-y-8">

                {/* Header Compact */}
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 text-center md:text-left border-b border-border pb-6">
                    <p className="text-primary text-[9px] font-black uppercase tracking-[0.3em]">System Configuration</p>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic">Console <span className="text-muted-foreground opacity-20">Paramètres</span></h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar Tabs Compact */}
                    <div className="lg:col-span-1 animate-in fade-in slide-in-from-left-4 duration-700">
                        <div className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                            {[
                                { id: 'profile', label: 'Profil', icon: User },
                                { id: 'appearance', label: 'Apparence', icon: Palette },
                                { id: 'language', label: 'Langue', icon: Globe },
                                { id: 'account', label: 'Sécurité', icon: ShieldCheck },
                                { id: 'notifications', label: 'Notifs', icon: Bell },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                    className={cn(
                                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
                                        activeTab === tab.id
                                            ? "bg-primary text-black"
                                            : "text-muted-foreground hover:text-foreground hover:bg-card"
                                    )}
                                >
                                    <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? "text-black" : "text-muted-foreground/50")} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area Compact */}
                    <div className="lg:col-span-3 space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">

                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div className="bg-card border border-border p-5 md:p-6 rounded-2xl relative overflow-hidden shadow-sm">
                                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                                        <div className="relative group cursor-pointer">
                                            <div className="w-20 h-20 rounded-2xl bg-background border border-border overflow-hidden relative shadow-md">
                                                {avatarUrl ? (
                                                    <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-accent/50">
                                                        <User className="w-8 h-8 text-muted-foreground" />
                                                    </div>
                                                )}
                                                {uploading && (
                                                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                            <label className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-black rounded-lg shadow-lg border-2 border-card cursor-pointer hover:scale-110 transition-all">
                                                <Camera className="w-3.5 h-3.5" />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                                            </label>
                                        </div>

                                        <div className="text-center md:text-left space-y-0.5">
                                            <h2 className="text-xl font-black text-foreground uppercase italic tracking-tighter">{fullName || "Créateur Alpha"}</h2>
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-30">Identity Matrix: {username || "unset"}</p>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Nom Complet</label>
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={e => setFullName(e.target.value)}
                                                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-widest text-foreground focus:border-primary/50 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Username</label>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={e => setUsername(e.target.value)}
                                                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-widest text-foreground focus:border-primary/50 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Bio / Protocol Info</label>
                                        <textarea
                                            value={bio}
                                            onChange={e => setBio(e.target.value)}
                                            rows={2}
                                            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[11px] font-medium text-foreground focus:border-primary/50 outline-none transition-all resize-none"
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button type="submit" disabled={saving} className="px-6 py-3 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-xl flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/10">
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Sauvegarder
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-3">
                                    <Palette className="w-4 h-4 text-primary" />
                                    Thème Interface
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        { id: 'light', label: 'Light', icon: Sun, desc: 'Mode épuré' },
                                        { id: 'dark', label: 'Mindos Dark', icon: Moon, desc: 'Optimisé Musa' },
                                        { id: 'navy', label: 'Midnight', icon: Waves, desc: 'Océan Alpha' }
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={cn(
                                                "p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group",
                                                theme === t.id
                                                    ? "bg-zinc-900 text-white border-primary shadow-lg shadow-primary/10"
                                                    : "bg-card border-border hover:border-primary/30"
                                            )}
                                        >
                                            <t.icon className={cn("w-6 h-6 mb-3", theme === t.id ? "text-primary" : "text-muted-foreground")} />
                                            <p className="font-black uppercase text-[10px] tracking-widest leading-none">{t.label}</p>
                                            <p className={cn("text-[9px] mt-1 font-bold", theme === t.id ? "opacity-40" : "text-muted-foreground")}>{t.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'language' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-3">
                                    <Globe className="w-4 h-4 text-primary" />
                                    Langue Système
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        {
                                            id: 'fr',
                                            label: 'Français',
                                            flag: (
                                                <svg viewBox="0 0 3 2" className="w-8 h-5 rounded shadow">
                                                    <path fill="#EC1920" d="M0 0h3v2H0z" />
                                                    <path fill="#fff" d="M0 0h2v2H0z" />
                                                    <path fill="#051440" d="M0 0h1v2H0z" />
                                                </svg>
                                            )
                                        },
                                        {
                                            id: 'en',
                                            label: 'English',
                                            flag: (
                                                <svg viewBox="0 0 60 30" className="w-8 h-5 rounded shadow">
                                                    <clipPath id="uk-flag-compact">
                                                        <path d="M0,0 v30 h60 v-30 z" />
                                                    </clipPath>
                                                    <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
                                                    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" clipPath="url(#uk-flag-compact)" />
                                                    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
                                                    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
                                                </svg>
                                            )
                                        }
                                    ].map((lang) => (
                                        <button
                                            key={lang.id}
                                            onClick={() => router.replace(pathname, { locale: lang.id })}
                                            className={cn(
                                                "p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group flex items-center gap-4",
                                                locale === lang.id
                                                    ? "bg-zinc-900 text-white border-primary shadow-lg shadow-primary/10"
                                                    : "bg-card border-border hover:border-primary/30"
                                            )}
                                        >
                                            <div className="shrink-0 group-hover:scale-110 transition-transform">{lang.flag}</div>
                                            <div className="space-y-0.5">
                                                <p className="font-black uppercase text-[10px] tracking-widest leading-none">{lang.label}</p>
                                                <p className={cn("text-[9px] font-bold opacity-40", locale === lang.id ? "text-white" : "text-muted-foreground")}>
                                                    {lang.id === 'fr' ? 'Version FR' : 'English Ver'}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'account' && (
                            <div className="space-y-4 animate-in fade-in duration-500">
                                <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                                    {/* Email Update */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-4 h-4 text-muted-foreground/50" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Email Principal</p>
                                                <p className="text-xs font-black italic">{user?.email}</p>
                                            </div>
                                        </div>
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <button className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-muted rounded-lg hover:bg-primary hover:text-black transition-all">
                                                    Modifier
                                                </button>
                                            </SheetTrigger>
                                            <SheetContent className="bg-card border-l border-border p-6">
                                                <SheetHeader className="mb-6">
                                                    <SheetTitle className="text-xl font-black uppercase italic tracking-tighter">Modifier l&apos;Email</SheetTitle>
                                                </SheetHeader>
                                                <div className="space-y-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Nouvel Email</label>
                                                        <input
                                                            type="email"
                                                            value={newEmail}
                                                            onChange={(e) => setNewEmail(e.target.value)}
                                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-[11px] font-black focus:border-primary outline-none transition-all"
                                                            placeholder="exemple@email.com"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleUpdateEmail(newEmail)}
                                                        className="w-full bg-primary text-black font-black uppercase text-[10px] tracking-widest p-4 rounded-xl hover:opacity-90 transition-all"
                                                    >
                                                        Confirmer
                                                    </button>
                                                </div>
                                            </SheetContent>
                                        </Sheet>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
                                {[
                                    { id: 'email_digests', title: 'Résumé Hebdo', desc: 'Rapports automatisés' },
                                    { id: 'project_updates', title: 'Smart Alerts', desc: 'Alertes systèmes' },
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center justify-between border-b border-border/10 pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-tight">{item.title}</p>
                                            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">{item.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => handleToggleNotification(item.id as keyof typeof notifSettings)}
                                            className={cn("w-10 h-5 rounded-full relative transition-all", notifSettings[item.id as keyof typeof notifSettings] ? "bg-primary" : "bg-muted")}
                                        >
                                            <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm", notifSettings[item.id as keyof typeof notifSettings] ? "left-6" : "left-1")} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

