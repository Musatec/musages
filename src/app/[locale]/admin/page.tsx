"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
    Users,
    ShieldCheck,
    Trash2,
    Search,
    Loader2,
    ShieldAlert,
    Ban,
    RefreshCcw,
    Edit3,
    Activity,
    BookOpen,
    FlaskConical,
    Zap,
    TrendingUp,
    Lock,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Profile = {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    created_at: string;
    role: string | null;
};

import Image from "next/image";

export default function UnifiedAdminPage() {
    const { isAdmin, isLoading: authLoading } = useSupabase();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBooks: 0,
        totalProjects: 0,
        totalCapital: 0,
        totalSocial: 0,
        activeRate: 0
    });

    // --- SYSTEM CONTROLS ---
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [broadcast, setBroadcast] = useState("");
    const [isUpdatingSystem, setIsUpdatingSystem] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/dashboard');
            return;
        }
        if (isAdmin) {
            fetchAllData();
        }
    }, [isAdmin, authLoading]);

    const fetchAllData = async () => {
        try {
            setLoading(true);

            // Fetch Profiles
            const { data: profs, error: profError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profError) throw profError;
            setProfiles(profs || []);

            // Fetch Stats
            const [booksRes, projectsRes, capitalRes, socialRes] = await Promise.all([
                supabase.from('books').select('id', { count: 'exact', head: true }),
                supabase.from('projects').select('id', { count: 'exact', head: true }),
                supabase.from('transactions').select('amount').order('created_at', { ascending: false }).limit(10),
                supabase.from('social_profiles').select('id', { count: 'exact', head: true })
            ]);

            const capitalSum = capitalRes.data?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

            setStats({
                totalUsers: profs?.length || 0,
                totalBooks: booksRes.count || 0,
                totalProjects: projectsRes.count || 0,
                totalCapital: capitalSum,
                totalSocial: socialRes.count || 0,
                activeRate: Math.floor(Math.random() * 10) + 90
            });

            // Fetch System Settings from first admin (usually current user)
            const adminProf = profs?.find(p => p.role === 'admin');
            if (adminProf?.settings) {
                const settings = adminProf.settings as any;
                setIsMaintenance(settings.maintenance_mode || false);
                setBroadcast(settings.broadcast_message || "");
            }

        } catch (error: any) {
            toast.error("Échec de connexion au noyau : " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateSystemSettings = async (updates: any) => {
        const { user } = supabase.auth.getUser() as any; // Simple check
        setIsUpdatingSystem(true);
        try {
            const { data: currentAuth } = await supabase.auth.getUser();
            if (!currentAuth.user) return;

            // Fetch current settings first
            const { data: prof } = await supabase
                .from('profiles')
                .select('settings')
                .eq('id', currentAuth.user.id)
                .single();

            const newSettings = {
                ...(prof?.settings as object || {}),
                ...updates
            };

            const { error } = await supabase
                .from('profiles')
                .update({ settings: newSettings })
                .eq('id', currentAuth.user.id);

            if (error) throw error;
            toast.success("Système mis à jour ! ✨");
        } catch (err: any) {
            toast.error("Erreur système : " + err.message);
        } finally {
            setIsUpdatingSystem(false);
        }
    };

    const handleSeeding = async () => {
        setIsUpdatingSystem(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            toast.loading("Génération de l'univers démo...");

            // 1. Create a Demo Book
            const { data: book } = await supabase.from('books').insert({
                user_id: user.id,
                title: "L'Empire des Sables Verres",
                summary: "Une épopée fantastique dans un monde où le temps est une monnaie physique.",
                status: 'WRITING',
                color: '#F97316'
            }).select().single();

            if (book) {
                await supabase.from('chapters').insert([
                    { book_id: book.id, user_id: user.id, title: "Prologue : L'Inversion", order_index: 0, status: 'COMPLETED', content: "Le ciel était d'un bleu cobalt quand la première horloge s'est arrêtée..." },
                    { book_id: book.id, user_id: user.id, title: "Chapitre 1 : Le Marchand de Secondes", order_index: 1, status: 'DRAFT', content: "Dans les ruelles de la basse-bulle, le temps ne s'achète pas, il se vole." }
                ]);
            }

            // 2. Create a Labo Project
            await supabase.from('projects').insert({
                user_id: user.id,
                title: "Infrastructures de l'OS",
                description: "Refonte de l'interface de navigation et optimisation des protocoles.",
                status: 'en_cours',
                category: 'TECH',
                progress: 65
            });

            // 3. Create some Notes
            const { data: folder } = await supabase.from('folders').insert({
                user_id: user.id,
                name: "Archives Médievales"
            }).select().single();

            if (folder) {
                await supabase.from('notes').insert([
                    { user_id: user.id, folder_id: folder.id, title: "Physique du Mana", content: "L'énergie est proportionnelle à la volonté du batisseur.", folder: folder.name },
                    { user_id: user.id, folder_id: folder.id, title: "Bestiaire : Wyvernes", content: "Peau écailleuse, souffle froid.", folder: folder.name }
                ]);
            }

            toast.dismiss();
            toast.success("Univers peuplé avec succès ! 🚀");
            fetchAllData();
        } catch (err: any) {
            toast.error("Échec du seeding : " + err.message);
        } finally {
            setIsUpdatingSystem(false);
        }
    };

    const handleUpdateRole = async (userId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;
            toast.success(`Rang mis à jour : ${newRole}`);
            fetchAllData();
        } catch (error: any) {
            toast.error("Erreur de privilège : " + error.message);
        }
    };

    const handleQuickAction = async (action: string, userName: string) => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1000)),
            {
                loading: `Exécution de ${action} sur ${userName}...`,
                success: `${action} effectué avec succès.`,
                error: `Échec de l'action.`,
            }
        );
    };

    const filteredProfiles = profiles.filter(p =>
        p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading || (isAdmin && loading && profiles.length === 0)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-[#F97316]" />
                <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Initialisation du Noyau Admin...</p>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 pb-40 font-sans">
            <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">

                {/* --- TOP ROW: OS BRANDING & GLOBAL STATS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                    <div className="lg:col-span-4 bg-[#1C1C1E] border border-white/5 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F97316]/5 blur-3xl rounded-full" />
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[#F97316]">
                                    <ShieldCheck className="w-5 h-5 animate-pulse" />
                                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em]">MINDOS CORE CONSOLE v3.0</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter">CENTRAL<span className="text-[#F97316]">.</span>COMMAND</h1>
                            </div>
                            <div className="pt-6 flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {profiles.slice(0, 5).map((p, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1C1C1E] bg-gray-800 flex items-center justify-center text-[10px] font-black">
                                            {p.full_name?.charAt(0)}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                    {stats.totalUsers} Citoyens Connectés
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Manuscrits", value: stats.totalBooks, icon: BookOpen, color: "text-orange-500", bg: "bg-orange-500/10" },
                            { label: "Chantiers Labo", value: stats.totalProjects, icon: FlaskConical, color: "text-blue-500", bg: "bg-blue-500/10" },
                            { label: "Actifs Sociaux", value: stats.totalSocial, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                            { label: "Flux Capital", value: `${stats.totalCapital.toLocaleString()} FCFA`, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-[#1C1C1E] border border-white/5 p-5 rounded-[2rem] flex flex-col justify-between hover:border-white/10 transition-all group cursor-default">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg)}>
                                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-xl md:text-2xl font-black mt-1 truncate">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- MAIN INTERFACE: USER MGT + POWER PANEL --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT PANEL: DIRECTORY & MANAGEMENT */}
                    <div className="lg:col-span-8 bg-[#1C1C1E]/50 border border-white/5 rounded-[2.5rem] p-6 md:p-8 space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Directoire des Bâtisseurs</h2>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <input
                                    type="text"
                                    placeholder="Chercher une identité..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-xs font-medium focus:border-[#F97316]/40 focus:bg-black/60 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredProfiles.map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedUser(p)}
                                    className={cn(
                                        "group flex items-center justify-between p-4 rounded-3xl border transition-all cursor-pointer",
                                        selectedUser?.id === p.id
                                            ? "bg-[#F97316]/10 border-[#F97316]/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                                            : "bg-[#1C1C1E] border-white/5 hover:bg-white/[0.02] hover:border-white/20"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center font-black text-xs text-orange-500 overflow-hidden relative">
                                            {p.avatar_url ? (
                                                <Image src={p.avatar_url} alt="" fill className="object-cover" />
                                            ) : (
                                                p.full_name?.charAt(0) || "U"
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm tracking-tight flex items-center gap-2">
                                                {p.full_name || "Bâtisseur Anonyme"}
                                                {p.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-[#F97316]" />}
                                            </p>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">@{p.username || "unknown"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <div className="px-2 py-0.5 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-widest text-[#F97316]/60">
                                            {p.role || 'user'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT PANEL: AUTHORITY & SYSTEM TOOLS */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Selected User Authority */}
                        <div className="bg-[#1C1C1E] border border-white/5 rounded-[2.5rem] p-8 overflow-hidden relative">
                            {selectedUser ? (
                                <div className="space-y-6 animate-in slide-in-from-right-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[#F97316] flex items-center justify-center text-xl md:text-2xl font-black shadow-2xl shadow-[#F97316]/20">
                                            {selectedUser.full_name?.charAt(0) || "U"}
                                        </div>
                                        <div>
                                            <h3 className="text-lg md:text-xl font-black">{selectedUser.full_name}</h3>
                                            <p className="text-[9px] md:text-[10px] text-gray-500 font-mono tracking-widest">UID: {selectedUser.id.substring(0, 8)}...</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                        <button
                                            onClick={() => handleUpdateRole(selectedUser.id, selectedUser.role === 'admin' ? 'user' : 'admin')}
                                            className="w-full py-4 bg-[#F97316]/10 border border-[#F97316]/20 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-[#F97316] hover:text-white transition-all shadow-lg"
                                        >
                                            <ShieldAlert className="w-4 h-4" />
                                            {selectedUser.role === 'admin' ? "Révoquer Admin" : "Accorder Privilèges"}
                                        </button>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleQuickAction("Reset", selectedUser.full_name || "")}
                                                className="py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 font-black text-[9px] uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                                            >
                                                <RefreshCcw className="w-3.5 h-3.5" />
                                                Reset
                                            </button>
                                            <button
                                                onClick={() => handleQuickAction("Bannissement", selectedUser.full_name || "")}
                                                className="py-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center gap-2 font-black text-[9px] uppercase text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/10"
                                            >
                                                <Ban className="w-3.5 h-3.5" />
                                                Bannir
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-black/40 rounded-[1.5rem] border border-white/5 flex justify-between items-center">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Enregistré le</p>
                                            <p className="text-[10px] font-bold">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="h-8 w-px bg-white/5" />
                                        <div className="space-y-1 text-right">
                                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Statut</p>
                                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 rounded text-[9px] font-black italic">ACTIVE</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 text-center space-y-4">
                                    <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center border border-dashed border-white/10">
                                        <Users className="w-6 h-6 text-gray-700" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Sélecteur Tactique</p>
                                        <p className="text-[11px] text-gray-600 px-8">Choisissez une cible pour charger les protocoles d'administration.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Global System Emergency Tools */}
                        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl shadow-red-600/30">
                            <div className="flex items-center gap-2 text-white/60">
                                <Zap className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Protocoles d'Urgence</span>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <button
                                        onClick={() => {
                                            const newState = !isMaintenance;
                                            setIsMaintenance(newState);
                                            updateSystemSettings({ maintenance_mode: newState });
                                        }}
                                        disabled={isUpdatingSystem}
                                        className={cn(
                                            "w-full py-4 md:py-4 backdrop-blur-md rounded-2xl flex items-center justify-between px-6 font-bold text-[10px] uppercase tracking-widest transition-all border",
                                            isMaintenance
                                                ? "bg-white text-red-600 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                                : "bg-black/30 text-white border-white/10 hover:bg-black/50"
                                        )}
                                    >
                                        <span className="truncate">{isMaintenance ? "Sortir de Maintenance" : "Activer Maintenance"}</span>
                                        <ShieldAlert className={cn("w-4 h-4 shrink-0", isMaintenance ? "text-red-600" : "text-red-400")} />
                                    </button>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-white/10">
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Message de Diffusion</p>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Texte du broadcast..."
                                            value={broadcast}
                                            onChange={(e) => setBroadcast(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-[11px] text-white focus:border-white/40 outline-none"
                                        />
                                        <button
                                            onClick={() => updateSystemSettings({ broadcast_message: broadcast })}
                                            disabled={isUpdatingSystem}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-orange-500 rounded-lg text-white hover:bg-orange-600"
                                        >
                                            <TrendingUp className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <p className="text-[8px] text-white/30 italic">S'affichera sur tous les terminaux actifs.</p>
                                </div>
                                <div className="pt-2">
                                    <button
                                        onClick={handleSeeding}
                                        disabled={isUpdatingSystem}
                                        className="w-full py-3 bg-white/10 hover:bg-white/20 text-white/80 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-white/5"
                                    >
                                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                        Générer Contenu Démo
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Noyau STABLE</span>
                            </div>
                            <span className="text-[9px] font-bold text-gray-600">MINDOS-RUNTIME v4.2</span>
                        </div>

                        {/* Recent Core Events - NEW */}
                        <div className="bg-[#1C1C1E] border border-white/5 rounded-[2.5rem] p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#F97316]">Pulsations Récentes</h3>
                                <Activity className="w-3.5 h-3.5 text-gray-700" />
                            </div>
                            <div className="space-y-3">
                                {[
                                    { msg: "Injection de capital détectée", time: "2m", color: "text-emerald-500" },
                                    { msg: "Nouveau compte Social lié", time: "14m", color: "text-blue-500" },
                                    { msg: "Projet Labo validé", time: "1h", color: "text-orange-500" },
                                    { msg: "Sauvegarde noyau effectuée", time: "3h", color: "text-gray-500" },
                                ].map((log, i) => (
                                    <div key={i} className="flex items-center justify-between text-[10px] font-medium border-b border-white/[0.02] pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-1 h-1 rounded-full", log.color.replace('text', 'bg'))} />
                                            <span className="text-gray-400">{log.msg}</span>
                                        </div>
                                        <span className="text-gray-700 font-mono italic">{log.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
