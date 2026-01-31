"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Book, BookOpen, Search, X, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/components/providers/supabase-provider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Book as BookType } from "@/types/books";

// Loading Skeleton Component
const BookSkeleton = () => (
    <div className="flex flex-col gap-3">
        <div className="aspect-[2/3] w-full rounded-r-xl rounded-l-sm bg-white/5 animate-pulse border-l-4 border-l-white/10" />
        <div className="space-y-2">
            <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
            <div className="flex justify-between">
                <div className="h-3 w-1/4 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-1/4 bg-white/5 rounded animate-pulse" />
            </div>
        </div>
    </div>
);

export default function BooksPage() {
    const { user } = useSupabase();
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<'updated' | 'title' | 'chapters'>('updated');
    const [books, setBooks] = useState<BookType[]>([]);
    const [loading, setLoading] = useState(true);

    // Create State
    const [isCreating, setIsCreating] = useState(false);
    const [newBookTitle, setNewBookTitle] = useState("");
    const [selectedColor, setSelectedColor] = useState("blue");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Books
    const fetchBooks = useCallback(async () => {
        if (!user) return;
        setLoading(true); // Ensure loading is true when starting fetch
        try {
            const { data, error } = await supabase
                .from('books')
                .select('*, chapters(count)')
                .eq('user_id', user.id);

            if (error) throw error;
            setBooks(data as BookType[] || []);
        } catch (error: unknown) {
            console.error("Error fetching books:", error);
            toast.error("Erreur de chargement des livres");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    const handleCreateBook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBookTitle.trim() || !user) return;
        setIsSubmitting(true);

        try {
            const { error } = await supabase.from('books').insert({
                title: newBookTitle,
                user_id: user.id,
                status: 'draft',
                color: `from-${selectedColor}-600 to-gray-900`
            });

            if (error) throw error;

            toast.success("Nouveau livre commencé ! 📖");
            setNewBookTitle("");
            setIsCreating(false);
            fetchBooks();
        } catch (error: unknown) {
            console.error(error);
            toast.error("Impossible de créer le livre.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const sortedAndFilteredBooks = books
        .filter(b =>
            b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.summary && b.summary.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            if (sortBy === 'chapters') {
                const countsA = a.chapters?.[0]?.count || 0;
                const countsB = b.chapters?.[0]?.count || 0;
                return countsB - countsA;
            }
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });

    return (
        <div className="min-h-screen w-full bg-background text-foreground p-4 md:p-12 font-sans selection:bg-primary selection:text-primary-foreground relative overflow-hidden">

            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8 mb-6 md:mb-12 mt-2 md:mt-0">
                    <div>
                        <p className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-primary uppercase mb-1 md:mb-2">
                            Bibliothèque
                        </p>
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-thin tracking-tight text-foreground leading-none">
                            Mes Livres
                        </h1>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full bg-card border border-border rounded-full py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-primary/30 outline-none transition-all placeholder:text-muted-foreground/30"
                                />
                            </div>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                className="bg-card border border-border text-muted-foreground text-xs rounded-full py-2.5 px-4 outline-none hover:text-foreground transition-colors cursor-pointer appearance-none min-w-[120px]"
                            >
                                <option value="updated">Récents</option>
                                <option value="title">A-Z</option>
                                <option value="chapters">Chapitres</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setIsCreating(true)}
                            className="h-10 px-4 bg-primary hover:opacity-90 text-primary-foreground rounded-full flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-primary/20 active:scale-95 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nouveau Livre</span>
                        </button>
                    </div>
                </div>

                {/* CREATE MODAL (Simplistic Layer) */}
                {isCreating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 slide-in-from-bottom-5">
                            <button onClick={() => setIsCreating(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-xl font-bold text-foreground mb-1">Nouveau Manuscrit</h2>
                            <p className="text-sm text-muted-foreground mb-6">Quel est le titre de votre prochaine œuvre ?</p>

                            <form onSubmit={handleCreateBook} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Titre du manuscrit</label>
                                    <input
                                        type="text"
                                        autoFocus
                                        placeholder="Ex: Les Chroniques de Musa..."
                                        value={newBookTitle}
                                        onChange={e => setNewBookTitle(e.target.value)}
                                        className="w-full bg-background/20 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none text-lg font-medium"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Couleur de la couverture</label>
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { id: 'red', class: 'bg-red-600' },
                                            { id: 'orange', class: 'bg-orange-600' },
                                            { id: 'green', class: 'bg-green-600' },
                                            { id: 'amber', class: 'bg-amber-600' },
                                            { id: 'stone', class: 'bg-stone-600' },
                                            { id: 'pink', class: 'bg-pink-600' },
                                            { id: 'slate', class: 'bg-slate-600' },
                                        ].map((color) => (
                                            <button
                                                key={color.id}
                                                type="button"
                                                onClick={() => setSelectedColor(color.id)}
                                                className={cn(
                                                    "w-8 h-8 rounded-full border-2 transition-all transform hover:scale-110",
                                                    color.class,
                                                    selectedColor === color.id ? "border-foreground scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "border-transparent"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newBookTitle.trim() || isSubmitting}
                                        className="px-6 py-2 rounded-lg text-sm font-black bg-primary hover:opacity-90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/10 flex items-center gap-2 uppercase tracking-widest"
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Commencer l'écriture"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* BOOK GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 pb-32">
                    {/* New Book Card (Ghost) */}
                    <button
                        onClick={() => setIsCreating(true)}
                        className="group relative aspect-[2/3] rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-background/40 hover:bg-accent/5 flex flex-col items-center justify-center gap-4 transition-all duration-300"
                    >
                        <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-muted-foreground group-hover:text-foreground" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Créer un livre</span>
                    </button>

                    {loading ? (
                        <>
                            {[1, 2, 3, 4].map((i) => (
                                <BookSkeleton key={i} />
                            ))}
                        </>
                    ) : (
                        <>
                            {sortedAndFilteredBooks.map((book) => (
                                <Link
                                    key={book.id}
                                    href={`/books/${book.id}`}
                                    className="group relative flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-500"
                                >
                                    {/* Book Cover */}
                                    <div className="relative aspect-[2/3] w-full rounded-r-xl rounded-l-sm bg-card shadow-2xl transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] overflow-hidden border-l-4 border-l-border">
                                        {/* Spine effect */}
                                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/10 z-20" />
                                        <div className="absolute left-[3px] top-0 bottom-0 w-[1px] bg-black/30 z-20" />

                                        {/* Badge Status */}
                                        <div className="absolute top-3 right-3 z-30">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[8px] font-bold border backdrop-blur-md uppercase tracking-wider",
                                                book.status === 'published'
                                                    ? "border-green-500/50 text-green-400 bg-green-500/10"
                                                    : "border-orange-500/20 text-orange-500 bg-orange-500/10"
                                            )}>
                                                {book.status === 'published' ? 'Publié' : 'Brouillon'}
                                            </span>
                                        </div>

                                        {book.cover_url ? (
                                            <Image
                                                src={book.cover_url}
                                                alt={book.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className={cn("absolute inset-0 bg-gradient-to-br flex flex-col p-6 justify-between", book.color || "from-zinc-800 to-zinc-900")}>
                                                <div className="text-white/20">
                                                    <Book className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-xl font-black font-sans text-foreground/90 leading-tight uppercase tracking-wider line-clamp-4 break-words">
                                                    {book.title}
                                                </h3>
                                                <div className="w-8 h-[2px] bg-white/50" />
                                            </div>
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/60 opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                                            <span className="px-4 py-2 rounded-full border border-white/20 text-white text-[10px] md:text-xs font-medium bg-black/20 backdrop-blur-md">
                                                Ouvrir le livre
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-1">
                                        <h3 className="text-white font-medium leading-tight group-hover:text-[#F97316] transition-colors line-clamp-1">
                                            {book.title}
                                        </h3>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="w-3 h-3" />
                                                {book.chapters?.[0]?.count || 0} chaps
                                            </span>
                                            <span>
                                                {/* Simple date format */}
                                                {new Date(book.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {sortedAndFilteredBooks.length === 0 && searchQuery && (
                                <div className="col-span-full py-20 text-center space-y-4">
                                    <div className="text-gray-600 text-5xl">🔭</div>
                                    <p className="text-gray-500">Aucun manuscrit trouvé pour &quot;<span className="text-white font-medium">{searchQuery}</span>&quot;</p>
                                    <button onClick={() => setSearchQuery("")} className="text-[#F97316] text-sm hover:underline">Effacer la recherche</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
