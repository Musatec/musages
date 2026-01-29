"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image } from '@tiptap/extension-image';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { useEffect } from 'react';
import { EditorToolbar } from './editor-toolbar';
import { cn } from "@/lib/utils";


declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        fontSize: {
            setFontSize: (size: string) => ReturnType,
            unsetFontSize: () => ReturnType,
        }
    }
}

// Custom Font Size Extension
const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return {
            types: ['textStyle'],
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize.replace('px', ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {};
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}px`,
                            };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setFontSize: (fontSize: string) => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize })
                    .run();
            },
            unsetFontSize: () => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize: null })
                    .removeEmptyTextStyle()
                    .run();
            },
        };
    },
});

interface EditorProps {
    content: string | null;
    onChange: (content: string) => void;
    editable?: boolean;
    fixedToolbar?: boolean;
}

export function NoteEditor({ content, onChange, editable = true, fixedToolbar = false }: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Placeholder.configure({
                placeholder: 'Commence à écrire...',
                emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:float-left before:text-muted-foreground/50 before:pointer-events-none',
            }),
            Typography,
            Table.configure({ resizable: true }),
            TableRow, TableHeader, TableCell,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            TaskList, TaskItem.configure({ nested: true }),
            Highlight, Underline,
            TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
            TextStyle,
            Color,
            FontSize,
        ],
        content: content || '',
        editorProps: {
            attributes: {
                class: cn(
                    "prose dark:prose-invert prose-lg max-w-[800px] mx-auto focus:outline-none min-h-[calc(100vh-100px)]",
                    "selection:bg-primary/40 selection:text-foreground leading-relaxed px-6 pb-40",
                    "prose-img:rounded-xl prose-img:shadow-2xl prose-img:border prose-img:border-border prose-img:mx-auto prose-img:my-8 prose-img:transition-all",
                    "prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl",
                    "prose-li:marker:text-primary",
                    fixedToolbar ? "pt-8" : "pt-20"
                ),
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
        editable,
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || '');
        }
    }, [content, editor]);

    if (!editor) return null;

    return (
        <div className="relative w-full h-full flex flex-col">

            {/* FIXED TOOLBAR */}
            {editable && fixedToolbar && (
                <div className="border-b border-border bg-card z-10 w-full flex justify-center py-2">
                    <EditorToolbar editor={editor} />
                </div>
            )}

            {/* IMAGE BUBBLE MENU - TEMPORARILY DISABLED 
            {editable && (
                <BubbleMenu 
                    editor={editor} 
                    tippyOptions={{ duration: 100 }} 
                    shouldShow={({ editor }) => editor.isActive('image')}
                    className="bg-[#1C1C1E] border border-white/10 shadow-2xl rounded-lg overflow-hidden flex items-center p-1 gap-1 backdrop-blur-xl"
                >
                    <button onClick={() => editor.chain().focus().updateAttributes('image', { width: '25%' }).run()} className="px-2 py-1 text-xs font-medium text-gray-300 hover:bg-white/10 rounded">Petit</button>
                    <button onClick={() => editor.chain().focus().updateAttributes('image', { width: '50%' }).run()} className="px-2 py-1 text-xs font-medium text-gray-300 hover:bg-white/10 rounded">Moyen</button>
                    <button onClick={() => editor.chain().focus().updateAttributes('image', { width: '75%' }).run()} className="px-2 py-1 text-xs font-medium text-gray-300 hover:bg-white/10 rounded">Grand</button>
                    <button onClick={() => editor.chain().focus().updateAttributes('image', { width: '100%' }).run()} className="px-2 py-1 text-xs font-medium text-gray-300 hover:bg-white/10 rounded">Plein</button>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className="p-1.5 hover:bg-white/10 rounded text-gray-300"><AlignLeft className="h-3.5 w-3.5" /></button>
                    <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className="p-1.5 hover:bg-white/10 rounded text-gray-300"><AlignCenter className="h-3.5 w-3.5" /></button>
                    <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className="p-1.5 hover:bg-white/10 rounded text-gray-300"><AlignRight className="h-3.5 w-3.5" /></button>
                </BubbleMenu>
            )}
            */}

            {/* Editor Content Area */}
            <div className="flex-1 overflow-y-auto w-full">
                <EditorContent editor={editor} className="w-full h-full outline-none" />
            </div>
        </div>
    );
}
