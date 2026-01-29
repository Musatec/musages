"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import {
    Plus,
    Calendar,
    Trash2,
    GripVertical,
    Clock,
    Youtube,
    Instagram,
    Twitter,
    Linkedin,
    Facebook,
    Globe,
    Mail,
    Smartphone
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Post = Database['public']['Tables']['posts']['Row'];

const COLUMNS = [
    { id: "idea", title: "Idées & Brouillons", color: "text-amber-400", bg: "bg-amber-400/5", border: "border-amber-400/20" },
    { id: "scripting", title: "Conception & Script", color: "text-orange-400", bg: "bg-orange-400/5", border: "border-orange-400/20" },
    { id: "filming", title: "Production", color: "text-rose-400", bg: "bg-rose-400/5", border: "border-rose-400/20" },
    { id: "editing", title: "Post-Production", color: "text-red-400", bg: "bg-red-400/5", border: "border-red-400/20" },
    { id: "scheduled", title: "Planifié / Prêt", color: "text-emerald-400", bg: "bg-emerald-400/5", border: "border-emerald-400/20" },
];

const PLATFORM_ICONS: Record<string, React.ElementType> = {
    "Youtube": Youtube,
    "Instagram": Instagram,
    "Tiktok": Smartphone,
    "Linkedin": Linkedin,
    "X / Twitter": Twitter,
    "Twitter": Twitter,
    "Facebook": Facebook,
    "Blog": Globe,
    "Newsletter": Mail,
};

export function KanbanBoard({ posts, onUpdate, onEdit }: { posts: Post[], onUpdate: () => void, onEdit: (post: Post) => void }) {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const animation = requestAnimationFrame(() => setEnabled(true));
        return () => {
            cancelAnimationFrame(animation);
            setEnabled(false);
        };
    }, []);

    if (!enabled) {
        return null;
    }

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;

        if (source.droppableId !== destination.droppableId) {
            const { error } = await supabase
                .from('posts')
                .update({ status: destination.droppableId })
                .eq('id', draggableId);

            if (error) {
                toast.error("Erreur de mise à jour");
            } else {
                onUpdate();
            }
        }
    };

    const deletePost = async (id: string) => {
        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (error) {
            toast.error("Erreur de suppression");
        } else {
            toast.success("Élément supprimé");
            onUpdate();
        }
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent h-full min-h-[70vh]">
                {COLUMNS.map(col => {
                    const columnPosts = posts.filter(p => p.status === col.id);

                    return (
                        <div key={col.id} className="min-w-[320px] w-[320px] flex flex-col rounded-2xl bg-[#0A0A0A]/50 border border-white/5 backdrop-blur-sm relative group/column">

                            {/* Glow effect on column */}
                            <div className={cn("absolute -inset-[1px] rounded-2xl opacity-0 group-hover/column:opacity-100 transition-opacity duration-500 pointer-events-none z-0", col.bg, "blur-sm")} />

                            {/* Column Header */}
                            <div className="relative z-10 p-4 border-b border-white/5 flex items-center justify-between bg-[#0A0A0A]/80 backdrop-blur-md rounded-t-2xl">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-2 h-2 rounded-full", col.color.replace('text', 'bg'))} />
                                    <h3 className={cn("text-xs font-bold uppercase tracking-widest", col.color)}>
                                        {col.title}
                                    </h3>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-500 text-[10px] font-mono border border-white/5">
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
                                            "relative z-10 flex-1 p-3 space-y-3 overflow-y-auto scrollbar-hide transition-colors duration-200",
                                            snapshot.isDraggingOver ? "bg-white/[0.02]" : ""
                                        )}
                                    >
                                        {columnPosts.map((post, index) => {
                                            const Icon = PLATFORM_ICONS[post.platform] || Globe;

                                            return (
                                                <Draggable key={post.id} draggableId={post.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => onEdit(post)}
                                                            className={cn(
                                                                "group relative bg-[#141414] p-4 rounded-xl border border-white/5 transition-all duration-200 cursor-pointer",
                                                                snapshot.isDragging ? "shadow-2xl shadow-black/50 border-white/20 rotate-1 scale-105" : "hover:border-white/10 hover:-translate-y-0.5 shadow-lg"
                                                            )}
                                                        >
                                                            {/* Card Decoration */}
                                                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm("Supprimer ce projet ?")) deletePost(post.id);
                                                                    }}
                                                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </button>
                                                            </div>

                                                            {/* Platform Badge */}
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                                                                    <Icon className="w-3 w-3 text-gray-400 group-hover:text-white transition-colors" />
                                                                </div>
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-gray-300 transition-colors">
                                                                    {post.platform}
                                                                </span>
                                                            </div>

                                                            <h4 className="font-semibold text-white text-sm leading-relaxed mb-4 group-hover:text-orange-400 transition-colors">
                                                                {post.title}
                                                            </h4>

                                                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                                                {post.scheduled_date ? (
                                                                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
                                                                        <Calendar className="h-3 w-3" />
                                                                        <span>{new Date(post.scheduled_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600">
                                                                        <Clock className="h-3 w-3" />
                                                                        <span>Pas de date</span>
                                                                    </div>
                                                                )}

                                                                <GripVertical className="h-3 w-3 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}

                                        {columnPosts.length === 0 && (
                                            <div className="h-24 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center opacity-20">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
}
