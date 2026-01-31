"use client";

import { useEffect, useState } from "react";
import {
    Loader2,
    Play,
    Pause,
    Award,
    Dumbbell,
    Rocket,
    CheckCircle2,
    Flame,
    Calendar,
    Zap as ZapIcon,
    Wind,
    Target,
    CloudRain,
    Volume2,
    VolumeX,
    Waves
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useCallback } from "react";
import { useGamification } from "@/hooks/use-gamification";
import { useTranslations } from "next-intl";

type Task = Database['public']['Tables']['tasks']['Row'];

export default function MaJourneePage() {
    const { user } = useSupabase();
    const t = useTranslations("Focus");
    const [loading, setLoading] = useState(true);
    const [todayTasks, setTodayTasks] = useState<Task[]>([]);
    const [focusTime, setFocusTime] = useState(25 * 60);
    const [isFocusActive, setIsFocusActive] = useState(false);
    const [dailyVictory, setDailyVictory] = useState("");
    const [isVictoryDone, setIsVictoryDone] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState("IMPORTANT");
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [activeQuadrant, setActiveQuadrant] = useState('URGENT_IMPORTANT');
    const [audioMode, setAudioMode] = useState<'none' | 'alpha' | 'rain' | 'ship'>('none');
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    const { addXp } = useGamification();

    const fetchPiloteData = useCallback(async () => {
        try {
            setLoading(true);

            // 1. Get Today's Tasks
            const { data: tasksData } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false })
                .limit(20);

            setTodayTasks(tasksData || []);

            // 2. Get Daily Victory
            const { data: victoryData } = await supabase
                .from('daily_victories')
                .select('*')
                .eq('user_id', user?.id)
                .eq('victory_date', new Date().toISOString().split('T')[0])
                .maybeSingle();

            if (victoryData) {
                setDailyVictory(victoryData.title);
                setIsVictoryDone(victoryData.is_completed);
            }

        } catch (error) {
            console.error("Error fetching pilote data:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user) {
            fetchPiloteData();
        }
    }, [user, fetchPiloteData]);

    // Timer & Audio Logic
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
        if (isFocusActive && focusTime > 0) {
            interval = setInterval(() => {
                setFocusTime((prev) => prev - 1);
            }, 1000);
        } else if (focusTime === 0) {
            setIsFocusActive(false);
            if (audio) { audio.pause(); setAudioMode('none'); }
            toast.success(t('session_finished') || "Session Focus terminée ! Prenez une pause. ☕");
            addXp(100, t('session_finished')?.split('!')[0] || "Session Focus terminée");
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isFocusActive, focusTime, audio, addXp, t]);

    useEffect(() => {
        if (audio) {
            audio.pause();
            setAudio(null);
        }

        if (audioMode !== 'none' && isFocusActive) {
            const urls = {
                alpha: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                rain: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                ship: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
            };
            const newAudio = new Audio(urls[audioMode as keyof typeof urls]);
            newAudio.loop = true;
            newAudio.volume = 0.3;
            newAudio.play();
            setAudio(newAudio);
        }

        return () => {
            if (audio) audio.pause();
        };
    }, [audioMode, isFocusActive, audio]);



    const toggleTask = async (taskId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
        setTodayTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        try {
            const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId).eq('user_id', user?.id);
            if (error) throw error;

            if (newStatus === 'DONE') {
                addXp(50, t('mission_accomplished') || "Mission accomplie");
            }
        } catch {
            toast.error(t('update_error') || "Erreur mise à jour tâche");
        }
    };

    const upsertVictory = async (title: string) => {
        if (!user || !title.trim()) return;
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            await supabase.from('daily_victories').upsert({
                user_id: user.id,
                victory_date: todayStr,
                title: title,
                is_completed: isVictoryDone
            }, { onConflict: 'user_id,victory_date' });
        } catch (error) {
            console.error(error);
        }
    };

    const toggleVictory = async () => {
        if (!dailyVictory || !user) return;
        const newStatus = !isVictoryDone;
        setIsVictoryDone(newStatus);
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            await supabase.from('daily_victories').upsert({
                user_id: user.id,
                victory_date: todayStr,
                title: dailyVictory,
                is_completed: newStatus
            }, { onConflict: 'user_id,victory_date' });

            if (newStatus) {
                toast.success(t('victory_success') || "Victoire accomplie ! 🚀");
                addXp(200, t('victory_xp') || "Grande Victoire Quotidienne");
            }
        } catch {
            toast.error(t('victory_error') || "Erreur sauvegarde victoire");
        }
    };


    const addTask = async () => {
        if (!newTaskTitle.trim() || !user) return;
        setIsAddingTask(true);
        try {
            const { data, error } = await supabase.from('tasks').insert({
                user_id: user.id,
                title: newTaskTitle,
                status: 'TODO',
                priority: newTaskPriority
            }).select().single();

            if (error) throw error;
            setTodayTasks([data, ...todayTasks]);
            setNewTaskTitle("");
            toast.success(t('mission_added') || "Mission ajoutée au plan de vol !");
        } catch {
            toast.error(t('creation_error') || "Erreur création tâche");
        } finally {
            setIsAddingTask(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const quadrants = [
        { id: 'URGENT_IMPORTANT', label: t('quadrant_urgent_important'), badge: t('badge_critical'), icon: Flame, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.1)]' },
        { id: 'IMPORTANT', label: t('quadrant_important'), badge: t('badge_heart'), icon: Calendar, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.1)]' },
        { id: 'URGENT', label: t('quadrant_urgent'), badge: t('badge_fast'), icon: ZapIcon, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]' },
        { id: 'LOW', label: t('quadrant_low'), badge: t('badge_calm'), icon: Wind, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', glow: 'shadow-[0_0_20px_rgba(107,114,128,0.1)]' },
    ];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505]">
            <Loader2 className="h-8 w-8 animate-spin text-[#F97316]" />
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-[#050505] text-white p-4 md:p-12 pb-40 space-y-8 md:space-y-12 animate-in fade-in duration-700 font-sans">
            <header className="max-w-6xl mx-auto space-y-4">
                <div className="flex items-center gap-4">
                    <p className="text-[#F97316] text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] pl-1">{t('subtitle').split('.')[0]}</p>
                    <div className="h-px w-8 md:w-12 bg-white/10" />
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic leading-[0.9]">
                    {t('title').split('.')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-200">{t('title').split('.')[1] || ''}</span>
                </h1>
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 pt-2">
                    {/* Subtitle Removed as requested */}
                    <div className="flex items-center gap-3 bg-[#1C1C1E] border border-white/5 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
                        <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest">
                            {todayTasks.filter(t => t.status !== 'DONE').length} {t('remaining_missions')}
                        </span>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* 1. FOCUS ZONE (LEFT 5 COL) */}
                <div className="lg:col-span-5 space-y-8">
                    {/* POMODORO STATION */}
                    <div className="bg-[#1C1C1E] border border-white/5 rounded-[2rem] p-5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#F97316]/[0.05] to-transparent pointer-events-none" />
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Dumbbell className="w-3.5 h-3.5 text-[#F97316]" />
                                    {t('station_focus')}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    {[
                                        { id: 'none', icon: VolumeX },
                                        { id: 'alpha', icon: Waves },
                                        { id: 'rain', icon: CloudRain },
                                        { id: 'ship', icon: Volume2 }
                                    ].map((mode) => (
                                        <button
                                            key={mode.id}
                                            onClick={() => setAudioMode(mode.id as 'none' | 'alpha' | 'rain' | 'ship')}
                                            className={cn(
                                                "w-6 h-6 rounded-md flex items-center justify-center transition-all",
                                                audioMode === mode.id ? "bg-[#F97316] text-white shadow-lg shadow-[#F97316]/20" : "bg-white/5 text-gray-600 hover:text-white"
                                            )}
                                        >
                                            <mode.icon className="w-3 h-3" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => setFocusTime(25 * 60)} className="text-[8px] font-bold text-gray-600 hover:text-white transition-colors uppercase tracking-[0.1em]">{t('reset')}</button>
                        </div>

                        <div className="flex flex-col items-center justify-center py-2 space-y-6 relative z-10">
                            <div className="relative flex items-center justify-center">
                                <div className={cn(
                                    "absolute w-36 h-36 md:w-44 md:h-44 rounded-full border-2 border-white/[0.03] transition-all duration-700",
                                    isFocusActive && "animate-[spin_20s_linear_infinite]"
                                )} />
                                <div className={cn(
                                    "absolute w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-[#F97316]/20 transition-all duration-700",
                                    isFocusActive && "animate-[spin_12s_linear_infinite] border-t-[#F97316]"
                                )} />
                                <div className="flex flex-col items-center gap-1 z-20">
                                    <div className="text-4xl md:text-5xl font-black text-white tracking-widest tabular-nums">
                                        {formatTime(focusTime)}
                                    </div>
                                    {activeTask && (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-[#F97316]/10 border border-[#F97316]/20 rounded-full animate-in zoom-in duration-300">
                                            <Target className="w-3 h-3 text-[#F97316] animate-pulse" />
                                            <span className="text-[9px] font-black text-[#F97316] uppercase tracking-wider truncate max-w-[100px]">
                                                {activeTask.title}
                                            </span>
                                            <button onClick={() => setActiveTask(null)} className="text-white/40 hover:text-white ml-1">×</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsFocusActive(!isFocusActive)}
                                    className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-[#F97316] hover:text-white transition-all active:scale-95 shadow-xl"
                                >
                                    {isFocusActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                                </button>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest text-center">{t('session')}</span>
                                    <span className="text-[10px] font-black text-white text-center uppercase tracking-tighter">{t('min_session', { minutes: 25 })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4 border-t border-white/5 pt-6">
                            <div className="flex items-center gap-2">
                                <Award className="w-3 h-3 text-yellow-500" />
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">{t('morning_target')}</p>
                            </div>
                            <div className="flex items-center gap-3 bg-black/40 p-4 rounded-xl border border-white/5">
                                <input
                                    type="text"
                                    value={dailyVictory}
                                    onChange={(e) => setDailyVictory(e.target.value)}
                                    onBlur={() => upsertVictory(dailyVictory)}
                                    placeholder={t('priority_placeholder')}
                                    className={cn(
                                        "flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder:text-gray-700 transition-all",
                                        isVictoryDone ? "line-through text-gray-600" : "text-white"
                                    )}
                                />
                                <button
                                    onClick={toggleVictory}
                                    className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                        isVictoryDone ? "bg-yellow-500 text-black animate-pulse" : "bg-white/5 text-gray-600 hover:bg-white/10"
                                    )}
                                >
                                    <Rocket className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. MISSIONS & MATRIX (RIGHT 7 COL) */}
                <div className="lg:col-span-7 space-y-8">

                    {/* ADD TASK FORM */}
                    <div className="bg-[#1C1C1E] border border-white/5 rounded-[1.5rem] p-3 flex flex-col md:flex-row gap-3">
                        <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addTask()}
                            placeholder={t('new_mission_placeholder')}
                            className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-1.5 text-xs outline-none focus:border-[#F97316]/30 transition-all min-h-[40px]"
                        />
                        <div className="flex items-center gap-2">
                            <select
                                value={newTaskPriority}
                                onChange={(e) => setNewTaskPriority(e.target.value)}
                                className="flex-1 md:flex-none bg-black/40 border border-white/5 rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] outline-none cursor-pointer text-gray-400 hover:text-white transition-colors appearance-none pr-8 relative min-h-[40px]"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '0.8rem' }}
                            >
                                <option value="URGENT_IMPORTANT">{t('quadrant_urgent_important')}</option>
                                <option value="IMPORTANT">{t('quadrant_important')}</option>
                                <option value="URGENT">{t('quadrant_urgent')}</option>
                                <option value="LOW">{t('quadrant_low')}</option>
                            </select>
                            <button
                                onClick={addTask}
                                disabled={!newTaskTitle.trim() || isAddingTask}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-orange-500/20 min-h-[40px]"
                            >
                                {isAddingTask ? <Loader2 className="w-3 h-3 animate-spin" /> : t('launch')}
                            </button>
                        </div>
                    </div>

                    {/* EISENHOWER MATRIX */}
                    <div className="space-y-6">
                        {/* Mobile Tabs */}
                        <div className="flex md:hidden items-center gap-1.5 bg-[#1C1C1E] p-1.5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                            {quadrants.map((quad) => (
                                <button
                                    key={quad.id}
                                    onClick={() => setActiveQuadrant(quad.id)}
                                    className={cn(
                                        "px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 flex items-center gap-2",
                                        activeQuadrant === quad.id
                                            ? "bg-white text-black shadow-lg"
                                            : "text-gray-500 hover:text-white"
                                    )}
                                >
                                    <quad.icon className="w-3.5 h-3.5" />
                                    {quad.label.split(' ')[0]}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-fr">
                            {quadrants.map((quad) => (
                                <div
                                    key={quad.id}
                                    className={cn(
                                        "bg-zinc-900/50 backdrop-blur-xl border border-white/5 hover:bg-zinc-900/80 rounded-2xl p-4 h-full flex flex-col relative overflow-hidden transition-all duration-300",
                                        quad.id === 'URGENT_IMPORTANT' && "border-l-4 border-l-red-500",
                                        quad.id === 'IMPORTANT' && "border-l-4 border-l-orange-500",
                                        quad.id === 'URGENT' && "border-l-4 border-l-yellow-500",
                                        quad.id === 'LOW' && "border-l-4 border-l-zinc-500",
                                        activeQuadrant !== quad.id && "hidden md:flex"
                                    )}
                                >
                                    {/* Subtle Inner Glow */}
                                    {/* <div className={cn("absolute -top-12 -right-12 w-20 h-20 rounded-full blur-[35px] opacity-20 transition-all duration-500 group-hover/quad:opacity-40", quad.bg.replace('/10', ''))} /> */}

                                    <div className="flex items-center justify-between relative z-10 mb-4">
                                        <div className="flex flex-col gap-1">
                                            {/* <div className={cn("px-2.5 py-1 rounded-full text-[8px] font-black tracking-[0.2em] w-fit border", quad.bg, quad.border, quad.color)}>
                                                {quad.badge}
                                            </div> */}
                                            <div className="flex items-center gap-2">
                                                {/* <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center border", quad.bg, quad.border)}>
                                                    <quad.icon className={cn("w-3 h-3", quad.color)} />
                                                </div> */}
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.1em] text-white/90">{quad.label}</h3>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            {/* <div className="h-px w-6 bg-white/10" /> */}
                                            <span className={cn("text-2xl font-black leading-none", quad.color)}>
                                                {todayTasks.filter(t => t.priority === quad.id && t.status !== 'DONE').length}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 relative z-10 max-h-[300px] md:max-h-[160px] overflow-y-auto pr-1.5 custom-scrollbar">
                                        {todayTasks.filter(t => t.priority === quad.id && t.status !== 'DONE').length > 0 ? (
                                            todayTasks.filter(t => t.priority === quad.id && t.status !== 'DONE').map((task) => (
                                                <div
                                                    key={task.id}
                                                    onClick={() => toggleTask(task.id, task.status)}
                                                    className={cn(
                                                        "group/task relative p-3 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden",
                                                        activeTask?.id === task.id
                                                            ? "bg-[#F97316]/10 border-[#F97316]/40 shadow-lg shadow-[#F97316]/10"
                                                            : "bg-[#1C1C1E] border-white/5 hover:border-white/20 hover:bg-[#252528]"
                                                    )}
                                                >
                                                    {/* Progress Bar Background */}
                                                    <div
                                                        className="absolute bottom-0 left-0 h-0.5 bg-[#F97316] transition-all duration-500"
                                                        style={{ width: activeTask?.id === task.id ? '100%' : '0%' }}
                                                    />

                                                    <div className="flex items-center gap-3 relative z-10">
                                                        {/* Status Indicator */}
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-lg flex items-center justify-center border transition-all shrink-0",
                                                            task.status === 'DONE'
                                                                ? "bg-[#F97316] border-[#F97316] text-white"
                                                                : "bg-black/20 border-white/10 text-gray-500 group-hover/task:border-[#F97316]/50 group-hover/task:text-[#F97316]"
                                                        )}>
                                                            {task.status === 'DONE' ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <p className={cn(
                                                                "text-xs md:text-sm font-bold truncate transition-colors",
                                                                task.status === 'DONE' ? "text-gray-500 line-through" : "text-gray-200 group-hover/task:text-white"
                                                            )}>
                                                                {task.title}
                                                            </p>
                                                            {activeTask?.id === task.id && (
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-[#F97316] animate-in fade-in slide-in-from-left-2">
                                                                    Mission Active
                                                                </p>
                                                            )}
                                                        </div>

                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setActiveTask(task); }}
                                                            className={cn(
                                                                "h-8 w-8 flex items-center justify-center rounded-lg transition-all",
                                                                activeTask?.id === task.id
                                                                    ? "text-[#F97316] bg-[#F97316]/10"
                                                                    : "text-gray-600 hover:text-white hover:bg-white/10 opacity-0 group-hover/task:opacity-100"
                                                            )}
                                                        >
                                                            <Target className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-12 md:py-8 text-center border border-dashed border-white/5 rounded-[1.5rem] bg-black/10">
                                                <p className="text-[10px] md:text-[9px] text-gray-700 font-extrabold uppercase tracking-[0.2em]">{t('empty_quadrant')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* COMPACT DONE SECTION */}
                    {todayTasks.some(t => t.status === 'DONE') && (
                        <div className="bg-[#1C1C1E] border border-white/5 rounded-[2rem] p-6 space-y-4">
                            <h4 className="text-[9px] font-black text-green-500/40 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3" />
                                {t('finished_missions')}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {todayTasks.filter(t => t.status === 'DONE').map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => toggleTask(task.id, task.status)}
                                        className="flex items-center gap-2 p-2 px-3 rounded-lg bg-green-500/[0.02] border border-green-500/5 opacity-40 hover:opacity-100 transition-all cursor-pointer"
                                    >
                                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                                        <p className="text-[10px] font-bold text-gray-500 truncate line-through">{task.title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div >
    );
}
