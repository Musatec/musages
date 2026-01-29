"use client";

import { useState } from "react";
import { Folder, FileText, Plus, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/supabase";

type FolderType = Database['public']['Tables']['folders']['Row'];
type NoteType = Database['public']['Tables']['notes']['Row'];

interface SplitSidebarProps {
    folders: FolderType[];
    notes: NoteType[];
    selectedFolderId: string | null;
    selectedNoteId: string | null;

    onSelectFolder: (id: string | null) => void;
    onSelectNote: (note: NoteType) => void;

    onCreateFolder: () => void;
    onCreateNote: () => void;

    onDeleteFolder: (id: string) => void;
    onDeleteNote: (id: string) => void;

    onRenameFolder: (id: string, newName: string) => void;
}

export function SplitSidebar({
    folders,
    notes,
    selectedFolderId,
    selectedNoteId,
    onSelectFolder,
    onSelectNote,
    onCreateFolder,
    onCreateNote,
    onDeleteFolder,
    onDeleteNote,
    onRenameFolder
}: SplitSidebarProps) {

    // Derived state
    const currentFolderNotes = selectedFolderId
        ? notes.filter(n => n.folder_id === selectedFolderId)
        : notes; // Or empty if you prefer strict folder selection

    // Editing State
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const startEditing = (folder: FolderType) => {
        setEditingFolderId(folder.id);
        setEditName(folder.name);
    };

    const saveEditing = (id: string) => {
        if (editName.trim()) onRenameFolder(id, editName);
        setEditingFolderId(null);
    };

    return (
        <div className="flex flex-col h-full bg-[#151517] w-[260px] border-r border-white/5 shrink-0">

            {/* === SECTION 1: DOSSIERS (HAUT) === */}
            <div className="flex-1 flex flex-col min-h-[40%] border-b border-white/5 overflow-hidden">
                <div className="p-3 flex items-center justify-between bg-[#1A1D21]">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Dossiers</span>
                    <button onClick={onCreateFolder} className="text-gray-400 hover:text-[#E0A82E] transition"><Plus className="h-4 w-4" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin scrollbar-thumb-white/5">

                    {/* Folder Items */}
                    {folders.map(folder => (
                        <div
                            key={folder.id}
                            onClick={() => onSelectFolder(folder.id)}
                            className={cn(
                                "group flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-all",
                                selectedFolderId === folder.id
                                    ? "bg-[#E0A82E] text-black font-medium"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {editingFolderId === folder.id ? (
                                <input
                                    autoFocus
                                    className="bg-white text-black text-sm w-full rounded px-1 outline-none"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onBlur={() => saveEditing(folder.id)}
                                    onKeyDown={(e) => e.key === 'Enter' && saveEditing(folder.id)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Folder className={cn("h-4 w-4 shrink-0", selectedFolderId === folder.id ? "text-black" : "text-[#E0A82E]")} />
                                        <span className="truncate">{folder.name}</span>
                                    </div>
                                    <div className={cn("hidden group-hover:flex items-center gap-1", selectedFolderId === folder.id ? "text-black/60" : "text-gray-500")}>
                                        <button onClick={(e) => { e.stopPropagation(); startEditing(folder); }} className="p-1 hover:bg-black/10 rounded"><Edit2 className="h-3 w-3" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }} className="p-1 hover:text-red-600 hover:bg-black/10 rounded"><Trash2 className="h-3 w-3" /></button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* === SECTION 2: FICHIERS (BAS) === */}
            <div className="flex-[1.5] flex flex-col bg-[#0F1115] overflow-hidden border-t border-white/5 relative">

                {/* Visual Connection Arrow (Optional aesthetic) */}
                {selectedFolderId && (
                    <div className="absolute top-0 left-6 -translate-y-1/2 w-3 h-3 bg-[#0F1115] border-l border-t border-white/5 transform rotate-45 z-10"></div>
                )}

                <div className="p-3 flex items-center justify-between bg-[#151517]/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Folder className="h-3.5 w-3.5 text-[#E0A82E] shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wider text-white/80 truncate max-w-[120px]">
                            {folders.find(f => f.id === selectedFolderId)?.name || "Aucun dossier"}
                        </span>
                    </div>
                    <button
                        onClick={onCreateNote}
                        disabled={!selectedFolderId}
                        className={cn("transition p-1 rounded hover:bg-white/10", selectedFolderId ? "text-white" : "text-gray-700 cursor-not-allowed")}
                        title="Nouvelle note dans ce dossier"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin scrollbar-thumb-white/5">
                    {!selectedFolderId && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-2 opacity-50">
                            <Folder className="h-8 w-8" />
                            <p className="text-xs">Sélectionnez un dossier</p>
                        </div>
                    )}

                    {selectedFolderId && currentFolderNotes.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-2 mt-8">
                            <p className="text-xs italic">Dossier vide</p>
                            <button onClick={onCreateNote} className="text-[#E0A82E] text-xs hover:underline">Créer une note</button>
                        </div>
                    )}

                    {currentFolderNotes.map(note => (
                        <div
                            key={note.id}
                            onClick={() => onSelectNote(note)}
                            className={cn(
                                "group flex items-center justify-between px-3 py-2.5 rounded-md text-sm cursor-pointer transition-all border-l-2",
                                selectedNoteId === note.id
                                    ? "bg-[#1A1D21] border-[#E0A82E] text-white shadow-sm"
                                    : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <FileText className={cn("h-4 w-4 shrink-0", selectedNoteId === note.id ? "text-[#E0A82E]" : "opacity-70")} />
                                <span className="truncate">{note.title || "Nouvelle note"}</span>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                                className="hidden group-hover:block p-1 text-gray-600 hover:text-red-400 transition-colors"
                                title="Supprimer"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
