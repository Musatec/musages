"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
    Image as ImageIcon, Send, Search, Plus, FlaskConical
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Project, CategoryId } from "@/types/studio";
import { CATEGORIES } from "@/components/studio/constants";
import { StudioCard } from "@/components/studio/studio-card";
import { StudioEditSheet } from "@/components/studio/studio-edit-sheet";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { useTranslations, useLocale } from "next-intl";
import { optimizeImage } from "@/lib/image-optimizer";
import { useRouter } from "@/i18n/routing";

export default function StudioPage() {
    // --- STATE ---
    const { user } = useSupabase();
    const t = useTranslations("Studio");
    const router = useRouter();
    const locale = useLocale();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter & Search
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [activeFilter, setActiveFilter] = useState<CategoryId | "all">("all");

    // Capture
    const [captureText, setCaptureText] = useState("");
    const [captureTitle, setCaptureTitle] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryId>("idea");
    const [, setIsSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Edit
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);

    // --- FETCHING ---
    const fetchProjects = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            let query = supabase
                .from('projects')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            // Apply Server-Side Filters
            if (activeFilter !== 'all') {
                query = query.eq('category', activeFilter);
            }

            if (debouncedSearch) {
                // Search in title OR description
                query = query.or(`title.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`);
            }

            const { data, error } = await query;

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error("Erreur chargement:", error);
            toast.error(t('error_loading') || "Erreur de chargement des résultats");
        } finally {
            setLoading(false);
        }
    }, [user, activeFilter, debouncedSearch, t]); // Re-fetch when filter or search changes

    // Initial fetch & refetch on filter change
    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // --- ACTIONS ---
    const handleQuickCapture = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!captureText.trim() && !imageFile) return;
        setIsSubmitting(true);

        if (!user) {
            toast.error("Connectez-vous pour sauvegarder.");
            setIsSubmitting(false);
            return;
        }

        let imageUrl = null;
        if (imageFile) {
            try {
                // Optimize image before upload
                const optimizedFile = await optimizeImage(imageFile);

                const fileExt = "jpg"; // We convert to jpeg in optimizer
                const fileName = `${Math.random()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('project-images')
                    .upload(fileName, optimizedFile);

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage.from('project-images').getPublicUrl(fileName);
                    imageUrl = publicUrl;
                }
            } catch (error) {
                console.error("Image optimization failed:", error);
            }
        }

        // Smart Title Logic
        let title = "Nouvelle découverte";
        const catObj = CATEGORIES.find(c => c.id === selectedCategory);
        if (catObj) title = `${catObj.label}`;

        if (captureTitle.trim()) {
            title = captureTitle.trim();
        } else if (captureText) {
            if (captureText.startsWith('http')) {
                try {
                    const url = new URL(captureText);
                    title = url.hostname.replace('www.', '');
                    if (selectedCategory === 'idea') setSelectedCategory('link');
                } catch { title = "Lien Web"; }
            } else {
                title = captureText.split('\n')[0].substring(0, 40);
            }
        }

        const newProject = {
            title,
            description: captureText,
            category: selectedCategory,
            image_url: imageUrl,
            user_id: user.id,
            status: 'idee',
            progress: 0
        };

        const { error } = await supabase.from('projects').insert(newProject);

        if (error) {
            toast.error(`Erreur: ${error.message}`);
        } else {
            toast.success(t('capture_success') || "Découverte capturée ! 🚀");
            setCaptureText("");
            setCaptureTitle("");
            setImageFile(null);
            router.push('/studio');
            router.refresh();
            setIsExpanded(false);

            // If we are currently filtered to something else, switch back to 'all' or the current category to show the new item
            if (activeFilter !== 'all' && activeFilter !== selectedCategory) {
                setActiveFilter('all');
            } else {
                await fetchProjects();
            }

            // Redirect to ensure we are looking at the gallery
            router.push('/studio');
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!user) return;
        toast.promise(
            async () => {
                const { error } = await supabase.from('projects').delete().eq('id', id).eq('user_id', user.id);
                if (error) throw error;
                setProjects(prev => prev.filter(p => p.id !== id));
            },
            {
                loading: t('deleting') || 'Suppression en cours...',
                success: t('deleted_success') || 'Élément supprimé définitivement',
                error: t('deleted_error') || 'Erreur lors de la suppression',
            }
        );
    };

    const handleDuplicate = async (project: Project) => {
        if (!user) return;

        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, created_at, ...projectData } = project;
            const newProject = {
                ...projectData,
                title: `${project.title} (Copie)`,
                user_id: user.id
            };

            const { data, error } = await supabase.from('projects').insert(newProject).select().single();

            if (error) throw error;

            if (data) {
                setProjects([data, ...projects]);
                toast.success(t('duplicated_success') || "Projet dupliqué avec succès");
            }
        } catch (error) {
            console.error("Error duplicating project:", error);
            toast.error(t('duplicated_error') || "Erreur lors de la duplication");
        }
    };

    // --- RENDER ---
    return (
        <div className="min-h-screen w-full bg-background text-foreground p-4 md:p-8 font-sans selection:bg-primary selection:text-primary-foreground relative">

            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] aspect-square bg-accent/5 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="w-full">

                    {/* COMPACT HEADER */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-6 md:mb-8 mt-2 md:mt-4 border-b border-border/50 pb-4 md:pb-6">
                        <div className="space-y-1 text-center md:text-left" >
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 md:hidden">
                                    <FlaskConical className="w-4 h-4 text-orange-500" />
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-none">
                                    {t('title')}
                                </h1>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-72 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder={t('search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-card border border-border rounded-full py-3.5 md:py-2 pl-10 pr-4 text-sm text-foreground focus:border-primary/30 outline-none transition-all placeholder:text-muted-foreground/30 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* HORIZONTAL STICKY FILTERS BAR */}
                    <div className="sticky top-0 md:top-6 z-40 mb-12 py-3 px-2 -mx-6 md:mx-auto w-screen md:w-fit md:max-w-4xl bg-background/95 md:bg-background/90 backdrop-blur-xl border-b md:border border-border md:rounded-xl shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-6 md:px-0">
                            <button
                                onClick={() => setActiveFilter('all')}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-[11px] md:text-xs font-bold transition-all shrink-0 flex items-center gap-2",
                                    activeFilter === 'all'
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-100"
                                        : "bg-card text-muted-foreground border border-border hover:bg-accent/10 hover:text-foreground"
                                )}
                            >
                                <div className={cn("w-1.5 h-1.5 rounded-full", activeFilter === 'all' ? "bg-primary-foreground" : "bg-muted-foreground/50")} />
                                {t('filter_all')}
                            </button>
                            <div className="h-5 w-[1px] bg-border mx-1 shrink-0" />

                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveFilter(cat.id)}
                                    className={cn(
                                        "px-3 py-2 rounded-lg text-[11px] md:text-xs font-bold transition-all shrink-0 flex items-center gap-2",
                                        activeFilter === cat.id
                                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-100"
                                            : "bg-card text-muted-foreground border border-border hover:bg-accent/10 hover:text-foreground"
                                    )}
                                >
                                    <cat.icon className={cn("w-3.5 h-3.5", activeFilter === cat.id ? "text-primary-foreground" : "opacity-50")} />
                                    {t('category_' + cat.id)}
                                    {activeFilter === cat.id && (
                                        <span className="ml-1 px-1 py-0.5 rounded-md bg-white/20 text-[8px] font-extrabold">{projects.filter(p => p.category === cat.id).length}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>



                    {/* RIGHT CONTENT GRID */}
                    <div className="flex-1 w-full text-center md:text-left">

                        {/* CAPTURE BAR - FLOATING BUBBLE (Moved Here) */}
                        <div className="w-full max-w-xl mx-auto mb-6 md:mb-10 relative z-50 px-0 sm:px-4 md:px-0">
                            <div className="bg-card backdrop-blur-2xl rounded-2xl shadow-2xl shadow-primary/20 border border-primary/20 ring-1 ring-primary/20 transition-all duration-300 hover:shadow-primary/30 hover:border-primary/50 focus-within:border-primary focus-within:ring-primary/40 focus-within:shadow-primary/40 relative">
                                <form onSubmit={handleQuickCapture} className={cn("flex flex-col transition-all duration-300", isExpanded ? "p-2" : "pl-2 pr-2 py-2 items-center flex-row")}>

                                    {isExpanded && (
                                        <input
                                            type="text"
                                            value={captureTitle}
                                            onChange={e => setCaptureTitle(e.target.value)}
                                            placeholder={t('capture_title_placeholder')}
                                            className="w-full bg-transparent border-none px-4 py-1.5 text-base font-bold placeholder:text-muted-foreground/30 focus:ring-0 focus:outline-none outline-none text-foreground"
                                            autoFocus
                                        />
                                    )}

                                    <div className="flex-1 w-full flex items-center">
                                        <input
                                            type="text"
                                            value={captureText}
                                            onChange={e => setCaptureText(e.target.value)}
                                            onFocus={() => setIsExpanded(true)}
                                            placeholder={
                                                isExpanded ? t('capture_desc_placeholder') :
                                                    selectedCategory === 'idea' ? t('capture_idea') :
                                                        selectedCategory === 'link' ? t('capture_link') :
                                                            selectedCategory === 'image' ? t('capture_image') :
                                                                selectedCategory === 'prompt' ? t('capture_prompt') :
                                                                    selectedCategory === 'tip' ? t('capture_tip') :
                                                                        t('capture_default')
                                            }
                                            className={cn(
                                                "bg-transparent border-none px-4 text-foreground focus:ring-0 focus:outline-none outline-none transition-all font-light placeholder:text-muted-foreground/30 w-full",
                                                isExpanded ? "text-sm min-h-[48px] align-top py-1.5" : "text-lg h-[60px] py-3 flex-1"
                                            )}
                                        />

                                        {!isExpanded && (
                                            /* Action Buttons Row for Condensed Mode - Logic handled below via conditional rendering of wrapper */
                                            null
                                        )}
                                    </div>

                                    {/* Action Buttons Row */}
                                    <div className={cn("flex items-center gap-2 shrink-0 self-end transition-all", isExpanded ? "mt-1 justify-end w-full border-t border-white/5 pt-2 px-2" : "")}>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                                                className={cn(
                                                    "h-10 px-3 rounded-xl flex items-center gap-2 transition-all font-medium text-sm",
                                                    showCategoryMenu
                                                        ? "bg-foreground text-background shadow-lg"
                                                        : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                                                )}
                                                title="Choisir le type"
                                            >
                                                {(() => {
                                                    const CatIcon = CATEGORIES.find(c => c.id === selectedCategory)?.icon || Plus;
                                                    return <CatIcon className="w-4 h-4" />;
                                                })()}
                                                <span className="hidden md:inline">{CATEGORIES.find(c => c.id === selectedCategory)?.label || "Type"}</span>
                                            </button>

                                            {showCategoryMenu && (
                                                <div className="absolute top-full right-0 mt-2 w-[280px] bg-[#1C1C1E] border border-white/10 rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 slide-in-from-top-2 z-[60]">
                                                    {CATEGORIES.map(cat => (
                                                        <button
                                                            key={cat.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedCategory(cat.id);
                                                                setShowCategoryMenu(false);
                                                                if (cat.id === 'image') {
                                                                    setTimeout(() => fileInputRef.current?.click(), 0);
                                                                }
                                                            }}
                                                            className={cn(
                                                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left sm:py-1.5 group outline-none focus:bg-white/10",
                                                                selectedCategory === cat.id
                                                                    ? "bg-white/10 text-white"
                                                                    : "hover:bg-white/5 text-gray-400 hover:text-white"
                                                            )}
                                                        >
                                                            <cat.icon className={cn("w-4 h-4 shrink-0", selectedCategory === cat.id ? "text-primary" : "group-hover:text-primary transition-colors")} />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium leading-none">{cat.label}</div>
                                                                <div className="text-[10px] text-muted-foreground/50 truncate mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity -ml-0.5">{cat.description}</div>
                                                            </div>
                                                            {selectedCategory === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {selectedCategory === 'image' && (
                                            <>
                                                <div className="w-[1px] h-8 bg-white/10 mx-1 animate-in fade-in" />
                                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && setImageFile(e.target.files[0])} />
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={cn("w-10 h-10 flex items-center justify-center rounded-xl transition-all border animate-in zoom-in-50", imageFile ? "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20" : "border-transparent text-gray-400 hover:text-white hover:bg-white/5")}
                                                    title="Ajouter une image"
                                                >
                                                    <ImageIcon className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={!captureText && !imageFile}
                                            className="h-10 w-10 flex items-center justify-center bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-orange-500/20"
                                        >
                                            <Send className="w-5 h-5 ml-0.5" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {projects.length === 0 && !loading ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-30 mt-10">
                                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                                    <Search className="w-10 h-10 text-gray-600" />
                                </div>
                                <p className="text-xl font-light text-gray-500">{t('empty_studio')}</p>
                            </div>
                        ) : loading ? (
                            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-72 bg-[#1C1C1E] rounded-3xl animate-pulse mb-6 border border-white/5" />)}
                            </div>
                        ) : (
                            <div className="space-y-12 min-h-[40vh]">
                                {projects.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-center animate-in fade-in zoom-in-95 duration-500">
                                        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 border border-border">
                                            <Search className="w-6 h-6 text-muted-foreground/30" />
                                        </div>
                                        {debouncedSearch ? (
                                            <>
                                                <h3 className="text-xl font-light text-foreground mb-2">{t('no_trace')} &quot;{debouncedSearch}&quot;</h3>
                                                <p className="text-muted-foreground">{t('try_other_keyword')}</p>
                                            </>
                                        ) : (
                                            <>
                                                <h3 className="text-xl font-light text-foreground mb-2">{t('calm_before_storm')}</h3>
                                                <p className="text-muted-foreground">{t('capture_first_idea')}</p>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    Object.entries(
                                        projects.reduce((groups, project) => {
                                            const date = new Date(project.created_at);
                                            const today = new Date();
                                            const yesterday = new Date();
                                            yesterday.setDate(yesterday.getDate() - 1);

                                            let key = date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });

                                            if (date.toDateString() === today.toDateString()) key = t('today');
                                            else if (date.toDateString() === yesterday.toDateString()) key = t('yesterday');

                                            if (!groups[key]) groups[key] = [];
                                            groups[key].push(project);
                                            return groups;
                                        }, {} as Record<string, typeof projects>)
                                    ).map(([dateLabel, groupProjects]) => (
                                        <div key={dateLabel} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                            <div className="flex items-center gap-4 mb-4 px-2 md:px-0">
                                                <h2 className="text-sm font-bold text-muted-foreground tracking-tight capitalize">{dateLabel}</h2>
                                                <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                            </div>

                                            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                                                {groupProjects.map((project) => (
                                                    <StudioCard
                                                        key={project.id}
                                                        project={project}
                                                        onEdit={setEditingProject}
                                                        onDelete={handleDelete}
                                                        onDuplicate={handleDuplicate}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div >

            {/* EDIT SHEET (Replaces old Modal) */}
            <StudioEditSheet
                project={editingProject}
                open={!!editingProject}
                onOpenChange={(open) => !open && setEditingProject(null)}
                onUpdate={fetchProjects}
            />
        </div >
    );
}
