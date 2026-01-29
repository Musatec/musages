"use client";

import { useState } from "react";
import { Folder, FileText, ChevronRight, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/supabase";


type FolderType = Database['public']['Tables']['folders']['Row'];
type NoteType = Database['public']['Tables']['notes']['Row'];

interface UnifiedSidebarProps {
    folders: FolderType[];
    notes: NoteType[];
    selectedNoteId: string | null;
    onSelectNote: (note: NoteType) => void;
    onCreateFolder: (name: string) => void;
    onCreateNote: (folderId: string) => void;
}

export function UnifiedSidebar({
    folders,
    notes,
    selectedNoteId,
    onSelectNote,
    onCreateFolder,
    onCreateNote
}: UnifiedSidebarProps) {

    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");

    // Toggle expand/collapse
    const toggleFolder = (folderId: string) => {
        const newSet = new Set(expandedFolders);
        if (newSet.has(folderId)) newSet.delete(folderId);
        else newSet.add(folderId);
        setExpandedFolders(newSet);
    };

    // Group notes by folder
    const getNotesForFolder = (folderId: string) => {
        return notes.filter(n => n.folder_id === folderId);
    };

    return (
        <div className="flex flex-col h-full bg-[#151517] w-[280px] border-r border-white/5 shrink-0 flex-none">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/5">
                <span className="text-xs font-bold uppercase tracking-widest text-[#86868B]">Explorateur</span>
                <button
                    onClick={() => setIsCreatingFolder(true)}
                    className="hover:bg-white/10 p-1 rounded transition text-gray-400 hover:text-white"
                    title="Nouveau Dossier"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">

                {isCreatingFolder && (
                    <div className="px-2 py-1 mb-2">
                        <input
                            autoFocus
                            placeholder="Nom du dossier..."
                            className="w-full bg-white/5 rounded px-2 py-1 text-sm text-white outline-none border border-white/10 focus:border-[#E0A82E]/50"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') { onCreateFolder(newFolderName); setNewFolderName(""); setIsCreatingFolder(false); }
                                if (e.key === 'Escape') setIsCreatingFolder(false);
                            }}
                            onBlur={() => setIsCreatingFolder(false)}
                        />
                    </div>
                )}

                {folders.map(folder => {
                    const folderNotes = getNotesForFolder(folder.id);
                    const isExpanded = expandedFolders.has(folder.id);

                    return (
                        <div key={folder.id} className="mb-1">
                            {/* Folder Row */}
                            <div
                                className="group flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-gray-400 hover:text-white transition-colors"
                                onClick={() => toggleFolder(folder.id)}
                            >
                                <div className="flex items-center gap-1.5 overflow-hidden">
                                    {isExpanded ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                                    <Folder className="h-3.5 w-3.5 shrink-0 text-[#E0A82E]" />
                                    <span className="text-sm font-medium truncate select-none">{folder.name}</span>
                                    <span className="text-[10px] text-gray-600 ml-1">({folderNotes.length})</span>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); onCreateNote(folder.id); setExpandedFolders(new Set(expandedFolders.add(folder.id))); }}
                                    className="opacity-0 group-hover:opacity-100 hover:bg-white/20 p-0.5 rounded text-gray-400 hover:text-white transition-all"
                                    title="Créer une note ici"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {/* Notes List (Nested) */}
                            {isExpanded && (
                                <div className="ml-[18px] border-l border-white/5 pl-1 mt-0.5 space-y-0.5">
                                    {folderNotes.length === 0 && (
                                        <div className="px-3 py-1 text-[11px] text-gray-600 italic select-none">Vide</div>
                                    )}
                                    {folderNotes.map(note => (
                                        <div
                                            key={note.id}
                                            onClick={() => onSelectNote(note)}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-all border-l-2 border-transparent",
                                                selectedNoteId === note.id
                                                    ? "bg-[#E0A82E]/10 text-[#E0A82E] border-[#E0A82E]"
                                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            <FileText className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate select-none">{note.title || "Nouvelle note"}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}

                {folders.length === 0 && !isCreatingFolder && (
                    <div className="mt-10 text-center px-4">
                        <p className="text-xs text-gray-600 mb-3">Aucun dossier.</p>
                        <button
                            onClick={() => setIsCreatingFolder(true)}
                            className="bg-white/5 hover:bg-white/10 text-white text-xs px-3 py-1.5 rounded-full transition"
                        >
                            Créer un dossier
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
