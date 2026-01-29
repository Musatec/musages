"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";
import { DrillDownSidebar } from "@/components/notes/drilldown-sidebar";
import { NoteEditor } from "@/components/notes/editor";
import {
    Menu,
    FlaskConical,
    Plus,
    FileText,
    ChevronRight,
    Maximize2,
    Minimize2,
    AlertCircle,
    Check,
    Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";

type Note = Database['public']['Tables']['notes']['Row'];
type Folder = Database['public']['Tables']['folders']['Row'];

export default function LaboPage() {
    const { user } = useSupabase();

    // --- NOTES STATE ---
    const [folders, setFolders] = useState<Folder[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [loading, setLoading] = useState(true);

    // --- DIALOG STATE ---
    const [dialog, setDialog] = useState<{
        isOpen: boolean;
        title: string;
        placeholder: string;
        value: string;
        onConfirm: (val: string) => void;
        type: 'input' | 'confirm';
        confirmLabel?: string;
    }>({
        isOpen: false,
        title: "",
        placeholder: "",
        value: "",
        onConfirm: () => { },
        type: 'input'
    });

    const handleCreateNoteWithFolder = useCallback(async (folderId: string) => {
        if (!user) return;
        setDialog({
            isOpen: true,
            title: "Nouvelle Note Express",
            placeholder: "Titre de la note...",
            value: "",
            type: 'input',
            onConfirm: async (title) => {
                if (title && user) {
                    const { data, error } = await supabase.from('notes').insert({
                        title,
                        content: "",
                        folder_id: folderId,
                        user_id: user.id
                    }).select().single();

                    if (!error && data) {
                        toast.success("Note créée ! 🧠");
                        setNotes(prev => [data, ...prev]);
                        setSelectedNote(data);
                    }
                }
            }
        });
    }, [user]);

    // Check for "new=true" in URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('new') === 'true' && folders.length > 0 && !selectedNote && !loading) {
            const targetFolder = folders[0].id;
            setSelectedFolderId(targetFolder);
            handleCreateNoteWithFolder(targetFolder);
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [folders, selectedNote, loading, handleCreateNoteWithFolder]);

    // --- FETCH DATA ---
    const fetchNotesData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data: f } = await supabase
                .from('folders')
                .select('*')
                .eq('user_id', user.id)
                .order('name');
            if (f) setFolders(f);

            const { data: n } = await supabase
                .from('notes')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });
            if (n) setNotes(n);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchNotesData();
        }
    }, [user, fetchNotesData]);

    // --- NOTES ACTIONS ---
    const handleCreateFolder = () => {
        setDialog({
            isOpen: true,
            title: "Nouveau Dossier",
            placeholder: "Nom du dossier...",
            value: "",
            type: 'input',
            onConfirm: async (name) => {
                if (name && user) {
                    const { error } = await supabase.from('folders').insert({ name, user_id: user.id });
                    if (error) {
                        toast.error("Échec de la création du dossier.");
                    } else {
                        toast.success("Dossier créé ! 📂");
                        fetchNotesData();
                    }
                }
            }
        });
    };

    const handleRenameFolder = (folder: Folder, e: React.MouseEvent) => {
        e.stopPropagation();
        setDialog({
            isOpen: true,
            title: "Renommer le dossier",
            placeholder: "Nouveau nom...",
            value: folder.name,
            type: 'input',
            onConfirm: async (name) => {
                if (name && user) {
                    const { error } = await supabase.from('folders').update({ name }).eq('id', folder.id).eq('user_id', user.id);
                    if (error) {
                        toast.error("Erreur lors du renommage.");
                    } else {
                        toast.success("Dossier renommé !");
                        fetchNotesData();
                    }
                }
            }
        });
    };

    const handleDeleteFolder = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDialog({
            isOpen: true,
            title: "Supprimer le dossier",
            placeholder: "Cette action est irréversible et supprimera toutes les notes à l'intérieur.",
            value: "",
            type: 'confirm',
            confirmLabel: "Supprimer tout",
            onConfirm: async () => {
                if (!user) return;
                const toastId = toast.loading("Suppression en cours...");
                try {
                    const { error: noteErr } = await supabase.from('notes').delete().eq('folder_id', id).eq('user_id', user.id);
                    if (noteErr) throw noteErr;

                    const { error: folderErr } = await supabase.from('folders').delete().eq('id', id).eq('user_id', user.id);
                    if (folderErr) throw folderErr;

                    toast.success("Dossier supprimé ! 👋", { id: toastId });
                    if (selectedFolderId === id) setSelectedFolderId(null);
                    fetchNotesData();
                } catch {
                    toast.error("Erreur de suppression.", { id: toastId });
                }
            }
        });
    };

    const handleCreateNote = async () => {
        if (!user) return;

        // Si aucun dossier n'existe, on force la création d'un dossier
        if (folders.length === 0) {
            toast.error("Veuillez créer un dossier 'Général' ou autre avant de créer un projet !", {
                action: {
                    label: "Créer Dossier",
                    onClick: handleCreateFolder
                },
                duration: 5000
            });
            return;
        }

        // Auto-select first folder if none selected
        let targetFolderId = selectedFolderId;
        if (!targetFolderId) {
            targetFolderId = folders[0].id;
            setSelectedFolderId(targetFolderId);
        }

        setDialog({
            isOpen: true,
            title: "Nouveau Projet",
            placeholder: "Titre du projet...",
            value: "",
            type: 'input',
            onConfirm: async (title) => {
                if (title) {
                    const folderName = folders.find(f => f.id === targetFolderId)?.name || "Général";

                    const newNote = {
                        title: title.trim(),
                        content: "",
                        folder: folderName, // Required by DB constraint likely
                        folder_id: targetFolderId,
                        user_id: user.id,
                        is_favorite: false
                    };

                    const { data, error } = await supabase
                        .from('notes')
                        .insert(newNote)
                        .select()
                        .single();

                    if (error) {
                        console.error("Error creating note:", error);
                        toast.error("Impossible de créer le projet. Vérifiez votre connexion.");
                    } else if (data) {
                        toast.success("Projet créé ! 📝");
                        setNotes([data, ...notes]);
                        setSelectedNote(data);
                    }
                }
            }
        });
    };

    const handleDeleteNote = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDialog({
            isOpen: true,
            title: "Supprimer le projet",
            placeholder: "Voulez-vous vraiment effacer ce projet ?",
            value: "",
            type: 'confirm',
            confirmLabel: "Supprimer",
            onConfirm: async () => {
                if (!user) return;
                const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', user.id);
                if (error) {
                    toast.error("Erreur lors de la suppression.");
                } else {
                    toast.success("Projet supprimé.");
                    setNotes(notes.filter(n => n.id !== id));
                    if (selectedNote?.id === id) setSelectedNote(null);
                }
            }
        });
    };

    const handleRenameNote = (note: Note, e: React.MouseEvent) => {
        e.stopPropagation();
        setDialog({
            isOpen: true,
            title: "Renommer la note",
            placeholder: "Nouveau titre...",
            value: note.title || "",
            type: 'input',
            onConfirm: async (newTitle) => {
                if (newTitle && user) {
                    const { error } = await supabase.from('notes').update({ title: newTitle }).eq('id', note.id).eq('user_id', user.id);
                    if (error) {
                        toast.error("Erreur lors du renommage.");
                    } else {
                        setNotes(notes.map(n => n.id === note.id ? { ...n, title: newTitle } : n));
                        if (selectedNote?.id === note.id) setSelectedNote(prev => prev ? { ...prev, title: newTitle } : null);
                    }
                }
            }
        });
    };

    const updateNote = async (content: string) => {
        if (!selectedNote) return;
        const updatedLocal = { ...selectedNote, content, updated_at: new Date().toISOString() };
        setSelectedNote(updatedLocal);
        setNotes(notes.map(n => n.id === selectedNote.id ? updatedLocal : n));

        // Title Extraction
        const rawText = content.replace(/<[^>]*>/g, ' ').trim();
        let newTitle = rawText.split('\n')[0].substring(0, 50).trim();
        if (!newTitle) newTitle = "Nouvelle Note";

        await saveNoteToDb(selectedNote.id, content, newTitle);
    };

    const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null);
    const saveNoteToDb = async (id: string, content: string, title: string) => {
        setIsSaving(true);
        if (saveTimer) clearTimeout(saveTimer);
        const timer = setTimeout(async () => {
            if (!user) return;
            await supabase.from('notes').update({ content, title, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id);
            setIsSaving(false);
        }, 1000);
        setSaveTimer(timer);
    };

    return (
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
            {/* FOCUS MODE OVERLAY */}
            {isFocusMode && selectedNote && (
                <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between px-8 py-4 border-b border-border bg-card">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                <FileText className="w-3 h-3" />
                                <span>{folders.find(f => f.id === selectedNote.folder_id)?.name || "Général"}</span>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-foreground/80">{selectedNote.title}</span>
                            </div>
                            {isSaving && <span className="text-[10px] text-primary animate-pulse font-mono">Auto-saving...</span>}
                        </div>
                        <button
                            onClick={() => setIsFocusMode(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-accent/20 border border-border rounded-xl text-xs font-bold hover:bg-accent/30 transition-all group"
                        >
                            <Minimize2 className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                            Quitter le mode Focus
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden bg-background">
                        <NoteEditor
                            content={selectedNote.content}
                            onChange={updateNote}
                            fixedToolbar={true}
                        />
                    </div>
                </div>
            )}

            {/* Header */}
            <div className={cn(
                "flex items-center justify-between px-4 md:px-6 py-3 pt-24 md:pt-4 border-b border-border bg-card/80 backdrop-blur-xl z-20 transition-all duration-500",
                isFocusMode ? "opacity-0 -translate-y-full" : "opacity-100 translate-y-0"
            )}>
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                            <FlaskConical className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg md:text-xl font-bold tracking-tight leading-none">Mes Projets</h1>
                            <p className="text-[8px] md:text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Gestion & Archives</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {isSaving && <span className="hidden sm:inline text-[10px] text-primary animate-pulse font-mono uppercase tracking-widest">Enregistrement...</span>}
                        <button
                            onClick={handleCreateNote}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all disabled:opacity-20 shadow-lg shadow-orange-500/20"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Nouveau Projet</span>
                            <span className="sm:hidden">Projet</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative">
                <div className="flex h-full">
                    {/* Sidebar Area */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-20 md:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}
                    <div className={cn(
                        "h-full border-r border-border transition-all duration-300 z-30 bg-background pt-24 md:pt-0",
                        "fixed inset-y-0 left-0 md:relative shadow-2xl md:shadow-none", // Absolute on mobile, relative on desktop
                        isSidebarOpen ? "w-[85%] md:w-80 translate-x-0" : "w-0 -translate-x-full md:translate-x-0 md:overflow-hidden"
                    )}>
                        <DrillDownSidebar
                            folders={folders}
                            notes={notes}
                            selectedFolderId={selectedFolderId}
                            selectedNoteId={selectedNote?.id || null}
                            onSelectFolder={setSelectedFolderId}
                            onExitFolder={() => { setSelectedFolderId(null); setSelectedNote(null); }}
                            onSelectNote={(note) => { setSelectedNote(note); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                            onCreateFolder={handleCreateFolder}
                            onCreateNote={handleCreateNote}
                            onDeleteFolder={handleDeleteFolder}
                            onDeleteNote={handleDeleteNote}
                            onRenameFolder={handleRenameFolder}
                            onRenameNote={handleRenameNote}
                        />
                    </div>

                    <div className={cn(
                        "flex-1 bg-card relative flex flex-col transition-all duration-500",
                        selectedNote ? "fixed inset-0 z-[40] md:relative" : "hidden md:flex"
                    )}>
                        {/* Mobile Back Button to Notes List */}
                        <div className="md:hidden flex items-center gap-4 px-4 py-3 border-b border-border bg-card">
                            <button
                                onClick={() => {
                                    setSelectedNote(null);
                                    setIsSidebarOpen(true);
                                }}
                                className="p-2 rounded-xl bg-accent/20 border border-border"
                            >
                                <ChevronRight className="w-5 h-5 rotate-180" />
                            </button>
                            <div className="flex flex-col">
                                <h2 className="text-sm font-black truncate max-w-[200px]">{selectedNote?.title}</h2>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Édition du projet</p>
                            </div>
                        </div>

                        {/* Toggle Sidebar Button (Floating Desktop) */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="hidden md:flex absolute left-4 top-4 z-10 p-2 rounded-lg bg-background border border-border text-muted-foreground hover:text-foreground transition-all shadow-xl"
                        >
                            <Menu className="w-4 h-4" />
                        </button>

                        {selectedNote ? (
                            <div className="flex-1 overflow-hidden flex flex-col">
                                <div className="hidden md:flex px-6 py-2 border-b border-border bg-accent/5 items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                        <FileText className="w-3 h-3" />
                                        {folders.find(f => f.id === selectedNote.folder_id)?.name || "Général"}
                                        <ChevronRight className="w-3 h-3" />
                                        <span className="text-foreground/80">{selectedNote.title}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setIsFocusMode(true)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-accent/20 border border-border text-muted-foreground rounded-lg text-xs font-bold hover:text-foreground hover:bg-accent/30 transition-all"
                                            title="Mode Focus"
                                        >
                                            <Maximize2 className="w-3.5 h-3.5" />
                                            Focus
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    <NoteEditor
                                        content={selectedNote.content}
                                        onChange={updateNote}
                                        fixedToolbar={true}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-24 h-24 rounded-full bg-orange-500/10 flex items-center justify-center mb-6 p-6">
                                    <FileText className="w-16 h-16 text-orange-500" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Espace de Recherche</h3>
                                <p className="text-muted-foreground max-w-xs">Sélectionnez ou créez une note pour commencer à approfondir vos idées.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- PREMIUM DIALOG COMPONENT --- */}
            {dialog.isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setDialog({ ...dialog, isOpen: false })}
                    />
                    <div className="relative w-full max-w-md bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                    dialog.type === 'confirm' ? "bg-destructive/10" : "bg-primary/10"
                                )}>
                                    {dialog.type === 'confirm' ? (
                                        <AlertCircle className="w-5 h-5 text-destructive" />
                                    ) : (
                                        <Plus className="w-5 h-5 text-primary" />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">{dialog.title}</h3>
                            </div>

                            <div className="space-y-4">
                                {dialog.type === 'input' ? (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">{dialog.title}</label>
                                        <input
                                            autoFocus
                                            type="text"
                                            className="w-full bg-background/40 border border-border rounded-2xl px-5 py-4 text-foreground focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30 font-medium"
                                            placeholder={dialog.placeholder}
                                            value={dialog.value}
                                            onChange={(e) => setDialog({ ...dialog, value: e.target.value })}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    dialog.onConfirm(dialog.value);
                                                    setDialog({ ...dialog, isOpen: false });
                                                }
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm leading-relaxed">{dialog.placeholder}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={() => setDialog({ ...dialog, isOpen: false })}
                                    className="flex-1 py-4 bg-accent/20 border border-border rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-accent/30 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => {
                                        dialog.onConfirm(dialog.value);
                                        setDialog({ ...dialog, isOpen: false });
                                    }}
                                    className={cn(
                                        "flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2",
                                        dialog.type === 'confirm'
                                            ? "bg-destructive text-destructive-foreground hover:opacity-90 shadow-destructive/20"
                                            : "bg-primary text-primary-foreground hover:opacity-90 shadow-primary/20"
                                    )}
                                >
                                    {dialog.type === 'confirm' ? <Trash2 className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                                    {dialog.type === 'confirm' ? (dialog.confirmLabel || "Confirmer") : "Valider"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
