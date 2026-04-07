"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import {
    Plus,
    Calendar,
    Trash2,
    GripVertical,
    Layout,
    Loader2
} from "lucide-react";
import {
    SiInstagram,
    SiYoutube,
    SiTiktok,
    SiLinkedin,
    SiFacebook,
    SiX
} from "react-icons/si";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";

type Post = Database['public']['Tables']['posts']['Row'];

const COLUMNS = [
    { id: "idea", title: "IDEAS", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { id: "scripting", title: "SCRIPTS", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { id: "filming", title: "SHOOT", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    { id: "editing", title: "EDIT", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    { id: "ready", title: "READY", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
];

const PLATFORM_CONFIG: Record<string, { icon: React.ElementType, brandColor: string }> = {
    "Youtube": { icon: SiYoutube, brandColor: "#FF0000" },
    "Instagram": { icon: SiInstagram, brandColor: "#E4405F" },
    "Tiktok": { icon: SiTiktok, brandColor: "#FFFFFF" },
    "Linkedin": { icon: SiLinkedin, brandColor: "#0077B5" },
    "X / Twitter": { icon: SiX, brandColor: "#FFFFFF" },
    "Facebook": { icon: SiFacebook, brandColor: "#1877F2" },
};

export function PlannerTab() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [enabled, setEnabled] = useState(false);
    const [isCreating, setIsCreating] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const [selectedPlatform, setSelectedPlatform] = useState("Instagram");
    const [activeCol, setActiveCol] = useState("idea");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPosts();
        const animation = requestAnimationFrame(() => setEnabled(true));
        return () => {
            cancelAnimationFrame(animation);
            setEnabled(false);
        };
    }, []);

    const fetchPosts = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erreur inconnue";
            toast.error("Erreur chargement posts : " + message);
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;

        if (source.droppableId !== destination.droppableId) {
            const newPosts = Array.from(posts);
            const postIdx = newPosts.findIndex(p => p.id === draggableId);
            if (postIdx > -1) {
                newPosts[postIdx].status = destination.droppableId;
                setPosts(newPosts);
            }

            const { error } = await supabase
                .from('posts')
                .update({ status: destination.droppableId })
                .eq('id', draggableId);

            if (error) {
                toast.error("Erreur de déplacement SQL");
                fetchPosts();
            }
        }
    };

    const createPost = async (status: string) => {
        if (!newTitle.trim()) {
            toast.error("Donnez un titre à votre idée");
            return;
        }

        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Utilisateur non authentifié");
                return;
            }

            const { data, error } = await supabase.from('posts').insert({
                title: newTitle,
                platform: selectedPlatform,
                status: status,
                user_id: user.id
            }).select().single();

            if (error) throw error;

            if (data) {
                setPosts([data, ...posts]);
                setNewTitle("");
                setIsCreating(null);
                toast.success("Post ajouté au planning ! ✨");
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "";
            toast.error("Erreur de création : " + message);
        } finally {
            setSaving(false);
        }
    };

    const deletePost = async (id: string) => {
        try {
            const { error } = await supabase.from('posts').delete().eq('id', id);
            if (error) throw error;
            setPosts(posts.filter(p => p.id !== id));
            toast.success("Post supprimé");
        } catch {
            toast.error("Échec de suppression");
        }
    };

    if (!enabled || loading) return (
        <div className="p-20 flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Initialisation du plateau...</span>
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Planning - Elite Command Panel */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-10 border-b border-border/40 pb-10">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-xl shadow-primary/5 shrink-0 group hover:bg-primary transition-all duration-500">
                        <Layout className="w-6 h-6 text-primary group-hover:text-black transition-colors" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground leading-none">Social <span className="text-primary tracking-tight">Protocol.</span></h2>
                        <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.4em] italic leading-none">ORCHESTRATION ALPHA | CONTENT SYNC</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-card border border-border/50 rounded-[2rem] shadow-xl overflow-x-auto no-scrollbar scroll-smooth">
                    {Object.keys(PLATFORM_CONFIG).map(p => {
                        const config = PLATFORM_CONFIG[p];
                        const Icon = config.icon;
                        return (
                            <button
                                key={p}
                                onClick={() => setSelectedPlatform(p)}
                                className={cn(
                                    "px-5 py-3 rounded-2xl transition-all duration-500 shrink-0 border flex items-center gap-3",
                                    selectedPlatform === p
                                        ? "bg-primary border-primary text-black shadow-lg shadow-primary/20 scale-105 italic"
                                        : "border-transparent text-muted-foreground/40 hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                <span className={cn("text-[9px] font-black uppercase tracking-widest", selectedPlatform === p ? "block" : "hidden md:block")}>{p}</span>
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* Mobile-Only Tabs Navigation - Elite Fluid */}
            <div className="flex md:hidden items-center gap-2 bg-muted/20 p-2 rounded-2xl border border-border/40 overflow-x-auto no-scrollbar scroll-smooth shadow-inner">
                {COLUMNS.map(col => (
                    <button
                        key={col.id}
                        onClick={() => setActiveCol(col.id)}
                        className={cn(
                            "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 flex items-center justify-center gap-3 flex-1 min-w-[120px]",
                            activeCol === col.id
                                ? "bg-primary text-black shadow-2xl shadow-primary/20 italic"
                                : "text-muted-foreground/40"
                        )}
                    >
                        <div className={cn("w-2 h-2 rounded-full", col.id === activeCol ? "bg-black" : col.id.includes('idea') ? "bg-amber-500" : "bg-primary")} />
                        <span>{col.title}</span>
                    </button>
                ))}
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex flex-col md:flex-row gap-10 md:overflow-x-auto md:pb-12 no-scrollbar min-h-[75vh]">
                    {COLUMNS.map(col => {
                        const columnPosts = posts.filter(p => p.status.toLowerCase() === col.id.toLowerCase());

                        return (
                            <div
                                key={col.id}
                                className={cn(
                                    "w-full md:min-w-[360px] md:w-[360px] flex flex-col gap-6 transition-all duration-500",
                                    activeCol !== col.id && "hidden md:flex"
                                )}
                            >
                                {/* Column Header - Elite Density */}
                                <div className="flex items-center justify-between px-4">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-3 h-3 rounded-full", col.color.replace('text', 'bg'), "shadow-[0_0_12px_currentColor] animate-pulse")} />
                                        <h3 className={cn("text-[11px] font-black uppercase tracking-[0.25em] italic", col.color)}>
                                            {col.title}
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-mono font-black text-muted-foreground/30 bg-muted/30 border border-border/50 px-3 py-1 rounded-full shadow-inner">
                                        {columnPosts.length < 10 ? `0${columnPosts.length}` : columnPosts.length}
                                    </span>
                                </div>

                                {/* Droppable Area - Industrial Performance */}
                                <Droppable droppableId={col.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={cn(
                                                "flex-1 flex flex-col gap-5 p-5 rounded-[2.5rem] border transition-all duration-700 min-h-[500px] relative overflow-hidden group/drop",
                                                snapshot.isDraggingOver ? "bg-primary/5 border-primary/20 shadow-2xl" : "bg-muted/10 border-border/40 hover:border-border transition-colors shadow-inner"
                                            )}
                                        >
                                            <AnimatePresence mode="popLayout">
                                                {columnPosts.map((post, index) => {
                                                    const config = PLATFORM_CONFIG[post.platform] || { icon: Layout, brandColor: "currentColor" };
                                                    const Icon = config.icon;
                                                    return (
                                                        <Draggable key={post.id} draggableId={post.id} index={index}>
                                                            {(pProvided, pSnapshot) => (
                                                                <div
                                                                    ref={pProvided.innerRef}
                                                                    {...pProvided.draggableProps}
                                                                    {...pProvided.dragHandleProps}
                                                                    className={cn(
                                                                        "group relative overflow-hidden bg-card border border-border/50 p-6 rounded-[2.5rem] transition-all duration-500 shadow-xl w-full",
                                                                        pSnapshot.isDragging
                                                                            ? "border-primary bg-primary/10 rotate-2 scale-105 z-50 shadow-[0_25px_60px_rgba(var(--primary-rgb),0.3)]"
                                                                            : "hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 hover:translate-y-[-4px]"
                                                                    )}
                                                                >
                                                                    {/* Elite Top Indicator */}
                                                                    <div className="absolute top-0 left-0 w-full h-[6px] transition-all group-hover:h-2" style={{ backgroundColor: config.brandColor }} />

                                                                    <div className="flex justify-between items-start mb-6 pt-2">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border/30 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all duration-500 group-hover:scale-110 shadow-inner overflow-hidden">
                                                                                <Icon className="w-5 h-5 transition-colors" />
                                                                            </div>
                                                                            <div className="min-w-0">
                                                                                <h4 className="text-[13px] font-black text-foreground uppercase tracking-tight truncate italic group-hover:text-primary transition-colors leading-none">{post.title}</h4>
                                                                                <div className="flex items-center gap-2 mt-2">
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                                                    <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">{post.platform} SYNC</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); deletePost(post.id); }}
                                                                            className="opacity-0 group-hover:opacity-100 p-3 text-muted-foreground/40 hover:text-red-500 transition-all rounded-2xl hover:bg-red-500/10 active:scale-90"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>

                                                                    <div className="relative mb-6">
                                                                        <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-muted/20" />
                                                                        <p className="text-[12px] text-muted-foreground/60 leading-relaxed italic line-clamp-3 pl-6 font-medium">
                                                                            {post.content || "Plannification stratégique en attente d'approbation logicielle..."}
                                                                        </p>
                                                                    </div>

                                                                    <div className="flex items-center justify-between mt-auto pt-5 border-t border-border/30 overflow-hidden">
                                                                        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-muted/20 border border-border/20 shadow-inner group/date hover:bg-primary hover:border-primary transition-all">
                                                                            <Calendar className="w-4 h-4 text-primary group-hover/date:text-black transition-colors" />
                                                                            <span className="text-[9px] font-mono font-black text-muted-foreground group-hover/date:text-black uppercase tracking-widest mt-0.5">
                                                                                {post.scheduled_date ? new Date(post.scheduled_date).toLocaleDateString() : 'NO SCHEDULE'}
                                                                            </span>
                                                                        </div>
                                                                        <div className="p-2 rounded-xl bg-card border border-border group/grip hover:bg-primary transition-all opacity-20 group-hover:opacity-100">
                                                                             <GripVertical className="w-4 h-4 text-foreground/40 group-hover/grip:text-black" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                })}
                                            </AnimatePresence>
                                            {provided.placeholder}

                                            {/* Quick Add Area - Industrial Protocol */}
                                            {isCreating === col.id ? (
                                                <div className="mt-4 p-5 bg-card border border-primary/20 rounded-[2rem] shadow-2xl animate-in slide-in-from-top-4 duration-500">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary italic">Nouveau Draft Protocol</span>
                                                    </div>
                                                    <input
                                                        autoFocus
                                                        value={newTitle}
                                                        onChange={e => setNewTitle(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && createPost(col.id)}
                                                        placeholder="TITRE DE L'IDÉE..."
                                                        className="w-full bg-muted/5 border border-border/50 rounded-2xl px-6 py-5 text-[11px] font-black uppercase tracking-widest text-foreground outline-none mb-4 focus:border-primary/50 transition-all shadow-inner italic"
                                                    />
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => createPost(col.id)}
                                                            disabled={saving}
                                                            className="flex-1 bg-primary text-black font-black text-[10px] py-4 rounded-xl uppercase tracking-[0.3em] flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/20 italic"
                                                        >
                                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "ACTIVER DRAFT"}
                                                        </button>
                                                        <button onClick={() => setIsCreating(null)} className="px-5 bg-muted/50 text-muted-foreground/40 text-[10px] rounded-xl hover:bg-muted transition-all font-black uppercase">X</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setIsCreating(col.id)}
                                                    className="w-full py-10 border-2 border-dashed border-border/20 rounded-[3rem] flex flex-col items-center justify-center gap-4 text-muted-foreground/20 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all group/add group-hover/drop:border-primary/20"
                                                >
                                                    <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center group-hover/add:scale-110 group-hover/add:rotate-90 transition-all duration-500 shadow-xl">
                                                        <Plus className="w-6 h-6 stroke-[3]" />
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase tracking-[0.4em] italic opacity-0 group-hover/add:opacity-100 transition-all">Nouveau Protocole</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>
        </div>
    );
}
