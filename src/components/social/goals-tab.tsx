"use client";

import { useEffect, useState } from "react";
import {
    Target,
    TrendingUp,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Globe,
    Loader2
} from "lucide-react";
import {
    SiInstagram,
    SiYoutube,
    SiTiktok,
    SiLinkedin,
    SiX
} from "react-icons/si";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Goal {
    id: string;
    platform: string;
    metric_name: string;
    current_value: number;
    target_value: number;
    deadline: string | null;
}

const PLATFORM_CONFIG: Record<string, { icon: React.ElementType, brandColor: string }> = {
    "Youtube": { icon: SiYoutube, brandColor: "#FF0000" },
    "Instagram": { icon: SiInstagram, brandColor: "#E4405F" },
    "Tiktok": { icon: SiTiktok, brandColor: "#FFFFFF" },
    "Linkedin": { icon: SiLinkedin, brandColor: "#0077B5" },
    "X / Twitter": { icon: SiX, brandColor: "#FFFFFF" },
    "Twitter": { icon: SiX, brandColor: "#FFFFFF" },
    "Website": { icon: Globe, brandColor: "#10B981" },
};

export function GoalsTab() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [form, setForm] = useState({
        platform: "Instagram",
        metric_name: "Abonnés",
        target_value: 1000,
        current_value: 0,
        deadline: ""
    });

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setGoals((data as unknown as Goal[]) || []);
        } catch {
            toast.error("Impossible de charger les objectifs");
        } finally {
            setLoading(false);
        }
    };

    const addGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Vous devez être connecté");
                return;
            }

            const payload = {
                platform: form.platform,
                metric_name: form.metric_name,
                target_value: form.target_value,
                current_value: form.current_value,
                deadline: form.deadline || null,
                user_id: user.id
            };

            const { data, error } = await supabase
                .from('goals')
                .insert(payload)
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setGoals([data as unknown as Goal, ...goals]);
                setIsAdding(false);
                setForm({ platform: "Instagram", metric_name: "Abonnés", target_value: 1000, current_value: 0, deadline: "" });
                toast.success("Nouvel objectif lancé ! 🚀");
            }
        } catch (error: unknown) {
            console.error("Add Goal Error:", error);
            const message = error instanceof Error ? error.message : "Inconnue";
            toast.error(`Erreur : ${message}`);
        } finally {
            setSaving(false);
        }
    };

    const updateValue = async (id: string, newValue: number) => {
        if (newValue < 0) return; // Basic validation

        try {
            const { error } = await supabase.from('goals').update({ current_value: newValue }).eq('id', id);
            if (error) throw error;
            setGoals(goals.map(g => g.id === id ? { ...g, current_value: newValue } : g));
            toast.success("Progression mise à jour");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "";
            toast.error("Erreur mise à jour : " + message);
        }
    };

    const deleteGoal = async (id: string) => {
        const toastId = toast.loading("Archivage de l&apos;objectif...");
        try {
            const { error } = await supabase.from('goals').delete().eq('id', id);
            if (error) throw error;
            setGoals(goals.filter(g => g.id !== id));
            toast.success("Objectif archivé", { id: toastId });
        } catch {
            toast.error("Effacement impossible", { id: toastId });
        }
    };

    if (loading) return (
        <div className="p-20 flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Synchronisation des cibles...</span>
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shadow-2xl shrink-0">
                        <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white">OBJECTIFS</h2>
                        <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">TRACKEZ VOS KPIS EN TEMPS RÉEL</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="w-fit mx-auto sm:mx-0 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase text-[9px] tracking-widest px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-orange-900/20"
                >
                    <Plus className="w-3.5 h-3.5" />
                    NOUVEAU DÉFI
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={addGoal}
                        className="bg-card border border-border p-8 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-5 gap-6 items-end overflow-hidden shadow-2xl"
                    >
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Plateforme</label>
                            <select
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary/50 transition-all cursor-pointer font-bold"
                                value={form.platform}
                                onChange={e => setForm({ ...form, platform: e.target.value })}
                            >
                                {Object.keys(PLATFORM_CONFIG).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Métrique</label>
                            <input
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary/50 transition-all font-bold"
                                placeholder="ex: Abonnés, Vues..."
                                value={form.metric_name}
                                onChange={e => setForm({ ...form, metric_name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Cible</label>
                            <input
                                type="number"
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary/50 transition-all font-bold"
                                value={form.target_value}
                                onChange={e => setForm({ ...form, target_value: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Actuel</label>
                            <input
                                type="number"
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary/50 transition-all font-bold"
                                value={form.current_value}
                                onChange={e => setForm({ ...form, current_value: parseInt(e.target.value) })}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-muted text-foreground h-[52px] font-black uppercase text-xs rounded-xl hover:bg-foreground hover:text-background transition-all flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lancer le défi"}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center justify-items-center w-full">
                {goals.map((goal, idx) => {
                    const progress = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
                    const config = PLATFORM_CONFIG[goal.platform] || { icon: Target, brandColor: "currentColor" };
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative bg-[#111111]/80 backdrop-blur-sm border border-white/5 p-4 md:p-6 rounded-2xl hover:border-primary/30 transition-all duration-500 shadow-2xl w-full max-w-[260px] sm:max-w-none mx-auto"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center p-2.5 shadow-lg shrink-0">
                                        <Icon className="w-full h-full" style={{ color: config.brandColor }} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest truncate">{goal.platform}</h3>
                                        <p className="text-sm font-black text-white uppercase tracking-tight truncate">{goal.metric_name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteGoal(goal.id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-rose-500 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-end justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-3xl md:text-4xl font-black italic tracking-tighter text-white">
                                            {goal.current_value.toLocaleString()}
                                        </span>
                                        <span className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.2em] mt-1 ml-1 truncate">
                                            OBJ: {goal.target_value.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border shadow-lg",
                                        progress >= 100 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-zinc-800 text-zinc-500 border-white/5"
                                    )}>
                                        {progress >= 100 ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                        {progress}%
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5 p-[2px]">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000",
                                            progress >= 100 ? "bg-emerald-500" : "bg-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.4)]"
                                        )}
                                    />
                                </div>

                                {/* Quick update buttons */}
                                <div className="flex items-center gap-2 pt-2 md:opacity-0 group-hover:opacity-100 transition-all transform md:translate-y-2 md:group-hover:translate-y-0">
                                    <button
                                        onClick={() => updateValue(goal.id, goal.current_value + 100)}
                                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-lg py-2 text-[8px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all active:scale-95"
                                    >
                                        +100
                                    </button>
                                    <button
                                        onClick={() => updateValue(goal.id, goal.current_value + 1000)}
                                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-lg py-2 text-[8px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all active:scale-95"
                                    >
                                        +1000
                                    </button>
                                    <button
                                        onClick={() => {
                                            const val = window.prompt("Nouvelle valeur actuelle :", goal.current_value.toString());
                                            if (val !== null && !isNaN(parseInt(val))) updateValue(goal.id, parseInt(val));
                                        }}
                                        className="px-4 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-lg py-2 text-[8px] text-zinc-400 font-black hover:text-white transition-all active:scale-95 uppercase"
                                    >
                                        EDIT
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {goals.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 bg-card border-2 border-dashed border-border rounded-[3rem] animate-in fade-in zoom-in-95 shadow-xl shadow-black/5">
                    <Target className="w-16 h-16 text-muted-foreground/20 mb-6" />
                    <h3 className="text-xl font-black text-foreground uppercase italic tracking-tighter">Aucun objectif détecté.</h3>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-2">Définit une cible pour commencer l&apos;ascension.</p>
                </div>
            )}
        </div>
    );
}
