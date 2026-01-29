"use client";

import { useState, useRef } from "react";
import {
    Plus,
    Camera,
    FileText,
    CheckCircle2,
    Lightbulb,
    X,
    Loader2,
    Wallet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";
import { CATEGORIES } from "@/components/studio/constants";
import { CategoryId } from "@/types/studio";
import { NewTransactionSheet } from "@/components/capital/new-transaction-sheet";

export function MobileFab() {
    const [isOpen, setIsOpen] = useState(false);

    // Dialog States
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
    const [isStudioDialogOpen, setIsStudioDialogOpen] = useState(false);
    const [isTransactionSheetOpen, setIsTransactionSheetOpen] = useState(false);

    // Content States
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newNoteContent, setNewNoteContent] = useState("");

    // Studio Capture States
    const [studioText, setStudioText] = useState("");
    const [studioCategory, setStudioCategory] = useState<CategoryId>("idea");
    const [studioImage, setStudioImage] = useState<File | null>(null);

    // Loading States
    const [isSubmittingTask, setIsSubmittingTask] = useState(false);
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);

    const router = useRouter();
    const { user } = useSupabase();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isSaving = isSubmittingTask || isSubmittingNote || isCapturing;

    // --- ACTIONS ---

    const handleStudioCapture = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!studioText.trim() && !studioImage) || !user) return;

        setIsCapturing(true);
        const toastId = toast.loading("Sauvegarde de la découverte...");

        try {
            let imageUrl = null;
            if (studioImage) {
                const fileExt = studioImage.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('project-images')
                    .upload(fileName, studioImage);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage.from('project-images').getPublicUrl(fileName);
                imageUrl = publicUrl;
            }

            // Smart Title Logic (similar to studio page)
            let title = "Nouvelle découverte";
            const catObj = CATEGORIES.find(c => c.id === studioCategory);
            if (catObj) title = `${catObj.label}`;

            if (studioText) {
                if (studioText.startsWith('http')) {
                    try {
                        const url = new URL(studioText);
                        title = url.hostname.replace('www.', '');
                        if (studioCategory === 'idea') setStudioCategory('link');
                    } catch { title = "Lien Web"; }
                } else {
                    title = studioText.split('\n')[0].substring(0, 40);
                }
            }

            const { error: dbError } = await supabase.from('projects').insert({
                title,
                description: studioText,
                category: studioCategory,
                image_url: imageUrl,
                user_id: user.id,
                status: 'idée',
                progress: 0
            });

            if (dbError) throw dbError;

            toast.success("Découverte capturée dans le Studio ! 🚀", { id: toastId });

            // Reset & Close
            setStudioText("");
            setStudioImage(null);
            setStudioCategory("idea");
            setIsStudioDialogOpen(false);
        } catch (error: any) {
            console.error(error);
            toast.error("Erreur capture : " + error.message, { id: toastId });
        } finally {
            setIsCapturing(false);
        }
    };

    const handleQuickTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !user) return;

        setIsSubmittingTask(true);
        try {
            const { error } = await supabase.from('tasks').insert({
                title: newTaskTitle.trim(),
                priority: 'URGENT_IMPORTANT',
                user_id: user.id,
                status: 'TODO',
                due_date: new Date().toISOString().split('T')[0]
            });

            if (error) throw error;

            toast.success("Mission ajoutée au Pilote ! ✅");
            setNewTaskTitle("");
            setIsTaskDialogOpen(false);
        } catch (error: any) {
            toast.error("Erreur mission : " + error.message);
        } finally {
            setIsSubmittingTask(false);
        }
    };

    const handleQuickNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNoteContent.trim() || !user) return;

        setIsSubmittingNote(true);
        try {
            // Find or create a default folder
            let folderId = null;
            const { data: folders } = await supabase.from('folders').select('id').eq('user_id', user.id).limit(1);

            if (folders && folders.length > 0) {
                folderId = folders[0].id;
            } else {
                const { data: newFolder } = await supabase.from('folders').insert({ name: "Général", user_id: user.id }).select().single();
                folderId = newFolder?.id;
            }

            const now = new Date();
            const dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

            const { error } = await supabase.from('notes').insert({
                title: `Note Rapide - ${dateStr}`,
                content: newNoteContent.trim(),
                folder_id: folderId,
                user_id: user.id
            });

            if (error) throw error;

            toast.success("Idée capturée dans le Labo ! 🧠");
            setNewNoteContent("");
            setIsNoteDialogOpen(false);
        } catch (error: any) {
            toast.error("Erreur note : " + error.message);
        } finally {
            setIsSubmittingNote(false);
        }
    };

    const menuItems = [
        {
            id: "studio",
            icon: Plus,
            label: "Nouvelle Découverte",
            color: "bg-primary",
            onClick: () => {
                setIsStudioDialogOpen(true);
                setIsOpen(false);
            },
            delay: 0
        },
        {
            id: "capital",
            icon: Wallet,
            label: "Dépense 💸",
            color: "bg-emerald-500",
            onClick: () => {
                setIsTransactionSheetOpen(true);
                setIsOpen(false);
            },
            delay: 0.05
        }
    ];

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[90] md:hidden"
                    />
                )}
            </AnimatePresence>

            <div className="fixed bottom-24 right-4 z-[100] md:hidden">
                {/* Actions Menu */}
                <div className="absolute bottom-16 right-0 flex flex-col items-end gap-4">
                    <AnimatePresence>
                        {isOpen && menuItems.map((item) => (
                            <motion.button
                                key={item.id}
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25, delay: item.delay }}
                                onClick={item.onClick}
                                className="flex items-center gap-4 group pr-1"
                            >
                                <span className="bg-[#1C1C1E] border border-white/10 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl">
                                    {item.label}
                                </span>
                                <div className={cn(
                                    "w-12 h-12 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl transition-transform active:scale-95",
                                    item.color
                                )}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Main FAB Toggle */}
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                        "w-12 h-12 rounded-[1.5rem] flex items-center justify-center text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 relative overflow-hidden",
                        isOpen ? "bg-[#2C2C2E] ring-4 ring-white/5" : "bg-primary"
                    )}
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                            >
                                <X className="w-5 h-5" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="open"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                className="relative flex items-center justify-center"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Plus className="w-6 h-6" />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>

            {/* Studio Capture Dialog */}
            <AnimatePresence>
                {isStudioDialogOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 md:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsStudioDialogOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-lg"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#1C1C1E] w-full max-w-sm rounded-[2.5rem] border border-white/10 p-6 shadow-2xl relative z-10 flex flex-col gap-6"
                        >
                            <div>
                                <h2 className="text-xl font-black italic uppercase tracking-tighter mb-1 text-primary">Nouvelle Découverte</h2>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Enrichissez votre Studio</p>
                            </div>

                            <form onSubmit={handleStudioCapture} className="space-y-6">
                                {/* Categories */}
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setStudioCategory(cat.id)}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-3 rounded-2xl border min-w-[70px] transition-all",
                                                studioCategory === cat.id
                                                    ? "bg-white/10 border-white/20 text-white"
                                                    : "bg-transparent border-white/5 text-gray-500"
                                            )}
                                        >
                                            <cat.icon className={cn("w-5 h-5", studioCategory === cat.id ? cat.color : "text-gray-600")} />
                                            <span className="text-[8px] font-black uppercase tracking-wider">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Text Input */}
                                <textarea
                                    autoFocus
                                    placeholder={
                                        studioCategory === 'idea' ? "Une idée brillante..." :
                                            studioCategory === 'link' ? "https://..." :
                                                "Description de votre découverte..."
                                    }
                                    value={studioText}
                                    onChange={(e) => setStudioText(e.target.value)}
                                    rows={3}
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm font-medium placeholder:text-muted-foreground/30 focus:border-primary/50 outline-none resize-none"
                                />

                                {/* Image Input */}
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl border border-dashed flex items-center justify-center gap-2 transition-all",
                                            studioImage ? "border-primary/50 bg-primary/10 text-primary" : "border-white/10 text-gray-500 hover:text-white"
                                        )}
                                    >
                                        <Camera className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{studioImage ? "Image chargée" : "Ajouter Image"}</span>
                                    </button>
                                    {studioImage && (
                                        <button type="button" onClick={() => setStudioImage(null)} className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && setStudioImage(e.target.files[0])}
                                />

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsStudioDialogOpen(false)}
                                        className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={(!studioText.trim() && !studioImage) || isCapturing}
                                        className="flex-[2] py-4 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        {isCapturing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Capturer"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Quick Task Dialog */}
            <AnimatePresence>
                {isTaskDialogOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 md:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsTaskDialogOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-lg"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#1C1C1E] w-full max-w-sm rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative z-10"
                        >
                            <h2 className="text-xl font-black italic uppercase tracking-tighter mb-1 text-primary">Mission Flash</h2>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Ajouter au Pilote</p>

                            <form onSubmit={handleQuickTask} className="space-y-6">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Titre de la mission..."
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-lg font-bold placeholder:text-muted-foreground/30 focus:border-primary/50 outline-none"
                                />
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsTaskDialogOpen(false)}
                                        className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newTaskTitle.trim() || isSubmittingTask}
                                        className="flex-[2] py-4 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        {isSubmittingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : "Valider"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Quick Note Dialog */}
            <AnimatePresence>
                {isNoteDialogOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 md:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsNoteDialogOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-lg"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#1C1C1E] w-full max-w-sm rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative z-10"
                        >
                            <h2 className="text-xl font-black italic uppercase tracking-tighter mb-1 text-orange-400">Capture Cognitive</h2>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Ajouter au Labo</p>

                            <form onSubmit={handleQuickNote} className="space-y-6">
                                <textarea
                                    autoFocus
                                    placeholder="Écrivez votre idée ici..."
                                    value={newNoteContent}
                                    onChange={(e) => setNewNoteContent(e.target.value)}
                                    rows={4}
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium placeholder:text-muted-foreground/30 focus:border-orange-500/50 outline-none resize-none"
                                />
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsNoteDialogOpen(false)}
                                        className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newNoteContent.trim() || isSubmittingNote}
                                        className="flex-[2] py-4 rounded-2xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2"
                                    >
                                        {isSubmittingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Transaction Sheet */}
            <NewTransactionSheet
                open={isTransactionSheetOpen}
                onOpenChange={setIsTransactionSheetOpen}
            />
        </>
    );
}
