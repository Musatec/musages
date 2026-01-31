"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { Book, Chapter } from "@/types/books";
import Image from "next/image";

export default function BookPreviewPage() {
    const { id } = useParams();
    const router = useRouter();

    const [book, setBook] = useState<Book | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch Book & Chapters
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // Fetch Book
                const { data: bookData, error: bookError } = await supabase
                    .from('books')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (bookError) throw bookError;
                setBook(bookData);

                // Fetch Chapters
                const { data: chaptersData, error: chaptersError } = await supabase
                    .from('chapters')
                    .select('*')
                    .eq('book_id', id)
                    .order('order_index', { ascending: true });

                if (chaptersError) throw chaptersError;
                setChapters(chaptersData || []);

            } catch (error) {
                console.error(error);
                router.push(`/books/${id}`);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, router]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="min-h-screen bg-white text-black flex items-center justify-center font-serif">Chargement du manuscrit...</div>;
    if (!book) return null;

    return (
        <div className="min-h-screen w-full bg-[#fdfaf7] text-gray-900 font-serif print:bg-white print:text-black">

            {/* Nav (Hidden in Print) */}
            <nav className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center bg-white/80 backdrop-blur border-b border-gray-200 z-50 print:hidden">
                <Link href={`/books/${id}`} className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-sans text-sm font-medium">Retour à l&apos;éditeur</span>
                </Link>
                <div className="flex gap-4">
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-sans text-sm">
                        <Printer className="w-4 h-4" />
                        Imprimer / PDF
                    </button>
                </div>
            </nav>

            {/* MANUSCRIPT CONTENT */}
            <main className="max-w-3xl mx-auto pt-32 pb-32 px-8 print:pt-0 print:px-0 print:max-w-none">

                {/* Title Page */}
                <div className="min-h-[80vh] flex flex-col justify-center items-center text-center mb-24 print:break-after-page print:min-h-screen">
                    {book.cover_url && (
                        <div className="w-48 h-72 mb-12 shadow-xl print:hidden relative">
                            <Image src={book.cover_url} alt="Cover" fill className="object-cover" />
                        </div>
                    )}
                    <h1 className="text-5xl md:text-7xl font-bold mb-6">{book.title}</h1>
                    <p className="text-xl text-gray-600 mb-12">Un roman écrit avec MINDOS</p>

                    {book.summary && (
                        <div className="max-w-lg mx-auto text-gray-500 italic leading-relaxed">
                            {book.summary}
                        </div>
                    )}
                </div>

                {/* Chapters */}
                <div className="space-y-24 print:space-y-0">
                    {chapters.map((chapter, idx) => (
                        <article key={chapter.id} className="print:break-before-page pt-12">
                            <div className="text-center mb-12">
                                <span className="text-sm uppercase tracking-widest text-gray-400 mb-2 block font-sans">Chapitre {idx + 1}</span>
                                <h2 className="text-3xl font-bold">{chapter.title}</h2>
                            </div>

                            <div
                                className="prose prose-lg prose-gray max-w-none text-justify leading-loose"
                                dangerouslySetInnerHTML={{ __html: chapter.content || "<p className='text-gray-400 italic text-center'>[Chapitre vide]</p>" }}
                            />

                            <div className="flex justify-center mt-16 mb-16">
                                <span className="text-gray-300 text-xl">***</span>
                            </div>
                        </article>
                    ))}

                    {chapters.length === 0 && (
                        <p className="text-center text-gray-400 italic">Ce livre ne contient encore aucun chapitre.</p>
                    )}
                </div>

                {/* End Page */}
                <div className="mt-32 text-center text-gray-400 text-sm print:break-before-page py-32">
                    <p>Fin du manuscrit</p>
                    <p className="mt-2">Généré par MINDOS Studio</p>
                </div>

            </main>
        </div>
    );
}
