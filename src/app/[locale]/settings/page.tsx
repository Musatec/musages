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
        <div className="min-h-screen w-full bg-background text-foreground p-6 md:p-12 selection:bg-primary/30 relative overflow-hidden">

            {/* Ambient background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto space-y-12">

                {/* Header */}
                <div className="space-y-1 animate-in fade-in slide-in-from-top-4 duration-500 text-center md:text-left">
                    <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em]">Configuration</p>
                    <h1 className="text-3xl sm:text-5xl font-light tracking-tight">Paramètres</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-1 animate-in fade-in slide-in-from-left-4 duration-700">
                        <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
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
                                        "flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0",
                                        activeTab === tab.id
                                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                            : "text-muted-foreground hover:text-foreground hover:bg-card"
                                    )}
                                >
                                    <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-white" : "text-muted-foreground/50")} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">

                        {activeTab === 'profile' && (
                            <div className="space-y-8">
                                <div className="bg-card border border-border p-6 md:p-8 rounded-[2rem] relative overflow-hidden shadow-xl">
                                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                        <div className="relative group cursor-pointer">
                                            <div className="w-32 h-32 rounded-3xl bg-background border border-border overflow-hidden relative shadow-2xl">
                                                {avatarUrl ? (
                                                    <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-accent/50">
                                                        <User className="w-12 h-12 text-muted-foreground" />
                                                    </div>
                                                )}
                                                {uploading && (
                                                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                            <label className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-primary-foreground rounded-xl shadow-lg border-4 border-card cursor-pointer hover:scale-110 transition-all">
                                                <Camera className="w-4 h-4" />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                                            </label>
                                        </div>

                                        <div className="text-center md:text-left space-y-2">
                                            <h2 className="text-2xl font-bold text-foreground capitalize">{fullName || "Créateur Anonyme"}</h2>
                                            <p className="text-muted-foreground font-mono text-sm italic">@{username || "username"}</p>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Nom Complet</label>
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={e => setFullName(e.target.value)}
                                                className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-foreground focus:border-primary/50 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Username</label>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={e => setUsername(e.target.value)}
                                                className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-foreground focus:border-primary/50 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Bio</label>
                                        <textarea
                                            value={bio}
                                            onChange={e => setBio(e.target.value)}
                                            rows={4}
                                            className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-foreground focus:border-primary/50 outline-none transition-all resize-none"
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button type="submit" disabled={saving} className="btn-primary px-8 py-4 flex items-center gap-3">
                                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            Sauvegarder
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                                        <Palette className="w-5 h-5 text-primary" />
                                        Thème de l&apos;interface
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        {[
                                            { id: 'light', label: 'Clarté ☀️', icon: Sun, desc: 'Mode jour épuré' },
                                            { id: 'dark', label: 'Sombre 🌑', icon: Moon, desc: 'Expérience Musa' },
                                            { id: 'navy', label: 'Midnight 🌌', icon: Waves, desc: 'Océan de créativité' }
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setTheme(t.id)}
                                                className={cn(
                                                    "p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group",
                                                    theme === t.id
                                                        ? "bg-zinc-900 text-white border-orange-500 shadow-xl shadow-orange-500/10"
                                                        : "bg-card border-border hover:border-primary/30"
                                                )}
                                            >
                                                <t.icon className={cn("w-8 h-8 mb-4", theme === t.id ? "text-primary" : "text-muted-foreground")} />
                                                <p className="font-black uppercase text-xs tracking-widest">{t.label}</p>
                                                <p className={cn("text-[10px] mt-1 font-bold", theme === t.id ? "text-background/60" : "text-muted-foreground")}>{t.desc}</p>

                                                {theme === t.id && (
                                                    <div className="absolute top-2 right-2">
                                                        <ShieldCheck className="w-5 h-5 text-primary" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'language' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-primary" />
                                        Langue du Sanctuaire
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {[
                                            {
                                                id: 'fr',
                                                label: 'Français',
                                                flag: (
                                                    <svg viewBox="0 0 3 2" className="w-12 h-8 rounded-lg shadow-xl border border-border/10">
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
                                                    <svg viewBox="0 0 60 30" className="w-12 h-8 rounded-lg shadow-xl border border-border/10">
                                                        <clipPath id="uk-flag-settings">
                                                            <path d="M0,0 v30 h60 v-30 z" />
                                                        </clipPath>
                                                        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
                                                        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" clipPath="url(#uk-flag-settings)" />
                                                        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#uk-flag-settings)" />
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
                                                    "p-8 rounded-[2.5rem] border-2 text-left transition-all relative overflow-hidden group flex items-center gap-6",
                                                    locale === lang.id
                                                        ? "bg-zinc-900 text-white border-orange-500 shadow-xl shadow-orange-500/10"
                                                        : "bg-card border-border hover:border-primary/30"
                                                )}
                                            >
                                                <div className="shrink-0 group-hover:scale-110 transition-transform duration-500">{lang.flag}</div>
                                                <div className="space-y-1">
                                                    <p className="font-black uppercase text-sm tracking-widest">{lang.label}</p>
                                                    <p className={cn("text-[10px] font-bold opacity-60", locale === lang.id ? "text-background" : "text-muted-foreground")}>
                                                        {lang.id === 'fr' ? 'Interface en Français' : 'English Interface'}
                                                    </p>
                                                </div>

                                                {locale === lang.id && (
                                                    <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                                                        <ShieldCheck className="w-6 h-6 text-orange-500" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'account' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="bg-card border border-border rounded-[2rem] p-8 space-y-6">
                                    {/* Email Update */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Mail className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-bold">Email Principal</p>
                                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                                            </div>
                                        </div>
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <button className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 bg-accent rounded-xl hover:text-orange-500 hover:border-orange-500 hover:bg-orange-500/10 border border-transparent transition-all">
                                                    Modifier
                                                </button>
                                            </SheetTrigger>
                                            <SheetContent className="bg-card border-l border-border p-8">
                                                <SheetHeader className="mb-8">
                                                    <SheetTitle className="text-2xl font-light">Modifier l&apos;Email</SheetTitle>
                                                    <SheetDescription>
                                                        Vous recevrez un lien de confirmation à votre nouvelle adresse.
                                                    </SheetDescription>
                                                </SheetHeader>
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Nouvel Email</label>
                                                        <input
                                                            type="email"
                                                            value={newEmail}
                                                            onChange={(e) => setNewEmail(e.target.value)}
                                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-orange-500 outline-none transition-all"
                                                            placeholder="exemple@email.com"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleUpdateEmail(newEmail)}
                                                        className="w-full bg-foreground text-background font-bold uppercase text-xs p-4 rounded-xl hover:bg-orange-500 hover:text-white transition-all"
                                                    >
                                                        Mettre à jour
                                                    </button>
                                                </div>
                                            </SheetContent>
                                        </Sheet>
                                    </div>

                                    {/* Password Update */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Lock className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-bold">Mot de passe</p>
                                                <p className="text-xs text-muted-foreground">••••••••••••</p>
                                            </div>
                                        </div>
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <button className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 bg-accent rounded-xl hover:text-orange-500 hover:border-orange-500 hover:bg-orange-500/10 border border-transparent transition-all">
                                                    Changer
                                                </button>
                                            </SheetTrigger>
                                            <SheetContent className="bg-card border-l border-border p-8">
                                                <SheetHeader className="mb-8">
                                                    <SheetTitle className="text-2xl font-light">Sécurité</SheetTitle>
                                                    <SheetDescription>
                                                        Choisissez un mot de passe robuste pour protéger votre sanctuaire.
                                                    </SheetDescription>
                                                </SheetHeader>
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Nouveau mot de passe</label>
                                                        <input
                                                            type="password"
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-orange-500 outline-none transition-all"
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleUpdatePassword(newPassword)}
                                                        className="w-full bg-foreground text-background font-bold uppercase text-xs p-4 rounded-xl hover:bg-orange-500 hover:text-white transition-all"
                                                    >
                                                        Définir le mot de passe
                                                    </button>
                                                </div>
                                            </SheetContent>
                                        </Sheet>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="bg-card border border-border rounded-[2rem] p-8 space-y-8">
                                {[
                                    { id: 'email_digests', title: 'Résumé hebdomadaire', desc: 'Newsletter de votre labo' },
                                    { id: 'project_updates', title: 'Mises à jour Projets', desc: 'Alertes sur les deadlines' },
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => handleToggleNotification(item.id as keyof typeof notifSettings)}
                                            className={cn("w-10 h-5 rounded-full relative transition-all", notifSettings[item.id as keyof typeof notifSettings] ? "bg-primary" : "bg-muted")}
                                        >
                                            <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", notifSettings[item.id as keyof typeof notifSettings] ? "left-6" : "left-1")} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style jsx>{`
                .btn-primary {
                    @apply bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95 px-8 py-4;
                }
            `}</style>
        </div>
    );
}
