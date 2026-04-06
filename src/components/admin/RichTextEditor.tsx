import { useState, useRef, useEffect, useMemo } from 'react';
import { Bold, Italic, Quote, Link as LinkIcon, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Type, Eraser, Image as ImageIcon, Loader2 } from 'lucide-react';
import showdown from 'showdown';
import { api } from '../../api';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

const COLORS = [
    '#ffffff', '#000000', '#22c55e', '#ef4444', '#3b82f6', '#eab308',
    '#a855f7', '#f97316', '#64748b', '#71717a', '#78350f', '#0f172a'
];

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Sync external value changes to editor content only if not focused (to avoid cursor jumps)
    useEffect(() => {
        if (editorRef.current && !isFocused && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value, isFocused]);

    const mdConverter = useMemo(() => new showdown.Converter({
        tables: true,
        strikethrough: true,
        tasklists: true,
        simpleLineBreaks: true,
        requireSpaceBeforeHeadingText: false
    }), []);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const handleNativePaste = (e: ClipboardEvent) => {
            if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
                // Se sono file immagine, blocca il paste diretto (base64) e suggerisci l'upload
                const hasImage = Array.from(e.clipboardData.files).some(f => f.type.startsWith('image/'));
                if (hasImage) {
                    e.preventDefault();
                    alert("Per favore, usa il pulsante 'Immagine' nella barra degli strumenti per caricare le foto. Incollarle direttamente appesantisce troppo l'articolo e impedisce il salvataggio.");
                    return;
                }
                return;
            }

            const plainText = e.clipboardData?.getData('text/plain') || '';
            const htmlText = e.clipboardData?.getData('text/html') || '';

            const hasMarkdownHeaders = /^#{1,6}\s+.+/m.test(plainText);
            const hasMarkdownBold = /\*\*.*?\*\*/.test(plainText);
            const hasMarkdownLinks = /\[.+?\]\(.+?\)/.test(plainText);
            const hasMarkdownLists = /^\s*[-*+]\s+.+/m.test(plainText);
            const isExplicitMarkdown = hasMarkdownHeaders || hasMarkdownBold || hasMarkdownLinks;

            if (isExplicitMarkdown || (!htmlText && hasMarkdownLists)) {
                e.preventDefault();
                e.stopPropagation();

                const mdHtml = mdConverter.makeHtml(plainText);
                try { document.execCommand('insertHTML', false, mdHtml); } catch { /* fallback silenzioso */ } // eslint-disable-line @typescript-eslint/no-deprecated
                return;
            }

            if (htmlText) {
                e.preventDefault();
                e.stopPropagation();

                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlText, 'text/html');

                const elementsWithStyle = doc.querySelectorAll('[style]');
                elementsWithStyle.forEach(el => {
                    if (el instanceof HTMLElement) {
                        el.style.backgroundColor = '';
                        el.style.background = '';
                        el.style.color = '';
                    }
                });

                // Rimuovi eventuali classi CSS nemiche esportate da word o wikipedia
                const allEls = doc.querySelectorAll('*');
                allEls.forEach(el => { if (el instanceof HTMLElement) el.removeAttribute('class'); });

                try { document.execCommand('insertHTML', false, doc.body.innerHTML); } catch { /* fallback silenzioso */ } // eslint-disable-line @typescript-eslint/no-deprecated
                return;
            }
        };

        editor.addEventListener('paste', handleNativePaste, true);
        return () => {
            editor.removeEventListener('paste', handleNativePaste, true);
        };
    }, [mdConverter]);

    // [v1.5.10] document.execCommand è deprecated ma ancora supportato da tutti i browser nel 2026.
    // Migrazione completa a Selection/Range API tracciata in roadmap come task futuro.
    // try-catch aggiunto per robustezza anticipatoria.
    const exec = (command: string, value: string | undefined = undefined) => {
        try {
            document.execCommand(command, false, value); // eslint-disable-line @typescript-eslint/no-deprecated
        } catch {
            console.warn(`[RichTextEditor] execCommand '${command}' non supportato in questo browser.`);
        }
        if (editorRef.current) onChange(editorRef.current.innerHTML);
        setShowColorPicker(false);
    };

    const handleInput = () => {
        if (editorRef.current) onChange(editorRef.current.innerHTML);
    };

    const promptLink = () => {
        // Salvataggio esplicito della selezione prima dell'apertura del prompt (che rimuove il focus)
        const selection = window.getSelection();
        const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;

        const url = prompt('Inserisci URL:');

        if (url) {
            // Ripristina la selezione salvata se esiste
            if (range && selection) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
            exec('createLink', url);
        }
    };

    const removeLink = () => {
        exec('unlink');
    };

    const formatBlock = (tag: string) => {
        exec('formatBlock', tag);
        // Reset the select back to paragraph after applying heading
        const sel = document.getElementById('heading-selector') as HTMLSelectElement;
        if (sel) sel.value = "p";
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const result = await api.uploadMedia(file);
            if (result.url) {
                // Forza il focus sull'editor prima di inserire
                if (editorRef.current) editorRef.current.focus();
                
                const imgHtml = `<img src="${result.url}" alt="${result.name}" class="max-w-full h-auto rounded-xl my-4 shadow-lg border border-zinc-800" />`;
                try {
                    document.execCommand('insertHTML', false, imgHtml); // eslint-disable-line @typescript-eslint/no-deprecated
                } catch {
                    // Fallback se insertHTML fallisce (raro)
                    if (editorRef.current) editorRef.current.innerHTML += imgHtml;
                }
                
                if (editorRef.current) onChange(editorRef.current.innerHTML);
            }
        } catch (error) {
            console.error("Errore upload immagine:", error);
            alert("Errore durante il caricamento dell'immagine. Riprova.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950 flex flex-col min-h-[500px] ${className || ''}`}>
            <div className="flex flex-wrap items-center gap-1 p-2 bg-zinc-900 border-b border-zinc-800 shrink-0 relative z-20 rounded-t-lg">

                {/* HEADINGS */}
                <select
                    id="heading-selector"
                    className="bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300 p-1.5 h-8 mr-2 focus:ring-1 focus:ring-dis-green outline-none hover:border-zinc-700 transition-colors"
                    onChange={(e) => formatBlock(e.target.value)}
                    defaultValue="p"
                >
                    <option value="p">Testo Normale</option>
                    <option value="h2">Titolo Principale (H2)</option>
                    <option value="h3">Titolo Secondario (H3)</option>
                    <option value="h4">Titoletto (H4)</option>
                    <option value="blockquote">Citazione / Blockquote</option>
                    <option value="pre">Blocco di Codice</option>
                </select>

                <div className="w-px h-6 bg-zinc-800 mx-1" />

                <ToolbarBtn onClick={() => exec('bold')} icon={<Bold size={16} />} title="Grassetto" />
                <ToolbarBtn onClick={() => exec('italic')} icon={<Italic size={16} />} title="Corsivo" />
                <ToolbarBtn onClick={() => exec('strikeThrough')} icon={<span className="line-through font-bold">S</span>} title="Barrato" />

                {/* Color Picker Custom Implementation */}
                <div className="relative">
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors flex flex-col items-center justify-center gap-[2px]"
                        title="Colore Testo"
                    >
                        <Type size={14} />
                        <div className="w-4 h-1 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full"></div>
                    </button>

                    {showColorPicker && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowColorPicker(false)}></div>
                            <div className="absolute top-full left-0 z-50 mt-2 w-48 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl p-2 grid grid-cols-4 gap-1">
                                {COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        className="w-8 h-8 rounded border border-zinc-700 hover:scale-110 transition-transform shadow-md"
                                        style={{ backgroundColor: color }}
                                        onClick={() => exec('foreColor', color)}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="w-px h-6 bg-zinc-800 mx-1" />
                <ToolbarBtn onClick={() => exec('justifyLeft')} icon={<AlignLeft size={16} />} title="Allinea a Sinistra" />
                <ToolbarBtn onClick={() => exec('justifyCenter')} icon={<AlignCenter size={16} />} title="Allinea al Centro" />
                <ToolbarBtn onClick={() => exec('justifyRight')} icon={<AlignRight size={16} />} title="Allinea a Destra" />
                <div className="w-px h-6 bg-zinc-800 mx-1" />
                <ToolbarBtn onClick={() => exec('insertUnorderedList')} icon={<List size={16} />} title="Elenco Puntato" />
                <ToolbarBtn onClick={() => exec('insertOrderedList')} icon={<ListOrdered size={16} />} title="Elenco Numerato" />
                <div className="w-px h-6 bg-zinc-800 mx-1" />
                <ToolbarBtn onClick={() => formatBlock('blockquote')} icon={<Quote size={16} />} title="Citazione (Blockquote)" />
                <div className="w-px h-6 bg-zinc-800 mx-1" />
                <ToolbarBtn onClick={promptLink} icon={<LinkIcon size={16} />} title="Inserisci Link" />
                <ToolbarBtn onClick={removeLink} icon={<LinkIcon size={16} className="text-red-400" />} title="Rimuovi Link" />
                <div className="w-px h-6 bg-zinc-800 mx-1" />
                <ToolbarBtn 
                    onClick={() => fileInputRef.current?.click()} 
                    icon={isUploading ? <Loader2 size={16} className="animate-spin text-dis-green" /> : <ImageIcon size={16} />} 
                    title="Carica Immagine" 
                    disabled={isUploading}
                />
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                />
                <div className="w-px h-6 bg-zinc-800 mx-1" />
                <ToolbarBtn onClick={() => exec('removeFormat')} icon={<Eraser size={16} className="text-orange-400" />} title="Rimuovi Colore e Formattazione" />
            </div>

            <div
                ref={editorRef}
                className="p-6 text-zinc-300 prose prose-invert max-w-none flex-1 overflow-y-auto outline-none 
                [&_a]:text-dis-green [&_a]:underline 
                [&_blockquote]:border-l-4 [&_blockquote]:border-dis-green/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:bg-dis-green/5 [&_blockquote]:py-1 [&_blockquote]:pr-4 [&_blockquote]:rounded-r-lg
                [&_ul]:list-disc [&_ul]:pl-5 
                [&_ol]:list-decimal [&_ol]:pl-5 
                [&_li]:mb-1
                focus:bg-zinc-900/30 transition-colors"
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
        </div>
    );
}

const ToolbarBtn = ({ onClick, icon, title }: any) => (
    <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
        title={title}
    >
        {icon}
    </button>
);
