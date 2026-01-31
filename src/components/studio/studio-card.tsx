
"use client";

import { cn } from "@/lib/utils";
import { Project } from "@/types/studio";
import { CATEGORIES } from "./constants";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import { useTranslations, useLocale } from "next-intl";

export interface StudioCardProps {
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: (id: string) => void;
    onDuplicate: (project: Project) => void;
}

interface ActionButtonsProps {
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: (id: string) => void;
    onDuplicate: (project: Project) => void;
    t: (key: string) => string;
}

const ActionButtons = ({ project, onEdit, onDelete, onDuplicate, t }: ActionButtonsProps) => (
    <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 translate-y-2 group-hover:translate-y-0">
        <button
            onClick={(e) => { e.stopPropagation(); onEdit(project); }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all border border-white/10 shadow-lg"
            title={t('edit') || "Modifier"}
        >
            <div className="w-4 h-4 rounded-sm border-2 border-current" />
        </button>
        <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(project); }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all border border-white/10 shadow-lg"
            title={t('duplicate') || "Dupliquer"}
        >
            <Copy className="w-4 h-4" />
        </button>
        <button
            onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-red-500 hover:text-white transition-all border border-white/10 shadow-lg"
            title={t('delete') || "Supprimer"}
        >
            <Trash2 className="w-4 h-4" />
        </button>
    </div>
);

export function StudioCard({ project, onEdit, onDelete, onDuplicate }: StudioCardProps) {
    const t = useTranslations("Studio");
    const locale = useLocale();
    const cat = CATEGORIES.find(c => c.id === project.category) || CATEGORIES[0];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' }).format(date);
    };

    const isImage = project.category === 'image' || !!project.image_url;
    const isPrompt = project.category === 'prompt';
    const isLink = project.category === 'link';
    const isIdea = project.category === 'idea';
    const isTip = project.category === 'tip';


    // --- STYLE 1: IMAGE CARD (Visual Focus) ---
    if (isImage && project.image_url) {
        return (
            <div
                className="break-inside-avoid mb-6 cursor-pointer group relative rounded-3xl overflow-hidden bg-black aspect-[4/5] hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-xl"
                onClick={() => onEdit(project)}
            >
                <SafeImage
                    src={project.image_url}
                    alt={project.title}
                    width={400}
                    height={500}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <ActionButtons project={project} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} t={t} />

                <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-white mb-2 border border-white/10">
                        Image
                    </span>
                    <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow-lg">{project.title}</h3>
                    {project.description && <p className="text-gray-300 text-xs mt-1 line-clamp-1 opacity-80">{project.description}</p>}
                </div>
            </div>
        );
    }

    // --- STYLE 2: IDEA / NOTE CARD (Modern Lava Style) ---
    if (isIdea) {
        return (
            <div
                className="break-inside-avoid mb-6 cursor-pointer group relative rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-orange-500/10"
                onClick={() => onEdit(project)}
            >
                <div className="absolute top-0 right-0 p-10 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full opacity-50" />

                <ActionButtons project={project} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} t={t} />

                <div className="p-6">
                    <div className="flex items-center gap-2 mb-4 opacity-50">
                        <cat.icon className="w-4 h-4 text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{formatDate(project.created_at)}</span>
                    </div>
                    <h3 className="text-xl font-sans font-semibold text-white leading-tight mb-3">{project.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed line-clamp-4 font-medium">
                        {project.description || "Aucune description..."}
                    </p>
                </div>
            </div>
        );
    }

    // --- STYLE 3: PROMPT / CODE (Terminal Style) ---
    if (isPrompt) {
        return (
            <div
                className="break-inside-avoid mb-6 cursor-pointer group relative rounded-3xl overflow-hidden bg-[#0a0a0a] border border-white/10 hover:border-orange-500/30 hover:-translate-y-1 transition-all duration-300 shadow-lg"
                onClick={() => onEdit(project)}
            >
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                    <div className="w-2 h-2 rounded-full bg-red-500/40" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
                    <div className="w-2 h-2 rounded-full bg-green-500/40" />
                    <div className="ml-auto font-mono text-[9px] text-orange-500/60">&gt;_ prompt</div>
                </div>

                <ActionButtons project={project} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} t={t} />

                <div className="p-5 pt-4">
                    <h3 className="text-sm font-mono font-bold text-orange-400 mb-3 truncate border-l-2 border-orange-500/30 pl-3">{project.title}</h3>
                    <div className="bg-white/5 rounded-xl p-3">
                        <p className="font-mono text-xs text-gray-400 leading-relaxed line-clamp-5 break-words">
                            <span className="text-red-400 mr-2">$</span>
                            {project.description}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // --- STYLE 4: LINK (Bookmark Style) ---
    if (isLink) {
        return (
            <div
                className="break-inside-avoid mb-6 cursor-pointer group relative rounded-3xl overflow-hidden bg-card border border-orange-500/10 hover:border-orange-500/30 hover:-translate-y-1 transition-all duration-300"
                onClick={() => onEdit(project)}
            >
                <ActionButtons project={project} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} t={t} />

                <div className="h-2 bg-orange-500/20 w-full" />
                <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                            <ExternalLink className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-bold text-muted-foreground bg-accent/50 px-2 py-1 rounded-md">LIEN WEB</span>
                    </div>

                    <h3 className="font-bold text-base text-foreground mb-1 line-clamp-1">{project.title}</h3>
                    <p className="text-xs text-orange-400/80 truncate mb-4 font-mono bg-orange-500/5 p-1 rounded px-2 w-fit max-w-full">
                        {project.description?.startsWith('http') ? new URL(project.description).hostname : 'Lien externe'}
                    </p>
                </div>
            </div>
        );
    }

    // --- STYLE 5: DEFAULT / TIP (Minimalist) ---
    return (
        <div
            className={cn(
                "break-inside-avoid mb-6 cursor-pointer group relative rounded-3xl overflow-hidden bg-card border hover:-translate-y-1 transition-all duration-300",
                isTip ? "border-amber-500/20 hover:border-amber-500/40 bg-amber-950/5" : "border-border hover:border-white/20"
            )}
            onClick={() => onEdit(project)}
        >
            <ActionButtons project={project} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} t={t} />

            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <span className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-md border",
                        isTip ? "text-amber-500 border-amber-500/20 bg-amber-500/5" : "text-muted-foreground border-border bg-accent/50"
                    )}>
                        {cat.label}
                    </span>
                </div>

                <h3 className="font-bold text-lg text-foreground mb-2 leading-tight">{project.title}</h3>
                {project.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {project.description}
                    </p>
                )}

                <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                    <span>{formatDate(project.created_at)}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">Modifier →</span>
                </div>
            </div>
        </div>
    );
}
