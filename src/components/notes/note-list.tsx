"use client";

import { useState } from "react";
import { Search, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/supabase";

type Note = Database['public']['Tables']['notes']['Row'];

interface NoteListProps {
    notes: Note[];
    selectedNoteId: string | null;
    onSelect: (note: Note) => void;
    onCreate: () => void;
    onDelete: (id: string) => void;
    canCreate: boolean;
}

export function NoteList({ notes, selectedNoteId, onSelect, onCreate, onDelete, canCreate }: NoteListProps) {
    const [search, setSearch] = useState("");

    // Sort by updated_at desc
    const sortedNotes = notes
        .filter(n => (n.title || "").toLowerCase().includes(search.toLowerCase()) || (n.content || "").toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return (
        <div className="flex flex-col h-full bg-[#0F1115] w-full md:w-80 border-r border-white/5">
            {/* Header / Search */}
            <div className="p-4 pt-6 space-y-3">
                <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Notes</span>
                    <button
                        onClick={onCreate}
                        disabled={!canCreate}
                        className={cn(
                            "transition-colors",
                            canCreate
                                ? "text-gray-400 hover:text-white"
                                : "text-gray-700 cursor-not-allowed"
                        )}
                        title="Créer une note (Dossier requis)"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                </div>
                <div className="relative group">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-600 group-focus-within:text-white transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher"
                        className="w-full bg-[#1A1D24] rounded-lg pl-9 pr-3 py-2 text-[13px] text-white focus:outline-none focus:bg-[#20242D] transition-all placeholder:text-gray-600"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5 scrollbar-thin scrollbar-thumb-white/5">

                {!canCreate && notes.length === 0 && (
                    <div className="mt-20 text-center flex flex-col items-center gap-3 animate-pulse">
                        <p className="text-gray-700 text-xs text-center px-8 font-medium">Sélectionne un dossier à gauche.</p>
                    </div>
                )}

                {sortedNotes.map(note => {
                    const preview = note.content?.replace(/<[^>]*>?/gm, '').slice(0, 60) || "";
                    const isSelected = selectedNoteId === note.id;

                    return (
                        <div
                            key={note.id}
                            onClick={() => onSelect(note)}
                            className={cn(
                                "group p-3 rounded-lg cursor-pointer transition-all duration-200 select-none",
                                isSelected
                                    ? "bg-[#1A1D24] border-l-2 border-[#E0A82E]"
                                    : "hover:bg-[#1A1D24] border-l-2 border-transparent"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <h3 className={cn("font-medium text-[14px] truncate mb-1 pr-4", isSelected ? "text-white" : "text-gray-300")}>
                                    {note.title || "Nouvelle Note"}
                                </h3>

                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                                    className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-opacity"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <p className="text-[12px] text-gray-500 truncate line-clamp-2 leading-relaxed">
                                {preview || "..."}
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
