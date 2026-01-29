"use client";

import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Calendar,
    MoreVertical,
    Plus,
    Loader2,
    Trash2,
    Settings,
    Pencil,
    Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Task = Database['public']['Tables']['tasks']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];

const COLUMNS = [
    { id: 'todo', title: 'À faire', color: 'bg-white/5 border-white/10' },
    { id: 'in_progress', title: 'En cours', color: 'bg-orange-500/10 border-orange-500/20' },
    { id: 'done', title: 'Terminé', color: 'bg-emerald-500/10 border-emerald-500/20' }
];

export default function ProjectDetailPage() {
    const { user } = useSupabase();
    const params = useParams();
    const projectId = params.id as string;
    const router = useRouter();

    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('todo');

    // Quick Add State
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [addingTask, setAddingTask] = useState(false);

    // Edit Project State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({ title: "", description: "" });

    useEffect(() => {
        if (user) fetchData();
    }, [projectId, user]);

    const fetchData = async () => {
        if (!user) return;
        try {
            // Fetch Project
            const { data: projectData, error: projectError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .eq('user_id', user.id)
                .single();

            if (projectError) throw projectError;
            setProject(projectData);
            setEditFormData({ title: projectData.title, description: projectData.description || "" });

            // Fetch Tasks
            const { data: tasksData, error: tasksError } = await supabase
                .from('tasks')
                .select('*')
                .eq('project_id', projectId)
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (tasksError) throw tasksError;
            setTasks(tasksData || []);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            const { error } = await supabase
                .from('projects')
                .update({
                    title: editFormData.title,
                    description: editFormData.description
                })
                .eq('id', projectId)
                .eq('user_id', user.id);

            if (error) throw error;

            setProject(prev => prev ? ({ ...prev, title: editFormData.title, description: editFormData.description }) : null);
            setIsEditOpen(false);
        } catch (err) {
            alert("Erreur update");
        }
    };

    const handleDeleteProject = async () => {
        if (!user) return;
        toast.promise(
            async () => {
                await supabase.from('projects').delete().eq('id', projectId).eq('user_id', user.id);
                router.push('/studio');
            },
            {
                loading: "Suppression du projet...",
                success: "Projet supprimé ! 👋",
                error: "Impossible de supprimer le projet.",
            }
        );
    }

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        const currentTab = activeTab; // Use active tab if we add from other columns
        setAddingTask(true);

        try {
            if (!user) return;

            const { data, error } = await supabase
                .from('tasks')
                .insert({
                    title: newTaskTitle,
                    project_id: projectId,
                    user_id: user.id,
                    status: currentTab,
                    priority: 'medium'
                })
                .select()
                .single();

            if (error) throw error;

            toast.success("Mission ajoutée ! ✅");
            setTasks([...tasks, data]);
            setNewTaskTitle("");

        } catch (error) {
            toast.error("Échec de l'ajout.");
        } finally {
            setAddingTask(false);
        }
    };

    const updateTaskStatus = async (taskId: string, newStatus: string) => {
        if (!user) return;
        // Optimistic update
        const oldTasks = [...tasks];
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        try {
            const { error } = await supabase
                .from('tasks')
                .update({ status: newStatus })
                .eq('id', taskId)
                .eq('user_id', user.id);

            if (error) throw error;

        } catch (error) {
            console.error('Error updating task:', error);
            setTasks(oldTasks); // Rollback
        }
    };

    const deleteTask = async (taskId: string) => {
        if (!user) return;

        const oldTasks = [...tasks];
        setTasks(tasks.filter(t => t.id !== taskId));

        try {
            const { error } = await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', user.id);
            if (error) throw error;
            toast.success("Tâche supprimée");
        } catch (error) {
            setTasks(oldTasks);
            toast.error("Erreur suppression");
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!project) return <div>Projet introuvable</div>;

    return (
        <div className="p-6 md:p-10 min-h-screen space-y-8 animate-in fade-in duration-500 flex flex-col relative overflow-hidden">

            {/* Background Image Project (Flou) */}
            {project.image_url && (
                <div className="fixed inset-0 z-[-1]">
                    <img src={project.image_url} className="w-full h-full object-cover opacity-10 blur-3xl mix-blend-screen" />
                    <div className="absolute inset-0 bg-background/80" />
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <Link href="/studio" className="flex items-center text-muted-foreground hover:text-white transition-colors w-fit">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux Projets
                    </Link>

                    {/* Project Settings Trigger */}
                    <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <SheetTrigger asChild>
                            <button className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition">
                                <Settings className="h-5 w-5" />
                            </button>
                        </SheetTrigger>
                        <SheetContent className="bg-[#0B101B]/95 border-l border-white/10">
                            <SheetHeader>
                                <SheetTitle className="text-white">Modifier le Projet</SheetTitle>
                            </SheetHeader>
                            <div className="py-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Titre</label>
                                    <input
                                        value={editFormData.title}
                                        onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Description</label>
                                    <textarea
                                        value={editFormData.description}
                                        onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white resize-none"
                                    />
                                </div>
                                <button onClick={handleUpdateProject} className="w-full bg-primary text-black font-bold py-3 rounded-xl hover:bg-orange-400">
                                    Sauvegarder les modifications
                                </button>

                                <div className="pt-6 border-t border-white/10 mt-6">
                                    <button onClick={handleDeleteProject} className="w-full text-red-400 hover:bg-red-400/10 py-3 rounded-xl flex items-center justify-center gap-2">
                                        <Trash2 className="h-4 w-4" /> Supprimer le projet
                                    </button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="flex justify-between items-start">
                    <div className="flex items-start gap-6">
                        {/* Petite vignette image si existe */}
                        {project.image_url && (
                            <div className="h-24 w-24 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shrink-0 hidden md:block relative">
                                <Image src={project.image_url} alt="Project Cover" fill className="object-cover" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{project.title}</h1>
                            <p className="text-muted-foreground max-w-2xl">{project.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Tab Navigation (Kanban) */}
            <div className="flex md:hidden items-center gap-1.5 bg-[#1C1C1E] p-1.5 rounded-2xl border border-white/5 mb-2">
                {COLUMNS.map(col => (
                    <button
                        key={col.id}
                        onClick={() => setActiveTab(col.id)}
                        className={cn(
                            "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === col.id
                                ? "bg-white text-black shadow-lg"
                                : "text-muted-foreground hover:bg-white/5"
                        )}
                    >
                        {col.title}
                        <span className="ml-1 opacity-50">({tasks.filter(t => t.status === col.id).length})</span>
                    </button>
                ))}
            </div>

            {/* Kanban Board Container */}
            <div className="flex-1 overflow-x-hidden md:overflow-x-auto pb-4">
                <div className="flex flex-col md:flex-row gap-6 h-full">

                    {/* Colonnes */}
                    {COLUMNS.map(col => (
                        <div
                            key={col.id}
                            className={cn(
                                "flex-1 rounded-[2rem] p-6 flex flex-col gap-4 border transition-all duration-500",
                                col.color,
                                activeTab === col.id ? "flex" : "hidden md:flex"
                            )}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-black text-white uppercase tracking-widest text-xs">{col.title}</h3>
                                <span className="bg-white/10 text-[9px] font-black px-2.5 py-1 rounded-full text-muted-foreground uppercase tracking-widest">
                                    {tasks.filter(t => t.status === col.id).length} missions
                                </span>
                            </div>

                            {/* Zone de Tâches */}
                            <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
                                {tasks.filter(t => t.status === col.id).map(task => (
                                    <div key={task.id} className="bg-[#0B101B]/40 backdrop-blur-xl border border-white/5 p-5 rounded-2xl group hover:border-primary/50 transition-all shadow-xl">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-bold text-white text-sm leading-tight">{task.title}</h4>
                                            <button
                                                onClick={() => deleteTask(task.id)}
                                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {/* Actions rapides de déplacement */}
                                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                                            {col.id !== 'todo' && (
                                                <button
                                                    onClick={() => updateTaskStatus(task.id, 'todo')}
                                                    className="text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all text-muted-foreground"
                                                >
                                                    ← À faire
                                                </button>
                                            )}
                                            {col.id !== 'in_progress' && (
                                                <button
                                                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                                    className="text-[9px] font-black uppercase tracking-widest bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-3 py-1.5 rounded-lg transition-all"
                                                >
                                                    En cours
                                                </button>
                                            )}
                                            {col.id !== 'done' && (
                                                <button
                                                    onClick={() => updateTaskStatus(task.id, 'done')}
                                                    className="text-[9px] font-black uppercase tracking-widest bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg transition-all ml-auto"
                                                >
                                                    Terminé →
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Quick Add Input */}
                                <form onSubmit={handleAddTask} className="mt-2">
                                    <div className="relative group/input">
                                        <input
                                            type="text"
                                            placeholder={`+ Nouvelle mission dans ${col.title}...`}
                                            className="w-full bg-black/20 border border-dashed border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-white placeholder:text-muted-foreground/30 focus:border-primary/50 focus:bg-black/40 outline-none transition-all shadow-inner"
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                        />
                                        {addingTask && <Loader2 className="absolute right-4 top-4 h-4 w-4 animate-spin text-primary" />}
                                    </div>
                                </form>

                                {tasks.filter(t => t.status === col.id).length === 0 && !addingTask && (
                                    <div className="flex flex-col items-center justify-center py-12 opacity-20 italic">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Zone Vide</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                </div>
            </div>

        </div>
    );
}
