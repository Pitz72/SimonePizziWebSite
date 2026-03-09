import { useState, useEffect, useRef } from 'react';
import { UploadCloud, Trash2, Copy, FileIcon, Image as ImageIcon, Link as LinkIcon, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../../api';

export default function MediaGallery() {
    const [mediaList, setMediaList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadMedia();
    }, []);

    const loadMedia = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await api.getMedia();
            setMediaList(data);
        } catch (err: any) {
            setError('Impossibile caricare i file multimediali.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError('');
        setSuccessMessage('');

        try {
            await api.uploadMedia(file);
            setSuccessMessage(`File "${file.name}" caricato con successo.`);
            loadMedia(); // Ricarica la lista per inglobare il nuovo file
        } catch (err: any) {
            setError(err.message || 'Errore durante l\'upload.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id: number, filename: string) => {
        if (!window.confirm(`Sei sicuro di voler eliminare irrevocabilmente "${filename}" dal server?`)) return;

        try {
            await api.deleteMedia(id);
            setMediaList(mediaList.filter(m => m.id !== id));
            setSuccessMessage('File eliminato correttamente.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            alert('Errore eliminazione file.');
        }
    };

    const handleCopyUrl = (url: string, id: number) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Media Center</h1>
                    <p className="text-zinc-400 mt-1">Carica immagini, PDF o archivi per generare i link di condivisione.</p>
                </div>

                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,application/zip,application/x-rar-compressed,audio/mpeg"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 bg-dis-green text-black font-bold px-4 py-2 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50"
                    >
                        {uploading ? <RefreshCw className="animate-spin" size={20} /> : <UploadCloud size={20} />}
                        <span>{uploading ? 'Caricamento...' : 'Carica File'}</span>
                    </button>
                    <p className="text-xs text-zinc-500 mt-2 text-right">Max 10MB per file</p>
                </div>
            </header>

            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm font-medium">{error}</div>}
            {successMessage && <div className="p-4 bg-dis-green/10 border border-dis-green/20 rounded-lg text-dis-green text-sm font-medium flex items-center gap-2"><CheckCircle2 size={16} /> {successMessage}</div>}

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <ImageIcon className="text-dis-green" size={20} /> Catalogo Server
                    </h2>
                    <button onClick={loadMedia} className="text-zinc-500 hover:text-white transition-colors" title="Aggiorna Lista">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {loading && mediaList.length === 0 ? (
                    <div className="p-12 text-center text-zinc-500">Consultazione database in corso...</div>
                ) : mediaList.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <FileIcon size={48} className="text-zinc-700 mb-4" />
                        <p className="text-zinc-400">Nessun file presente. Clicca su "Carica File" per iniziare.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
                        {mediaList.map((media) => {
                            const isImage = media.mime_type.startsWith('image/');
                            return (
                                <div key={media.id} className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden group hover:border-zinc-600 transition-colors flex flex-col">

                                    {/* Media Preview Box */}
                                    <div className="h-40 bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                                        {isImage ? (
                                            <img src={media.file_path} alt={media.filename} className="w-full h-full object-cover" loading="lazy" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-zinc-600">
                                                <FileIcon size={48} />
                                                <span className="text-xs font-bold mt-2 uppercase">{media.filename.split('.').pop()}</span>
                                            </div>
                                        )}

                                        {/* Hover Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                            <button
                                                onClick={() => handleCopyUrl(media.file_path, media.id)}
                                                className="p-2 bg-zinc-800 hover:bg-dis-green hover:text-black rounded-full text-white transition-colors"
                                                title="Copia Link (Url Assoluto)"
                                            >
                                                {copiedId === media.id ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                            </button>
                                            <a
                                                href={media.file_path}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 bg-zinc-800 hover:bg-white hover:text-black rounded-full text-white transition-colors"
                                                title="Apri nuova scheda"
                                            >
                                                <LinkIcon size={18} />
                                            </a>
                                        </div>
                                    </div>

                                    {/* Media Details */}
                                    <div className="p-3 text-xs flex-1 flex flex-col justify-between gap-2">
                                        <p className="font-medium text-white truncate" title={media.filename}>{media.filename}</p>
                                        <div className="flex justify-between items-center text-zinc-500">
                                            <span>{formatBytes(media.size)}</span>
                                            <button
                                                onClick={() => handleDelete(media.id, media.filename)}
                                                className="text-zinc-600 hover:text-red-400 transition-colors"
                                                title="Elimina File"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
