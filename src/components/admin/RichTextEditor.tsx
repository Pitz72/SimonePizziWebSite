import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { TextAlign } from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';


import { 
    Bold, Italic, Link as LinkIcon, List, ListOrdered, 
    AlignLeft, AlignCenter, AlignRight, Type, Eraser, 
    Image as ImageIcon, Table2, Strikethrough, Underline as UnderlineIcon
} from 'lucide-react';


import { InternalLinkSelector } from './InternalLinkSelector';
import { MediaSelectorModal } from './MediaSelectorModal';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

const COLORS = [
    '#ffffff', '#000000', '#22c55e', '#16a34a', '#15803d', // Verdi
    '#ef4444', '#dc2626', '#b91c1c', // Rossi
    '#3b82f6', '#2563eb', '#1d4ed8', // Blu
    '#eab308', '#ca8a04', '#a16207', // Gialli/Oro
    '#a855f7', '#9333ea', '#7e22ce', // Viola
    '#f97316', '#ea580c', '#c2410c', // Arancio
    '#06b6d4', '#0891b2', '#0e7490', // Cyan
    '#64748b', '#475569', '#334155', // Slate
    '#71717a', '#52525b', '#3f3f46', // Zinc
    '#78350f', '#451a03', '#0f172a'  // Brown/Dark
];

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showLinkPicker, setShowLinkPicker] = useState(false);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4],
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-xl my-4 shadow-lg border border-zinc-800',
                },
            }),
            TextStyle,
            Color,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'w-full border-collapse my-4',
                },
            }),
            TableRow,
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-zinc-700 bg-zinc-800 px-3 py-2 text-left text-zinc-200 font-semibold',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-zinc-700 px-3 py-2 text-zinc-300',
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
            
            // Update counts
            const text = editor.getText();
            setCharCount(text.length);
            const words = text.trim() ? text.trim().split(/\s+/).length : 0;
            setWordCount(words);
        },
        editorProps: {
            attributes: {
                class: 'p-6 prose prose-invert max-w-none outline-none min-h-[250px]',
            },
        },
    });

    // Sync external value changes
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor) {
        return <div className="p-8 text-zinc-500 animate-pulse bg-zinc-950 border border-zinc-800 rounded-lg">Inizializzazione Editor...</div>;
    }

    const handleInternalLinkSelect = (url: string) => {
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        setShowLinkPicker(false);
    };

    const handleMediaSelect = (url: string) => {
        editor.chain().focus().setImage({ src: url }).run();
        setShowMediaModal(false);
    };

    const insertTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    return (
        <div className={`border border-zinc-800 rounded-lg bg-zinc-950 flex flex-col min-h-[300px] ${className || ''}`}>
            {/* Toolbar */}
            <div className="sticky top-0 z-30 flex flex-wrap items-center gap-1 p-2 bg-zinc-900 border-b border-zinc-800 shrink-0 rounded-t-lg">
                
                {/* Heading Selector */}
                <select
                    className="bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300 p-1.5 h-8 mr-2 focus:ring-1 focus:ring-dis-green outline-none hover:border-zinc-700 transition-colors"
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'p') editor.chain().focus().setParagraph().run();
                        else if (val === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
                        else if (val === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
                        else if (val === 'h4') editor.chain().focus().toggleHeading({ level: 4 }).run();
                        else if (val === 'blockquote') editor.chain().focus().toggleBlockquote().run();
                        e.target.value = 'p'; // Reset selector
                    }}
                    value={
                        editor.isActive('heading', { level: 2 }) ? 'h2' :
                        editor.isActive('heading', { level: 3 }) ? 'h3' :
                        editor.isActive('heading', { level: 4 }) ? 'h4' :
                        editor.isActive('blockquote') ? 'blockquote' : 'p'
                    }
                >
                    <option value="p">Testo Normale</option>
                    <option value="h2">Titolo Principale (H2)</option>
                    <option value="h3">Titolo Secondario (H3)</option>
                    <option value="h4">Titoletto (H4)</option>
                    <option value="blockquote">Citazione / Blockquote</option>
                </select>

                <div className="w-px h-6 bg-zinc-800 mx-1" />

                <ToolbarBtn 
                    onClick={() => editor.chain().focus().toggleBold().run()} 
                    active={editor.isActive('bold')}
                    icon={<Bold size={16} />} 
                    title="Grassetto" 
                />
                <ToolbarBtn 
                    onClick={() => editor.chain().focus().toggleItalic().run()} 
                    active={editor.isActive('italic')}
                    icon={<Italic size={16} />} 
                    title="Corsivo" 
                />
                <ToolbarBtn 
                    onClick={() => editor.chain().focus().toggleUnderline().run()} 
                    active={editor.isActive('underline')}
                    icon={<UnderlineIcon size={16} />} 
                    title="Sottolineato" 
                />
                <ToolbarBtn 
                    onClick={() => editor.chain().focus().toggleStrike().run()} 
                    active={editor.isActive('strike')}
                    icon={<Strikethrough size={16} />} 
                    title="Barrato" 
                />

                {/* Color Picker (Moved here) */}
                <div className="relative mx-1">
                    <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className={`p-1.5 rounded transition-colors flex flex-col items-center justify-center gap-[2px] ${showColorPicker ? 'bg-zinc-800' : 'hover:bg-zinc-800'}`}
                        title="Colore Testo"
                    >
                        <Type size={14} className={editor.getAttributes('textStyle').color ? '' : 'text-zinc-400'} style={{ color: editor.getAttributes('textStyle').color }} />
                        <div className="w-4 h-1 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full"></div>
                    </button>

                    {showColorPicker && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowColorPicker(false)}></div>
                            <div className="absolute top-full left-0 z-50 mt-2 w-64 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl p-3 grid grid-cols-6 gap-1 animate-in zoom-in-95 duration-150">
                                {COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        className="w-8 h-8 rounded border border-zinc-700 hover:scale-110 transition-transform shadow-md"
                                        style={{ backgroundColor: color }}
                                        onClick={() => {
                                            editor.chain().focus().setColor(color).run();
                                            setShowColorPicker(false);
                                        }}
                                        title={color}
                                    />
                                ))}
                                <button
                                    type="button"
                                    className="col-span-6 text-[10px] text-zinc-500 hover:text-white py-1.5 mt-1 border-t border-zinc-800"
                                    onClick={() => {
                                        editor.chain().focus().unsetColor().run();
                                        setShowColorPicker(false);
                                    }}
                                >
                                    Rimuovi Colore
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <div className="w-px h-6 bg-zinc-800 mx-1" />


                <ToolbarBtn 
                    onClick={() => editor.chain().focus().setTextAlign('left').run()} 
                    active={editor.isActive({ textAlign: 'left' })}
                    icon={<AlignLeft size={16} />} 
                    title="Allinea a Sinistra" 
                />
                <ToolbarBtn 
                    onClick={() => editor.chain().focus().setTextAlign('center').run()} 
                    active={editor.isActive({ textAlign: 'center' })}
                    icon={<AlignCenter size={16} />} 
                    title="Allinea al Centro" 
                />
                <ToolbarBtn 
                    onClick={() => editor.chain().focus().setTextAlign('right').run()} 
                    active={editor.isActive({ textAlign: 'right' })}
                    icon={<AlignRight size={16} />} 
                    title="Allinea a Destra" 
                />

                <div className="w-px h-6 bg-zinc-800 mx-1" />

                <ToolbarBtn 
                    onClick={() => editor.chain().focus().toggleBulletList().run()} 
                    active={editor.isActive('bulletList')}
                    icon={<List size={16} />} 
                    title="Elenco Puntato" 
                />
                <ToolbarBtn 
                    onClick={() => editor.chain().focus().toggleOrderedList().run()} 
                    active={editor.isActive('orderedList')}
                    icon={<ListOrdered size={16} />} 
                    title="Elenco Numerato" 
                />

                <div className="w-px h-6 bg-zinc-800 mx-1" />

                <ToolbarBtn 
                    onClick={() => setShowMediaModal(true)} 
                    icon={<ImageIcon size={16} />} 
                    title="Inserisci Immagine" 
                />
                <ToolbarBtn 
                    onClick={insertTable} 
                    icon={<Table2 size={16} />} 
                    title="Inserisci Tabella" 
                />

                <div className="w-px h-6 bg-zinc-800 mx-1" />

                <ToolbarBtn 
                    onClick={() => setShowLinkPicker(true)} 
                    active={editor.isActive('link')}
                    icon={<LinkIcon size={16} />} 
                    title="Inserisci Link" 
                />
                {editor.isActive('link') && (
                    <ToolbarBtn 
                        onClick={() => editor.chain().focus().unsetLink().run()} 
                        icon={<LinkIcon size={16} className="text-red-400" />} 
                        title="Rimuovi Link" 
                    />
                )}

                <div className="w-px h-6 bg-zinc-800 mx-1" />

                <ToolbarBtn 
                    onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} 
                    icon={<Eraser size={16} className="text-orange-400" />} 
                    title="Cancella Formattazione" 
                />
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto">
                <EditorContent editor={editor} />
            </div>

            {/* Footer Stats */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#121214] border-t border-zinc-800 shrink-0 rounded-b-lg select-none">
                <div className="flex items-center gap-6 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5" title="Conteggio Parole">
                        <span className="w-1.5 h-1.5 rounded-full bg-dis-green/60"></span>
                        {wordCount} {wordCount === 1 ? 'parola' : 'parole'}
                    </span>
                    <span className="flex items-center gap-1.5" title="Conteggio Caratteri">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60"></span>
                        {charCount} {charCount === 1 ? 'carattere' : 'caratteri'}
                    </span>
                </div>
                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">
                    Tiptap Editor v2
                </div>
            </div>

            {showLinkPicker && (
                <InternalLinkSelector 
                    onSelect={handleInternalLinkSelect} 
                    onClose={() => setShowLinkPicker(false)} 
                />
            )}

            {showMediaModal && (
                <MediaSelectorModal
                    onSelect={handleMediaSelect}
                    onClose={() => setShowMediaModal(false)}
                    onlyImages={true}
                />
            )}
        </div>
    );
}

const ToolbarBtn = ({ onClick, icon, title, active }: any) => (
    <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className={`p-1.5 rounded transition-colors ${active ? 'bg-dis-green text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
        title={title}
    >
        {icon}
    </button>
);
