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
    { id: "idea", title: "Idées 💡", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { id: "scripting", title: "Scripting 📝", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { id: "filming", title: "Tournage 🎬", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    { id: "editing", title: "Montage ✂️", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    { id: "ready", title: "Prêt ✅", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
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
        } catch (error: any) {
            toast.error("Erreur chargement posts : " + (error?.message || ""));
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tight text-foreground">Planning Éditorial</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Gérez vos contenus avec précision</p>
                </div>
                <div className="flex items-center gap-3 bg-card p-1.5 rounded-2xl border border-border shadow-2xl overflow-x-auto no-scrollbar">
                    {Object.keys(PLATFORM_CONFIG).map(p => {
                        const config = PLATFORM_CONFIG[p];
                        const Icon = config.icon;
                        return (
                            <button
                                key={p}
                                onClick={() => setSelectedPlatform(p)}
                                className={cn(
                                    "p-2.5 rounded-xl transition-all",
                                    selectedPlatform === p ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
                                )}
                                title={p}
                            >
                                <Icon className="w-4 h-4" />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Column Tabs */}
            <div className="flex md:hidden items-center gap-1.5 bg-card/40 p-1.5 rounded-2xl border border-border overflow-x-auto no-scrollbar">
                {COLUMNS.map(col => (
                    <button
                        key={col.id}
                        onClick={() => setActiveCol(col.id)}
                        className={cn(
                            "px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 flex items-center gap-2",
                            activeCol === col.id
                                ? "bg-foreground text-background shadow-lg"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {col.title.split(' ')[0]}
                    </button>
                ))}
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex flex-col md:flex-row gap-6 overflow-x-auto md:pb-12 pr-4 scrollbar-hide min-h-[70vh]">
                    {COLUMNS.map(col => {
                        const columnPosts = posts.filter(p => p.status === col.id);

                        return (
                            <div
                                key={col.id}
                                className={cn(
                                    "min-w-full md:min-w-[320px] md:w-[320px] flex flex-col gap-4 transition-all duration-300",
                                    activeCol !== col.id && "hidden md:flex"
                                )}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className={cn("w-2 h-2 rounded-full", col.color.replace('text', 'bg'))} />
                                        <h3 className={cn("text-xs font-black uppercase tracking-[0.15em]", col.color)}>
                                            {col.title}
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-muted-foreground bg-card border border-border px-2.5 py-0.5 rounded-full">
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
                                                "flex-1 flex flex-col gap-4 p-4 rounded-[2.5rem] border transition-all duration-300",
                                                snapshot.isDraggingOver ? "bg-accent/10 border-primary/30" : "bg-card/40 border-border/50"
                                            )}
                                        >
                                            <AnimatePresence>
                                                {columnPosts.map((post, index) => {
                                                    const config = PLATFORM_CONFIG[post.platform] || { icon: Layout, brandColor: "currentColor" };
                                                    const Icon = config.icon;
                                                    return (
                                                        <Draggable key={post.id} draggableId={post.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={cn(
                                                                        "group bg-card border border-border p-5 rounded-3xl transition-all duration-300 shadow-xl shadow-black/5 overflow-hidden",
                                                                        snapshot.isDragging ? "border-primary bg-accent rotate-2 scale-105 z-50 shadow-2xl" : "hover:border-primary/50 hover:bg-accent/5"
                                                                    )}
                                                                >
                                                                    <div className="flex justify-between items-start mb-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center">
                                                                                <Icon className="w-4 h-4 transition-colors" style={{ color: config.brandColor }} />
                                                                            </div>
                                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">{post.platform}</span>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => deletePost(post.id)}
                                                                            className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-rose-500 transition-all"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                    <h4 className="text-sm font-bold text-foreground leading-relaxed mb-6 line-clamp-2">{post.title}</h4>

                                                                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                                                        <div className="flex items-center gap-2">
                                                                            <Calendar className="w-3.5 h-3.5 text-muted-foreground/50" />
                                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{post.scheduled_date ? new Date(post.scheduled_date).toLocaleDateString() : 'Non planifié'}</span>
                                                                        </div>
                                                                        <GripVertical className="w-4 h-4 text-muted-foreground/30 opacity-50" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                })}
                                            </AnimatePresence>
                                            {provided.placeholder}

                                            {/* Quick Add */}
                                            {isCreating === col.id ? (
                                                <div className="p-2 animate-in slide-in-from-top-2 duration-300">
                                                    <input
                                                        autoFocus
                                                        value={newTitle}
                                                        onChange={e => setNewTitle(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && createPost(col.id)}
                                                        placeholder="Titre de l'idée..."
                                                        className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm text-foreground outline-none mb-3 focus:border-primary/50 transition-all shadow-inner"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => createPost(col.id)}
                                                            disabled={saving}
                                                            className="flex-1 bg-primary text-primary-foreground font-black text-[10px] py-3 rounded-xl uppercase flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/10"
                                                        >
                                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Capturer"}
                                                        </button>
                                                        <button onClick={() => setIsCreating(null)} className="px-4 bg-muted text-muted-foreground text-[10px] rounded-xl hover:bg-accent transition-all font-bold">X</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setIsCreating(col.id)}
                                                    className="w-full py-5 border-2 border-dashed border-border rounded-3xl flex items-center justify-center text-muted-foreground/40 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all group/add"
                                                >
                                                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
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
