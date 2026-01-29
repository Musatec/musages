"use client";

import { useState } from "react";
import { Folder, Plus, Trash2, Edit2, Box } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/supabase";
import { supabase } from "@/lib/supabase";

type FolderType = Database['public']['Tables']['folders']['Row'];

interface FolderListProps {
    folders: FolderType[];
    selectedFolderId: string | null;
    onSelect: (id: string | null) => void;
    onUpdate: () => void;
}

export function FolderList({ folders, selectedFolderId, onSelect, onUpdate }: FolderListProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");

    const createFolder = async () => {
        if (!newName.trim()) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from('folders').insert({ name: newName, user_id: user.id });
        setNewName("");
        setIsCreating(false);
        onUpdate();
    };

    const updateFolder = async (id: string) => {
        if (!editName.trim()) return;
        await supabase.from('folders').update({ name: editName }).eq('id', id);
        setEditingId(null);
        onUpdate();
    };

    const deleteFolder = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Supprimer ce dossier et toutes ses notes ?")) return;
        await supabase.from('notes').delete().eq('folder_id', id);
        await supabase.from('folders').delete().eq('id', id);
        if (selectedFolderId === id) onSelect(null);
        onUpdate();
    };

    const startEditing = (folder: FolderType, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(folder.id);
        setEditName(folder.name);
    };

    return (
        <div className="flex flex-col h-full bg-[#0F1115] w-[260px] shrink-0 pt-4 border-r border-white/5">
            {/* Header minimaliste */}
            <div className="px-4 pb-4 flex justify-between items-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bibliothèque</span>
                <button
                    onClick={() => setIsCreating(true)}
                    className="text-gray-500 hover:text-white transition"
                    title="Nouveau dossier"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-0.5">

                {/* Default Item */}
                <button
                    onClick={() => onSelect(null)}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 group text-left",
                        selectedFolderId === null
                            ? "bg-white/5 text-white font-medium shadow-sm"
                            : "text-gray-400 hover:text-white hover:bg-white/5 font-normal"
                    )}
                >
                    <Box className="h-4 w-4 opacity-70" />
                    <span>Tout</span>
                </button>

                {isCreating && (
                    <div className="px-3 py-1 my-1">
                        <input
                            autoFocus
                            className="bg-transparent border-b border-white/20 outline-none text-[13px] text-white w-full pb-1 placeholder:text-gray-600"
                            placeholder="Nom du dossier..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') setIsCreating(false); }}
                            onBlur={() => { if (newName.trim()) createFolder(); else setIsCreating(false); }}
                        />
                    </div>
                )}

                <div className="h-px bg-white/5 mx-3 my-2" />

                {folders.map(folder => (
                    <div
                        key={folder.id}
                        onClick={() => onSelect(folder.id)}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-all duration-200 group cursor-pointer text-left",
                            selectedFolderId === folder.id
                                ? "bg-white/5 text-white font-medium shadow-sm"
                                : "text-gray-400 hover:text-white hover:bg-white/5 font-normal"
                        )}
                    >
                        {editingId === folder.id ? (
                            <input
                                autoFocus
                                className="bg-transparent border-b border-white/20 outline-none text-[13px] text-white w-full pb-1"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') updateFolder(folder.id); }}
                                onClick={(e) => e.stopPropagation()}
                                onBlur={() => updateFolder(folder.id)}
                            />
                        ) : (
                            <>
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Folder className={cn("h-3.5 w-3.5 shrink-0 transition-opacity", selectedFolderId === folder.id ? "opacity-100" : "opacity-50")} />
                                    <span className="truncate">{folder.name}</span>
                                </div>
                                <div className="hidden group-hover:flex items-center gap-1 opacity-50">
                                    <button onClick={(e) => startEditing(folder, e)} className="hover:text-white p-1"><Edit2 className="h-3 w-3" /></button>
                                    <button onClick={(e) => deleteFolder(folder.id, e)} className="hover:text-red-400 p-1"><Trash2 className="h-3 w-3" /></button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
