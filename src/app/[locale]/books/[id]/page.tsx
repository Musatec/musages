"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Plus, Trash2, Edit3, FileText, Loader2, Download } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Book, Chapter } from "@/types/books";

export default function BookDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useSupabase();

    const [book, setBook] = useState<Book | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreatingChapter, setIsCreatingChapter] = useState(false);
    const [newChapterTitle, setNewChapterTitle] = useState("");

    // Edit Book State
    const [isEditingBook, setIsEditingBook] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editSummary, setEditSummary] = useState("");
    const [editCoverUrl, setEditCoverUrl] = useState("");
    const [editStatus, setEditStatus] = useState("draft");
    const [isSavingBook, setIsSavingBook] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const { data: bookData, error: bookError } = await supabase
                .from('books')
                .select('*')
                .eq('id', id)
                .eq('user_id', user?.id)
                .single();

            if (bookError) throw bookError;
            setBook(bookData);
            setEditTitle(bookData.title);
            setEditSummary(bookData.summary || "");
            setEditCoverUrl(bookData.cover_url || "");
            setEditStatus(bookData.status || "draft");

            const { data: chaptersData, error: chaptersError } = await supabase
                .from('chapters')
                .select('*')
                .eq('book_id', id)
                .order('order_index', { ascending: true });

            if (chaptersError) throw chaptersError;
            setChapters(chaptersData || []);

        } catch {
            toast.error("Erreur de chargement du livre");
        } finally {
            setLoading(false);
        }
    }, [id, user?.id]);

    useEffect(() => {
        if (id) fetchData();
    }, [id, fetchData]);


    const handleUpdateBook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !user) return;
        setIsSavingBook(true);
        try {
            const { error } = await supabase
                .from('books')
                .update({
                    title: editTitle,
                    summary: editSummary,
                    cover_url: editCoverUrl,
                    status: editStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('user_id', user?.id);

            if (error) throw error;
            toast.success("Livre mis à jour !");
            setIsEditingBook(false);
            fetchData();
        } catch {
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setIsSavingBook(false);
        }
    };

    const handleDeleteBook = async () => {
        if (!confirm("Voulez-vous vraiment supprimer ce livre ?")) return;
        try {
            if (!user) return;
            await supabase.from('books').delete().eq('id', id).eq('user_id', user.id);
            router.push('/books');
            toast.success("Livre supprimé");
        } catch (error: unknown) {
            console.error(error);
            toast.error("Erreur suppression");
        }
    };

    const handleAddChapter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChapterTitle.trim() || !user) return;
        try {
            const nextOrder = chapters.length > 0 ? Math.max(...chapters.map(c => c.order_index)) + 1 : 1;
            const { error } = await supabase.from('chapters').insert({
                book_id: id,
                user_id: user?.id, // SaaS Isolation
                title: newChapterTitle,
                order_index: nextOrder,
                content: "",
                status: 'draft'
            });
            if (error) throw error;
            setNewChapterTitle("");
            setIsCreatingChapter(false);
            fetchData();
        } catch { toast.error("Erreur création chapitre"); }
    };

    const handleDeleteChapter = async (chapterId: string) => {
        if (!confirm("Supprimer ce chapitre ?")) return;
        try {
            await supabase.from('chapters').delete().eq('id', chapterId);
            fetchData();
        } catch (error: unknown) {
            console.error(error);
            toast.error("Erreur");
        }
    };

    const handleExportPDF = async () => {
        if (!book || chapters.length === 0) {
            toast.error("Rien à exporter.");
            return;
        }
        setIsExporting(true);
        const tid = toast.loading("Génération du manuscrit...");
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const element = document.createElement('div');
            element.style.padding = "40px";
            element.style.color = "#000";
            element.style.background = "#fff";
            element.style.fontFamily = "serif";

            element.innerHTML = `
                <div style="text-align: center; margin-top: 100px; page-break-after: always;">
                    ${book.cover_url ? `<img src="${book.cover_url}" style="width: 240px; height: 360px; object-fit: cover; margin-bottom: 40px; border: 1px solid #ddd; box-shadow: 0 10px 20px rgba(0,0,0,0.1);">` : ''}
                    <h1 style="font-size: 42px; margin-bottom: 5px;">${book.title}</h1>
                    <p style="font-size: 18px; color: #666; margin-bottom: 60px;">Par ${user?.user_metadata?.full_name || 'Auteur MINDOS'}</p>
                    <div style="max-width: 500px; margin: 0 auto; text-align: left; line-height: 1.6; border-top: 1px solid #eee; padding-top: 30px;">
                        <h3 style="text-transform: uppercase; font-size: 12px; letter-spacing: 2px; color: #888;">Résumé</h3>
                        <p style="font-style: italic;">${book.summary || "Aucun résumé disponible."}</p>
                    </div>
                </div>
                <div style="page-break-after: always; padding: 40px;">
                    <h2 style="border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 40px;">Sommaire</h2>
                    <ul style="list-style: none; padding: 0;">
                        ${chapters.map((c, i) => `
                            <li style="display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px dotted #ccc; padding-bottom: 5px;">
                                <span>Chapitre ${i + 1} : ${c.title}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;

            chapters.forEach((chapter, index) => {
                const chapterDiv = document.createElement('div');
                chapterDiv.style.pageBreakAfter = "always";
                chapterDiv.innerHTML = `
                    <h2 style="font-size: 28px; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 30px; margin-top: 40px;">
                        <span style="font-size: 12px; text-transform: uppercase; color: #aaa; display: block; margin-bottom: 5px;">Chapitre ${index + 1}</span>
                        ${chapter.title}
                    </h2>
                    <div style="line-height: 1.8; font-size: 16px; text-align: justify; color: #333;">
                        ${chapter.content || '<p style="color: #999; font-style: italic;">Contenu en cours de rédaction...</p>'}
                    </div>
                `;
                element.appendChild(chapterDiv);
            });

            const opt = {
                margin: 0.75,
                filename: `${book.title}_MINDOS.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            } as Record<string, unknown>;

            await html2pdf().from(element).set(opt).save();
            toast.dismiss(tid);
            toast.success("Manuscrit généré ! ✨");
        } catch (error) {
            console.error(error);
            toast.dismiss(tid);
            toast.error("Erreur génération PDF");
        } finally {
            setIsExporting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Chargement du manuscrit...</div>;
    if (!book) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Livre introuvable</div>;

    return (
        <div className="min-h-screen w-full bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-[#F97316] relative">
            <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-gray-900/40 to-transparent -z-10" />

            <div className="max-w-5xl mx-auto space-y-12">
                <Link href="/books" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Retour à la bibliothèque</span>
                </Link>

                {isEditingBook ? (
                    <form onSubmit={handleUpdateBook} className="bg-[#1C1C1E] p-8 rounded-3xl border border-white/5 space-y-8 animate-in fade-in zoom-in-95">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Titre</label>
                                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-lg font-bold focus:border-[#F97316] outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Statut</label>
                                <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none">
                                    <option value="draft">📝 Brouillon</option>
                                    <option value="published">✨ Publié</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Résumé</label>
                            <textarea value={editSummary} onChange={e => setEditSummary(e.target.value)} className="w-full h-32 bg-black/40 border border-white/5 rounded-xl px-4 py-3 focus:border-[#F97316] outline-none resize-none" />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <button type="button" onClick={() => setIsEditingBook(false)} className="px-6 py-2 text-gray-500 hover:text-white transition-colors">Annuler</button>
                            <button type="submit" disabled={isSavingBook} className="px-8 py-2 bg-[#F97316] text-white font-bold rounded-xl hover:bg-orange-600 transition-all">Enregistrer</button>
                        </div>
                    </form>
                ) : (
                    <div className="flex flex-col md:flex-row gap-12 items-start">
                        <div className="w-56 shrink-0 aspect-[2/3] relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                            {book.cover_url ? (
                                <Image src={book.cover_url} alt={book.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center p-6 text-center">
                                    <span className="text-sm font-black text-white/20 uppercase">{book.title}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border", book.status === 'published' ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-orange-500/10 border-orange-500/20 text-orange-400")}>
                                        {book.status === 'published' ? 'Statut : Publié' : 'Statut : Brouillon'}
                                    </span>
                                </div>
                                <h1 className="text-6xl font-black tracking-tighter">{book.title}</h1>
                                <p className="text-gray-400 text-lg leading-relaxed max-w-2xl italic">&quot;{book.summary || "Aucun résumé pour le moment."}&quot;</p>
                            </div>
                            <div className="flex items-center gap-3 pt-4">
                                <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-[#F97316] hover:text-white transition-all active:scale-95 disabled:opacity-50">
                                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                    Exporter PDF
                                </button>
                                <button onClick={() => setIsEditingBook(true)} className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                                    <Edit3 className="w-4 h-4 text-[#F97316]" />
                                    Modifier
                                </button>
                                <button onClick={handleDeleteBook} className="p-3 bg-red-500/10 border border-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-8 pt-12 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <FileText className="w-6 h-6 text-[#F97316]" />
                            Table des Matières
                            <span className="text-xs text-gray-600 font-mono ml-2">[{chapters.length} chapitres]</span>
                        </h2>
                        <button onClick={() => setIsCreatingChapter(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-[#F97316]/10 text-[#F97316] font-bold rounded-xl transition-all border border-[#F97316]/20">
                            <Plus className="w-4 h-4" />
                            Nouveau Chapitre
                        </button>
                    </div>

                    {isCreatingChapter && (
                        <form onSubmit={handleAddChapter} className="flex gap-4 p-4 bg-[#1C1C1E] border border-[#F97316]/30 rounded-2xl animate-in slide-in-from-top-4">
                            <input autoFocus placeholder="Titre du nouveau chapitre..." value={newChapterTitle} onChange={e => setNewChapterTitle(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-white" />
                            <button type="submit" className="px-6 py-2 bg-[#F97316] text-white font-bold rounded-xl">Ajouter</button>
                            <button type="button" onClick={() => setIsCreatingChapter(false)} className="px-4 py-2 text-gray-500">Annuler</button>
                        </form>
                    )}

                    <div className="grid grid-cols-1 gap-3">
                        {chapters.map((chapter, idx) => (
                            <div key={chapter.id} className="group bg-[#1C1C1E]/50 border border-white/5 hover:border-[#F97316]/30 hover:bg-[#1C1C1E] rounded-2xl p-5 transition-all flex items-center justify-between">
                                <Link href={`/books/${id}/chapter/${chapter.id}`} className="flex-1 flex items-center gap-6">
                                    <span className="text-sm font-black text-gray-700 font-mono">{(idx + 1).toString().padStart(2, '0')}</span>
                                    <div>
                                        <p className="font-bold text-white group-hover:text-[#F97316] transition-colors">{chapter.title}</p>
                                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">Dernière modification : {new Date(chapter.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </Link>
                                <button onClick={() => handleDeleteChapter(chapter.id)} className="p-2 text-gray-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
