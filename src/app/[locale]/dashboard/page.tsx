"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Target,
    Loader2,
    Zap,
    Settings2,
    FlaskConical,
    History,
    FileText,
    Share2,
    ArrowUpRight,
    Calendar,
    ChevronRight,
    Sparkles
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { useSupabase } from "@/components/providers/supabase-provider";
import { motion } from "framer-motion";

type Note = Database['public']['Tables']['notes']['Row'];
type Post = Database['public']['Tables']['posts']['Row'];

export default function DashboardPage() {
    const { user } = useSupabase();
    const router = useRouter();
    const t = useTranslations("Dashboard");
    const tWidgets = useTranslations("DashboardWidgets");
    const locale = useLocale();

    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("Créateur");

    // States for Widgets
    const [todoCount, setTodoCount] = useState<number>(0);
    const [nextPost, setNextPost] = useState<Post | null>(null);
    const [recentNotes, setRecentNotes] = useState<Note[]>([]);

    const fetchDashboardData = useCallback(async () => {
        if (!user?.id) return;
        try {
            setLoading(true);

            // 1. Fetch User Profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user?.id)
                .single();

            if (profile?.full_name) {
                setUserName(profile.full_name.split(' ')[0]);
            }

            // 2. Widget Focus: Count TODO tasks
            const { count: tasksCount } = await supabase
                .from('tasks')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', user?.id)
                .eq('status', 'TODO');

            setTodoCount(tasksCount || 0);

            // 3. Widget Growth: Next unpublished post
            const { data: postsData } = await supabase
                .from('posts')
                .select('*')
                .eq('user_id', user?.id)
                .neq('status', 'PUBLISHED')
                .order('created_at', { ascending: true })
                .limit(1)
                .maybeSingle();

            setNextPost(postsData);

            // 4. Widget Brain: 3 latest notes
            const { data: notesData } = await supabase
                .from('notes')
                .select('*')
                .eq('user_id', user?.id)
                .order('updated_at', { ascending: false })
                .limit(3);

            setRecentNotes(notesData || []);

        } catch (error) {
            console.error("Error fetching dashboard center:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id) {
            fetchDashboardData();
        }
    }, [user, fetchDashboardData]);

    const today = new Date().toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">{t('loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-background text-foreground p-4 md:p-10 space-y-6 md:space-y-8 select-none">

            {/* --- HEADER COMMAND CENTER --- */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">{tWidgets('operational_system')}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter">
                        {t('greeting_morning')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 italic capitalize">{userName}.</span>
                    </h1>
                    <p className="text-[10px] md:text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">{today}</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{tWidgets('connected_to_supabase')}</span>
                        <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4].map(i => <div key={i} className="w-4 h-1 bg-primary/20 rounded-full" />)}
                        </div>
                    </div>
                </div>
            </header>

            {/* --- CORE WIDGETS GRID --- */}
            <main className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">

                {/* 1. FOCUS DU JOUR (4 columns) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="md:col-span-4 bg-card border border-border/50 rounded-[2rem] p-6 relative overflow-hidden group hover:border-primary/30 transition-all shadow-xl shadow-black/5 flex flex-col justify-between min-h-[200px]"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Target className="w-24 h-24" />
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Zap className="w-4 h-4 text-primary" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest">{tWidgets('daily_focus')}</h3>
                        </div>

                        {todoCount > 0 ? (
                            <div className="space-y-1">
                                <div className="text-6xl font-black tracking-tighter text-foreground">{todoCount}</div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{tWidgets('missions_to_accomplish')}</p>
                            </div>
                        ) : (
                            <div className="space-y-2 pt-2">
                                <p className="text-xl font-black tracking-tight leading-tight">{tWidgets('nothing_planned')}<br /><span className="text-primary italic">{tWidgets('enjoy')}</span></p>
                            </div>
                        )}
                    </div>

                    <Link href="/pilote" className="mt-4 flex items-center justify-between text-[9px] font-black uppercase tracking-widest group/link">
                        <span className="text-muted-foreground group-hover/link:text-primary transition-colors">{tWidgets('open_pilot')}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover/link:translate-x-1 transition-all" />
                    </Link>
                </motion.div>

                {/* 2. PROCHAINE PRODUCTION (GROWTH) (8 columns) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="md:col-span-8 bg-card border border-border/50 rounded-[2rem] p-6 relative overflow-hidden group hover:border-orange-500/20 transition-all shadow-xl shadow-black/5 flex flex-col justify-between min-h-[200px]"
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                <Share2 className="w-4 h-4 text-orange-500" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest">{tWidgets('next_production')}</h3>
                        </div>

                        {nextPost ? (
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-orange-500/10 rounded-full border border-orange-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-orange-500">{nextPost.status}</span>
                                </div>
                                <h2 className="text-2xl md:text-4xl font-black tracking-tighter leading-none group-hover:text-orange-500 transition-colors line-clamp-2 capitalize">{nextPost.title}</h2>
                                <p className="text-xs text-muted-foreground font-medium flex items-center gap-3">
                                    <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {nextPost.scheduled_date ? new Date(nextPost.scheduled_date).toLocaleDateString() : tWidgets('not_planned')}</span>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span className="uppercase tracking-widest text-[9px] font-black">{nextPost.platform}</span>
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-start gap-3 pt-2">
                                <p className="text-xl font-black tracking-tight text-muted-foreground opacity-30 italic">{tWidgets('no_production_pending')}</p>
                                <button onClick={() => router.push('/social')} className="px-5 py-2.5 bg-accent/20 hover:bg-accent/40 rounded-xl text-[9px] font-black uppercase tracking-widest border border-border transition-all">{tWidgets('relaunch_planner')}</button>
                            </div>
                        )}
                    </div>

                    {nextPost && (
                        <Link href="/social" className="relative z-10 flex items-center justify-between group/btn pt-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground italic">{tWidgets('click_to_edit')}</span>
                            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover/btn:scale-110 transition-transform">
                                <ArrowUpRight className="w-4 h-4" />
                            </div>
                        </Link>
                    )}
                </motion.div>

                {/* 3. CERVEAU ACTIF (BRAIN) (7 columns) */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="md:col-span-7 bg-card border border-border/50 rounded-[2rem] p-6 flex flex-col gap-4"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                <FileText className="w-4 h-4 text-orange-500" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest">{tWidgets('active_brain')}</h3>
                        </div>
                        <Link href="/labo" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">{tWidgets('explore_all')}</Link>
                    </div>

                    <div className="grid gap-3">
                        {recentNotes.length > 0 ? recentNotes.map((note) => (
                            <Link
                                key={note.id}
                                href={`/labo?note=${note.id}`}
                                className="flex items-center justify-between p-4 rounded-xl bg-accent/5 border border-border/40 hover:bg-primary/5 hover:border-primary/20 transition-all group/note"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center group-hover/note:bg-primary/10 transition-colors">
                                        <History className="w-3.5 h-3.5 text-muted-foreground group-hover/note:text-primary transition-colors" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-black truncate max-w-[200px]">{note.title || tWidgets('untitled_note')}</h4>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 mt-0.5 capitalize">{note.folder}</p>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/note:opacity-100 transition-all" />
                            </Link>
                        )) : (
                            <div className="text-center py-8">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">{tWidgets('no_recent_note')}</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* 4. BOUTONS D'ACCÈS RAPIDE (5 columns) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="md:col-span-5 grid grid-cols-2 gap-4"
                >
                    {[
                        { label: tWidgets('quick_write'), icon: FileText, color: 'bg-orange-500', href: '/books', desc: tWidgets('desc_write') },
                        { label: tWidgets('quick_studio'), icon: FlaskConical, color: 'bg-orange-500', href: '/studio', desc: tWidgets('desc_studio') },
                        { label: tWidgets('quick_planning'), icon: Share2, color: 'bg-orange-500', href: '/social', desc: tWidgets('desc_planning') },
                        { label: tWidgets('quick_config'), icon: Settings2, color: 'bg-orange-500', href: '/settings', desc: tWidgets('desc_config') }
                    ].map((item, i) => (
                        <Link
                            key={i}
                            href={item.href}
                            className="bg-card border border-border/50 rounded-[1.5rem] p-5 flex flex-col items-start justify-between group hover:border-foreground/20 transition-all shadow-lg shadow-black/5 min-h-[120px]"
                        >
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", item.color)}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black tracking-tight">{item.label}</h4>
                                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">{item.desc}</p>
                            </div>
                        </Link>
                    ))}
                </motion.div>

            </main>

            {/* AI HUD FOOTER */}
            <footer className="pt-6 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 bg-primary/5 px-6 py-2 rounded-full border border-primary/10">
                    <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                    <p className="text-[11px] font-medium italic text-muted-foreground">
                        {todoCount > 0
                            ? `Vous avez ${todoCount} missions à traiter. Laquelle est la plus cruciale ?`
                            : "Esprit libre. Parfait pour une session d'idéation profonde dans le Labo."}
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500/40" />
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500/20" />
                    </div>
                </div>
            </footer>
        </div>
    );
}
