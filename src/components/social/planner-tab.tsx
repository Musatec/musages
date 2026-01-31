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
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Planning - Mobile Premium / PC Original */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4 p-5 md:p-0 rounded-[2rem] md:rounded-none border-2 md:border-none border-orange-500/20 bg-gradient-to-br from-orange-950/10 md:from-transparent via-zinc-900/50 md:via-transparent to-transparent backdrop-blur-xl md:backdrop-blur-none transition-all">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center shadow-2xl shrink-0">
                        <Layout className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white">PLANNING</h2>
                        <p className="text-[8px] md:text-[9px] font-bold text-zinc-500 md:text-zinc-600 uppercase tracking-widest md:tracking-[0.2em] mt-1">GÉREZ VOS CONTENUS AVEC PRÉCISION</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 bg-black/40 md:bg-zinc-900/50 p-1 rounded-xl md:rounded-2xl border border-white/5 backdrop-blur-xl shadow-2xl overflow-x-auto no-scrollbar">
                    {Object.keys(PLATFORM_CONFIG).map(p => {
                        const config = PLATFORM_CONFIG[p];
                        const Icon = config.icon;
                        return (
                            <button
                                key={p}
                                onClick={() => setSelectedPlatform(p)}
                                className={cn(
                                    "p-2 md:p-2.5 rounded-lg md:rounded-xl transition-all shrink-0 border",
                                    selectedPlatform === p
                                        ? "bg-orange-600 border-orange-400 text-white shadow-lg shadow-orange-900/40"
                                        : "border-transparent text-zinc-600 hover:text-orange-500 hover:bg-white/5"
                                )}
                                title={p}
                            >
                                <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Mobile-Only Tabs Navigation */}
            <div className="flex md:hidden items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-white/10 overflow-x-auto no-scrollbar scroll-smooth shadow-lg">
                {COLUMNS.map(col => (
                    <button
                        key={col.id}
                        onClick={() => setActiveCol(col.id)}
                        className={cn(
                            "px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shrink-0 flex items-center justify-center gap-2 flex-1 min-w-[100px]",
                            activeCol === col.id
                                ? "bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]"
                                : "text-zinc-600 hover:text-zinc-400"
                        )}
                    >
                        <span>{col.title}</span>
                    </button>
                ))}
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex flex-col md:flex-row gap-6 md:overflow-x-auto md:pb-12 scrollbar-hide min-h-[70vh]">
                    {COLUMNS.map(col => {
                        const columnPosts = posts.filter(p => p.status.toLowerCase() === col.id.toLowerCase());

                        return (
                            <div
                                key={col.id}
                                className={cn(
                                    "w-full md:min-w-[320px] md:w-[320px] flex flex-col gap-4 transition-all duration-300",
                                    activeCol !== col.id && "hidden md:flex"
                                )}
                            >
                                {/* Column Header */}
                                <div className="flex items-center justify-between px-2 md:px-0">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-2 h-2 rounded-full", col.color.replace('text', 'bg'), "shadow-[0_0_8px_currentColor]")} />
                                        <h3 className={cn("text-[10px] md:text-xs font-black uppercase tracking-[0.15em]", col.color)}>
                                            {col.title}
                                        </h3>
                                    </div>
                                    <span className="text-[9px] md:text-[10px] font-mono font-bold text-zinc-500 bg-zinc-900 border border-white/5 px-2 py-0.5 rounded-full">
                                        {columnPosts.length}
                                    </span>
                                </div>

                                {/* Droppable Area */}
                                <Droppable droppableId={col.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={cn(
                                                "flex-1 flex flex-col gap-3 p-3 rounded-2xl md:rounded-3xl border transition-all duration-500 min-h-[400px] md:min-h-[500px]",
                                                snapshot.isDraggingOver ? "bg-orange-500/5 border-orange-500/20" : "bg-[#0a0a0a] border-white/5"
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
                                                                        "group relative overflow-hidden bg-gradient-to-br from-orange-950/10 via-[#111111]/90 to-[#0a0a0a] backdrop-blur-md border border-orange-500/20 p-5 rounded-[2rem] md:rounded-[2.5rem] transition-all duration-500 shadow-2xl w-full max-w-[320px] md:max-w-none mx-auto",
                                                                        pSnapshot.isDragging
                                                                            ? "border-orange-500/60 bg-orange-950/30 rotate-1 scale-105 z-50 shadow-[0_20px_60px_rgba(234,88,12,0.4)]"
                                                                            : "hover:border-orange-500/40 hover:bg-[#161616] hover:shadow-orange-900/10"
                                                                    )}
                                                                >
                                                                    {/* Subtle Glow Background */}
                                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 blur-[50px] -mr-16 -mt-16 pointer-events-none" />

                                                                    <div className="flex justify-between items-start mb-5 relative z-10">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="w-12 h-12 rounded-2xl bg-black border border-orange-500/30 shadow-2xl flex items-center justify-center group-hover:border-orange-500/50 transition-all duration-500 group-hover:scale-110">
                                                                                <Icon className="w-6 h-6 transition-colors" style={{ color: config.brandColor }} />
                                                                            </div>
                                                                            <div className="min-w-0">
                                                                                <h4 className="text-[11px] md:text-sm font-black text-white uppercase tracking-tight truncate group-hover:text-orange-500 transition-colors">{post.title}</h4>
                                                                                <div className="flex items-center gap-2 mt-1.5">
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(234,88,12,0.8)]" />
                                                                                    <span className="text-[9px] font-black text-orange-500/60 uppercase tracking-[0.2em]">{post.status}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); deletePost(post.id); }}
                                                                            className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-rose-500 transition-all rounded-xl hover:bg-rose-500/10"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>

                                                                    <p className="text-[11px] md:text-xs text-zinc-400 leading-relaxed italic line-clamp-2 px-3 border-l-2 border-orange-500/30 mb-6 bg-white/5 py-2 rounded-lg md:rounded-xl relative z-10">
                                                                        &quot;{post.content || "Plannification en cours..."}&quot;
                                                                    </p>

                                                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 relative z-10">
                                                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-white/5">
                                                                            <Calendar className="w-3.5 h-3.5 text-orange-500/70" />
                                                                            <span className="text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                                                                {post.scheduled_date ? new Date(post.scheduled_date).toLocaleDateString() : 'DRAFT'}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 text-[9px] font-black text-orange-500 hover:text-orange-400 transition-colors uppercase tracking-widest cursor-pointer group/link">
                                                                            <span>DÉTAILS</span>
                                                                            <GripVertical className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                })}
                                            </AnimatePresence>
                                            {provided.placeholder}

                                            {/* Quick Add Button & Modal Trigger Area */}
                                            {isCreating === col.id ? (
                                                <div className="p-2 animate-in slide-in-from-top-2 duration-300">
                                                    <input
                                                        autoFocus
                                                        value={newTitle}
                                                        onChange={e => setNewTitle(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && createPost(col.id)}
                                                        placeholder="Titre de l'idée..."
                                                        className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none mb-3 focus:border-orange-500/50 transition-all shadow-inner"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => createPost(col.id)}
                                                            disabled={saving}
                                                            className="flex-1 bg-orange-600 text-white font-black text-[10px] py-3 rounded-xl uppercase flex items-center justify-center hover:bg-orange-500 transition-all active:scale-95 shadow-lg shadow-orange-900/20"
                                                        >
                                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "CAPTURER"}
                                                        </button>
                                                        <button onClick={() => setIsCreating(null)} className="px-4 bg-zinc-800 text-zinc-400 text-[10px] rounded-xl hover:bg-zinc-700 transition-all font-bold">X</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setIsCreating(col.id)}
                                                    className="w-full py-5 md:py-8 border-2 border-dashed border-white/5 rounded-3xl flex items-center justify-center text-zinc-700 hover:text-orange-500 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all group/add"
                                                >
                                                    <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" />
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
