"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft, Save, Loader2,
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading1, Heading2,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List as ListIcon, Quote as QuoteIcon, Undo, Redo,
    Palette
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Tiptap Imports
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';

export default function ChapterEditorPage() {
    const { id: bookId, chapterId } = useParams();
    const router = useRouter();
    const { user } = useSupabase();

    const [title, setTitle] = useState("");
    // const [content, setContent] = useState(""); // Content is now managed by Tiptap editor
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [wordCount, setWordCount] = useState(0);

    // const textareaRef = useRef<HTMLTextAreaElement>(null); // No longer needed with Tiptap

    // Apply Format Helper (No longer needed with Tiptap)
    // const applyFormat = (prefix: string, suffix: string = "") => {
    //     if (!textareaRef.current) return;

    //     const start = textareaRef.current.selectionStart;
    //     const end = textareaRef.current.selectionEnd;
    //     const text = textareaRef.current.value;

    //     const before = text.substring(0, start);
    //     const selection = text.substring(start, end);
    //     const after = text.substring(end);

    //     const newText = before + prefix + selection + suffix + after;
    //     setContent(newText);

    //     // Restore focus and selection
    //     setTimeout(() => {
    //         if (textareaRef.current) {
    //             textareaRef.current.focus();
    //             textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
    //         }
    //     }, 0);
    // };

    // Initialize Editor
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Color,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Placeholder.configure({
                placeholder: 'Commencez à écrire votre histoire...',
            }),
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[60vh] prose-p:text-gray-300 prose-headings:text-white prose-headings:font-bold prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl font-serif',
            },
        },
        onUpdate: ({ editor }) => {
            const text = editor.getText();
            setWordCount(text.trim().split(/\s+/).filter(w => w.length > 0).length);
            // If you need to store the content in a state variable for other purposes, you can do it here:
            // setContent(editor.getHTML());
        },
    });

    // Fetch Chapter
    useEffect(() => {
        const fetchChapter = async () => {
            try {
                const { data, error } = await supabase
                    .from('chapters')
                    .select('*')
                    .eq('id', chapterId)
                    .eq('user_id', user?.id) // SaaS Isolation
                    .single();

                if (error) throw error;
                setTitle(data.title);

                // Set initial content
                if (editor && data.content) {
                    editor.commands.setContent(data.content);
                }

                setLastSaved(new Date(data.updated_at));
            } catch (error: unknown) {
                console.error(error);
                toast.error("Impossible de charger le chapitre");
                router.push(`/books/${bookId}`);
            } finally {
                setLoading(false);
            }
        };

        if (chapterId && editor) fetchChapter(); // Depend on editor to be ready
    }, [chapterId, bookId, router, editor, user?.id]);

    // Word Count (No longer needed, handled by Tiptap onUpdate)
    // useEffect(() => {
    //     const count = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    //     setWordCount(count);
    // }, [content]);

    // Auto-resize textarea (No longer needed, Tiptap handles this)
    // useEffect(() => {
    //     if (textareaRef.current) {
    //         textareaRef.current.style.height = 'auto';
    //         textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    //     }
    // }, [content]);

    const handleSave = useCallback(async () => {
        if (!chapterId || !editor) return;
        setSaving(true);
        try {
            const now = new Date();
            const contentHtml = editor.getHTML(); // Save HTML for WYSIWYG

            const { error } = await supabase
                .from('chapters')
                .update({
                    title,
                    content: contentHtml,
                    updated_at: now.toISOString()
                })
                .eq('id', chapterId)
                .eq('user_id', user?.id); // SaaS Isolation

            if (error) throw error;
            setLastSaved(now);
            toast.success("Chapitre sauvegardé !");
        } catch (error: unknown) {
            toast.error("Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    }, [chapterId, editor, title, user?.id]);

    // Keyboard shortcut for save (Ctrl+S)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSave]); // editor and title dependencies now move to handleSave useCallback


    if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Chargement...</div>;

    return (
        <div className="min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-[#F97316] selection:text-white relative flex flex-col">

            {/* TOP BAR */}
            <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/books/${bookId}`} className="p-2 -ml-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-6 w-[1px] bg-white/10" />
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="bg-transparent border-none outline-none text-lg font-bold text-white placeholder:text-gray-600 focus:ring-0 w-64 md:w-96"
                        placeholder="Titre du chapitre..."
                    />
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end text-xs text-gray-500">
                        <span>{wordCount} mots</span>
                        <span>{lastSaved ? `Sauvegardé à ${lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : 'Non sauvegardé'}</span>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-full font-medium text-sm transition-all shadow-lg",
                            saving
                                ? "bg-white/10 text-gray-400 cursor-wait"
                                : "bg-[#F97316] hover:bg-orange-600 text-white shadow-orange-500/20 active:scale-95"
                        )}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Enregistrer</span>
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* FORMATTING TOOLBAR */}
            {editor && (
                <div className="sticky top-16 z-40 bg-[#0A0A0A] border-b border-white/5 py-2 flex justify-center gap-2 overflow-x-auto no-scrollbar px-4">

                    {/* Undo/Redo */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                        <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30"><Undo className="w-4 h-4" /></button>
                        <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30"><Redo className="w-4 h-4" /></button>
                    </div>

                    <div className="w-[1px] h-6 bg-white/10 mx-2 self-center" />

                    {/* Text Style */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                        <button onClick={() => editor.chain().focus().toggleBold().run()} className={cn("p-1.5 rounded transition-colors", editor.isActive('bold') ? "bg-white/20 text-white" : "text-gray-400 hover:text-white")}><Bold className="w-4 h-4" /></button>
                        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={cn("p-1.5 rounded transition-colors", editor.isActive('italic') ? "bg-white/20 text-white" : "text-gray-400 hover:text-white")}><Italic className="w-4 h-4" /></button>
                        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={cn("p-1.5 rounded transition-colors", editor.isActive('underline') ? "bg-white/20 text-white" : "text-gray-400 hover:text-white")}><UnderlineIcon className="w-4 h-4" /></button>
                        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={cn("p-1.5 rounded transition-colors", editor.isActive('strike') ? "bg-white/20 text-white" : "text-gray-400 hover:text-white")}><Strikethrough className="w-4 h-4" /></button>

                        {/* Color Picker */}
                        <div className="relative p-1.5 rounded hover:bg-white/10 cursor-pointer group">
                            <Palette className={cn("w-4 h-4", editor.getAttributes('textStyle').color ? "text-white" : "text-gray-400")} style={{ color: editor.getAttributes('textStyle').color }} />
                            <input
                                type="color"
                                onInput={(e: React.ChangeEvent<HTMLInputElement>) => editor.chain().focus().setColor(e.target.value).run()}
                                value={editor.getAttributes('textStyle').color || '#ffffff'}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                        </div>
                    </div>

                    <div className="w-[1px] h-6 bg-white/10 mx-2 self-center" />

                    {/* Headings */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={cn("p-1.5 rounded transition-colors", editor.isActive('heading', { level: 1 }) ? "bg-white/20 text-white" : "text-gray-400 hover:text-white")}><Heading1 className="w-4 h-4" /></button>
                        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={cn("p-1.5 rounded transition-colors", editor.isActive('heading', { level: 2 }) ? "bg-white/20 text-white" : "text-gray-400 hover:text-white")}><Heading2 className="w-4 h-4" /></button>
                    </div>

                    <div className="w-[1px] h-6 bg-white/10 mx-2 self-center" />

                    {/* Alignment */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                        <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={cn("p-1.5 rounded transition-colors", editor.isActive({ textAlign: 'left' }) ? "bg-white/20 text-white" : "text-gray-400 hover:text-white")}><AlignLeft className="w-4 h-4" /></button>
                        <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={cn("p-1.5 rounded transition-colors", editor.isActive({ textAlign: 'center' }) ? "bg-white/20 text-white" : "text-gray-400 hover:text-white")}><AlignCenter className="w-4 h-4" /></button>
                        <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={cn("p-1.5 rounded transition-colors", editor.isActive({ textAlign: 'right' }) ? "bg-white/20 text-white" : "text-gray-400 hover:text-white")}><AlignRight className="w-4 h-4" /></button>
                        <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={cn("p-1.5 rounded transition-colors", editor.isActive({ textAlign: 'justify' }) ? "bg-white/20 text-white" : "text-gray-400 hover:text-white")}><AlignJustify className="w-4 h-4" /></button>
                    </div>

                    <div className="w-[1px] h-6 bg-white/10 mx-2 self-center" />

                    {/* Extras */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={cn("p-1.5 rounded transition-colors", editor.isActive('bulletList') ? "bg-white/20 text-white" : "text-gray-400 hover:text-white")}><ListIcon className="w-4 h-4" /></button>
                        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={cn("p-1.5 rounded transition-colors", editor.isActive('blockquote') ? "bg-white/20 text-white" : "text-gray-400 hover:text-white")}><QuoteIcon className="w-4 h-4" /></button>
                    </div>
                </div>
            )}

            {/* EDITOR AREA */}
            <main className="flex-1 w-full max-w-3xl mx-auto p-6 md:p-12 pb-32">
                <EditorContent editor={editor} />
            </main>

            {/* STATUS BAR (Mobile Only) */}
            <div className="md:hidden fixed bottom-6 left-6 right-6 bg-[#1C1C1E] border border-white/10 rounded-full px-4 py-2 flex items-center justify-between text-xs text-gray-400 shadow-xl backdrop-blur-md">
                <span>{wordCount} mots</span>
                <span>{saving ? "Sauvegarde..." : lastSaved ? "Enregistré" : ""}</span>
            </div>

        </div>
    );
}
