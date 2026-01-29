"use client";

import { useState } from "react";
import { Folder, FileText, ChevronLeft, Plus, Trash2, Edit2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/supabase";

type FolderType = Database['public']['Tables']['folders']['Row'];
type NoteType = Database['public']['Tables']['notes']['Row'];

interface DrillDownSidebarProps {
    folders: FolderType[];
    notes: NoteType[];
    selectedFolderId: string | null;
    selectedNoteId: string | null;
    onSelectFolder: (id: string) => void;
    onExitFolder: () => void;
    onSelectNote: (note: NoteType) => void;
    onCreateFolder: () => void;
    onCreateNote: () => void;
    onDeleteFolder: (id: string, e: React.MouseEvent) => void;
    onRenameFolder: (folder: FolderType, e: React.MouseEvent) => void;
    onDeleteNote: (id: string, e: React.MouseEvent) => void;
    onRenameNote: (note: NoteType, e: React.MouseEvent) => void;
}

export function DrillDownSidebar({
    folders,
    notes,
    selectedFolderId,
    selectedNoteId,
    onSelectFolder,
    onExitFolder,
    onSelectNote,
    onCreateFolder,
    onCreateNote,
    onDeleteFolder,
    onRenameFolder,
    onDeleteNote,
    onRenameNote
}: DrillDownSidebarProps) {

    // View State: "folders" or "notes"
    const currentView = selectedFolderId ? "notes" : "folders";

    // SEARCH STATE
    const [search, setSearch] = useState("");
    const isSearching = search.trim().length > 0;

    // Search Results
    const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
    const filteredNotes = notes.filter(n => (n.title || "").toLowerCase().includes(search.toLowerCase()) || (n.content || "").toLowerCase().includes(search.toLowerCase()));

    // Filter notes for current folder (Standard View)
    const currentNotes = selectedFolderId ? notes.filter(n => n.folder_id === selectedFolderId) : [];

    // Get current folder name
    const currentFolderName = selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : "";

    return (
        <div className="flex flex-col h-full bg-background w-full border-r border-border shrink-0 overflow-hidden relative">

            {/* SEARCH BAR (Sticky Top) */}
            <div className="p-3 pb-0">
                <div className="relative group">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-all font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {isSearching && (
                        <button onClick={() => setSearch("")} className="absolute right-2 top-2 text-muted-foreground hover:text-foreground">
                            <span className="sr-only">Effacer</span>
                            <span className="text-[10px]">✕</span>
                        </button>
                    )}
                </div>
            </div>

            {/* === VIEW 1: SEARCH RESULTS === */}
            {isSearching && (
                <div className="flex-1 overflow-y-auto p-2 space-y-4 mt-2">
                    {/* Folders Matches */}
                    {filteredFolders.length > 0 && (
                        <div>
                            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-1">Dossiers ({filteredFolders.length})</h3>
                            <div className="space-y-0.5">
                                {filteredFolders.map(folder => (
                                    <div
                                        key={folder.id}
                                        onClick={() => { onSelectFolder(folder.id); setSearch(""); }}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/10 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <Folder className="h-4 w-4 text-primary shrink-0" />
                                        <span className="text-sm truncate font-medium">{folder.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes Matches */}
                    {filteredNotes.length > 0 && (
                        <div>
                            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-1">Notes ({filteredNotes.length})</h3>
                            <div className="space-y-0.5">
                                {filteredNotes.map(note => (
                                    <div
                                        key={note.id}
                                        onClick={() => { onSelectNote(note); if (note.folder_id) onSelectFolder(note.folder_id); setSearch(""); }}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/10 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <div className="overflow-hidden">
                                            <div className="text-sm truncate font-bold text-foreground">{note.title || "Sans titre"}</div>
                                            <div className="text-[10px] text-muted-foreground truncate">{note.content?.replace(/<[^>]*>?/gm, "") || "..."}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredFolders.length === 0 && filteredNotes.length === 0 && (
                        <div className="text-center mt-10 text-gray-600 text-xs">
                            Aucun résultat pour &quot;{search}&quot;
                        </div>
                    )}
                </div>
            )}


            {/* === VIEW 2: NORMAL NAVIGATION (Hidden when searching) === */}
            <div className={cn("flex-1 relative overflow-hidden transition-opacity duration-200", isSearching ? "opacity-0 pointer-events-none hidden" : "opacity-100")}>

                {/* SUB-VIEW: FOLDERS */}
                <div className={cn(
                    "absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out",
                    currentView === "folders" ? "translate-x-0" : "-translate-x-full"
                )}>
                    <div className="px-4 py-3 flex items-center justify-between">
                        <span className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Mes Dossiers</span>
                        <button onClick={onCreateFolder} className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition" title="Nouveau dossier">
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {folders.map(folder => (
                            <div
                                key={folder.id}
                                onClick={() => onSelectFolder(folder.id)}
                                className="group flex items-center justify-between px-3 py-3 rounded-xl hover:bg-accent/10 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {/* FOLDER ICON: Filled, Gold/Yellow */}
                                    <div className="relative">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary">
                                            <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
                                        </svg>
                                    </div>
                                    <span className="font-bold text-foreground/90 text-[15px] truncate">{folder.name}</span>
                                    <span className="text-xs text-muted-foreground ml-1">
                                        {notes.filter(n => n.folder_id === folder.id).length}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => onRenameFolder(folder, e)}
                                        className="p-1.5 hover:bg-accent/20 rounded-lg text-muted-foreground hover:text-foreground"
                                    >
                                        <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => onDeleteFolder(folder.id, e)}
                                        className="p-1.5 hover:bg-accent/20 rounded-lg text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {folders.length === 0 && (
                            <div className="text-center mt-10 text-gray-500 text-sm">Aucun dossier</div>
                        )}
                    </div>
                </div>

                {/* SUB-VIEW: NOTES */}
                <div className={cn(
                    "absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out bg-card",
                    currentView === "notes" ? "translate-x-0" : "translate-x-full"
                )}>
                    <div className="p-3 flex items-center justify-between border-b border-border h-[50px]">
                        <button
                            onClick={onExitFolder}
                            className="flex items-center gap-1 text-primary hover:opacity-80 font-bold text-xs pl-1 pr-2 py-1 rounded-lg hover:bg-accent/10 transition"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Dossiers
                        </button>

                        <span className="font-bold text-foreground/90 truncate max-w-[120px] text-sm">{currentFolderName}</span>

                        <button onClick={onCreateNote} className="p-1.5 hover:bg-accent/20 rounded-lg text-primary transition" title="Nouvelle note">
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {currentNotes.length === 0 && (
                            <div className="text-center mt-10 text-gray-500 text-sm">Dossier vide</div>
                        )}

                        {currentNotes.map(note => (
                            <div
                                key={note.id}
                                onClick={() => onSelectNote(note)}
                                className={cn(
                                    "group p-3 rounded-xl cursor-pointer transition-all border border-transparent hover:border-border",
                                    selectedNoteId === note.id
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "bg-background/40 hover:bg-accent/5 text-foreground"
                                )}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2 overflow-hidden w-full">
                                        {/* FILE ICON: Paper sheet, White/Grey */}
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cn("w-4 h-4 shrink-0", selectedNoteId === note.id ? "text-primary-foreground" : "text-muted-foreground")}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                        </svg>
                                        <h3 className={cn("font-bold text-[14px] truncate", selectedNoteId === note.id ? "text-primary-foreground" : "text-foreground")}>
                                            {note.title || "Sans titre"}
                                        </h3>
                                    </div>

                                    <div className={cn("flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity", selectedNoteId === note.id ? "text-primary-foreground/50" : "text-muted-foreground")}>
                                        <button
                                            onClick={(e) => onRenameNote(note, e)}
                                            className="p-1 hover:bg-black/10 rounded"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => onDeleteNote(note.id, e)}
                                            className="p-1 hover:bg-black/10 rounded hover:text-destructive"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <p className={cn(
                                    "text-xs truncate font-medium pl-6 text-opacity-[0.7]",
                                    selectedNoteId === note.id ? "text-primary-foreground" : "text-muted-foreground"
                                )}>
                                    {note.content?.replace(/<[^>]*>?/gm, '').slice(0, 50) || "Pas de contenu"}
                                </p>
                                <div className={cn(
                                    "text-[10px] mt-2 pl-6",
                                    selectedNoteId === note.id ? "text-primary-foreground/50" : "text-muted-foreground/50"
                                )}>
                                    {new Date(note.updated_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div> {/* Click to end Normal View wrapper */}

        </div>
    );
}
