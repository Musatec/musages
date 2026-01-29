"use client";

import { type Editor } from '@tiptap/react';
import {
    Bold, Italic, Underline, Highlighter,
    Heading1, Heading2,
    List, CheckSquare,
    Image as ImageIcon, Table as TableIcon,
    Code2, AlignLeft, AlignCenter, AlignRight,
    Undo, Redo, Type
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useRef } from 'react';

// Declaration merging is handled in editor.tsx, but good to have here if needed isolated.
// But we can skip it here if editor.tsx handles the extension registration properly.

interface EditorToolbarProps {
    editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!editor) return null;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const src = event.target?.result as string;
                if (src) {
                    editor.chain().focus().setImage({ src }).run();
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full max-w-[900px] flex items-center justify-between gap-2 px-1">

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
            />

            <div className="flex flex-wrap items-center gap-1 bg-card/60 backdrop-blur-md rounded-xl border border-border p-1 shadow-2xl">

                {/* History */}
                <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-1">
                    <Toggle onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} icon={Undo} />
                    <Toggle onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} icon={Redo} />
                </div>

                {/* Headings */}
                <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-1">
                    <Toggle onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={Heading1} />
                    <Toggle onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} />
                </div>

                {/* Colors & Size */}
                <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-1">
                    <input
                        type="color"
                        onInput={(event: React.FormEvent<HTMLInputElement>) => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
                        value={editor.getAttributes('textStyle').color || '#ffffff'}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-none appearance-none p-0 overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-md"
                        title="Couleur du texte"
                    />
                    <button
                        onClick={() => {
                            const current = parseInt(editor.getAttributes('textStyle').fontSize || '18');
                            editor.commands.setFontSize((current + 2).toString());
                        }}
                        className="p-1 rounded hover:bg-accent/10 text-muted-foreground hover:text-foreground"
                        title="Augmenter police"
                    >
                        <Type className="h-3 w-3 text-xs" />
                        <span className="text-[10px] align-top font-bold">+</span>
                    </button>
                    <button
                        onClick={() => {
                            const current = parseInt(editor.getAttributes('textStyle').fontSize || '18');
                            if (current > 12) editor.commands.setFontSize((current - 2).toString());
                        }}
                        className="p-1 rounded hover:bg-accent/10 text-[10px] font-bold text-muted-foreground hover:text-foreground"
                        title="Diminuer police"
                    >
                        A-
                    </button>
                </div>

                {/* Basics */}
                <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-1">
                    <Toggle onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
                    <Toggle onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
                    <Toggle onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={Underline} />
                    <Toggle onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} icon={Highlighter} className={editor.isActive('highlight') ? "text-yellow-400" : ""} />
                </div>

                {/* Alignment */}
                <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-1 hidden sm:flex">
                    <Toggle onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} />
                    <Toggle onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} />
                    <Toggle onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} icon={AlignRight} />
                </div>

                {/* Lists */}
                <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-1">
                    <Toggle onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} />
                    <Toggle onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} icon={CheckSquare} />
                </div>

                {/* Insert */}
                <div className="flex items-center gap-0.5">
                    <Toggle onClick={triggerImageUpload} isActive={false} icon={ImageIcon} className="hover:bg-orange-500/20 hover:text-orange-400" title="Insérer une image" />
                    <Toggle onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} isActive={false} icon={TableIcon} />
                    <Toggle onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} icon={Code2} />
                    <button
                        onClick={async () => {
                            const html2pdf = (await import('html2pdf.js')).default;
                            const element = document.querySelector('.ProseMirror'); // Target editor content

                            // Create a temporary container to add title if needed, or just print content
                            // Let's print exactly what is in editor
                            if (element) {
                                const opt = {
                                    margin: 10,
                                    filename: 'mindos-note.pdf',
                                    image: { type: 'jpeg' as const, quality: 0.98 },
                                    html2canvas: { scale: 2, useCORS: true },
                                    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
                                };
                                html2pdf().set(opt).from(element as HTMLElement).save();
                            }
                        }}
                        className="p-2 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent/10 active:scale-95"
                        title="Exporter en PDF"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                    </button>
                </div>

            </div>

        </div>
    );
}

interface ToggleProps {
    onClick: () => void;
    isActive?: boolean;
    icon: React.ElementType;
    className?: string;
    disabled?: boolean;
    title?: string;
}

function Toggle({ onClick, isActive, icon: Icon, className, disabled, title }: ToggleProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                "p-2 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none",
                isActive && "bg-primary/20 text-primary shadow-inner",
                className
            )}
        >
            <Icon className="h-4 w-4 stroke-[2.5px]" />
        </button>
    );
}
