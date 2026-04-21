import React, { useState, useEffect, useRef } from 'react';
import { X, Search, UploadCloud, Image as ImageIcon, Loader2, Check, ArrowRight, RefreshCw } from 'lucide-react';
import { api } from '../../api';

interface MediaSelectorModalProps {
    onSelect: (url: string) => void;
    onClose: () => void;
    onlyImages?: boolean;
}

type TabKey = 'gallery' | 'upload';

export function MediaSelectorModal({ onSelect, onClose, onlyImages = true }: MediaSelectorModalProps) {
    const [activeTab, setActiveTab] = useState<TabKey>('gallery');
    const [mediaList, setMediaList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadMedia();

        // Blocca lo scroll del body quando la modale è aperta
        document.body.style.overflow = 'hidden';
        
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    const loadMedia = async () => {
        setLoading(true);
        try {
            const data = await api.getMedia();
            // Filtra solo immagini se richiesto
            const filtered = onlyImages 
                ? data.filter((m: any) => m.mime_type.startsWith('image/'))
                : data;
            setMediaList(filtered);
        } catch (err) {
            setError('Impossibile caricare i media.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);
        setError('');

        try {
            const result = await api.uploadMediaWithProgress(file, (percent) => {
                setUploadProgress(percent);
            });
            
            if (result.url) {
                // Se caricato con successo, lo selezioniamo automaticamente
                onSelect(result.url);
            } else {
                setError('Errore nella risposta del server.');
            }
        } catch (err: any) {
            setError(err.message || 'Errore durante l\'upload.');
        } finally {
            setUploading(false);
        }
    };

    const filteredItems = mediaList.filter(item => 
        item.filename.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-dis-green/20 rounded-lg text-dis-green">
                            <ImageIcon size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white tracking-tight leading-none text-lg">Selettore Media</h3>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Scegli o carica un nuovo file</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-zinc-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-800 bg-zinc-950/30 p-1">
                    <button
                        onClick={() => setActiveTab('gallery')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
                            activeTab === 'gallery' 
                            ? 'bg-zinc-800 text-dis-green shadow-inner' 
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                        }`}
                    >
                        <ImageIcon size={16} />
                        Scegli dai Media
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
                            activeTab === 'upload' 
                            ? 'bg-zinc-800 text-dis-green shadow-inner' 
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                        }`}
                    >
                        <UploadCloud size={16} />
                        Carica Nuovo
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-zinc-900/30">
                    {activeTab === 'gallery' ? (
                        <div className="space-y-6 flex flex-col h-full">
                            {/* Search & Actions */}
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cerca per nome file..."
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-dis-green/50 focus:ring-1 focus:ring-dis-green/20 transition-all font-medium text-sm"
                                    />
                                </div>
                                <button 
                                    onClick={loadMedia}
                                    className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-500 hover:text-dis-green hover:border-dis-green/30 transition-all"
                                    title="Aggiorna lista"
                                >
                                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                                </button>
                            </div>

                            {/* Grid */}
                            <div className="flex-1 min-h-[300px]">
                                {loading && mediaList.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-500 py-20">
                                        <Loader2 size={40} className="animate-spin text-dis-green" />
                                        <p className="text-sm font-medium animate-pulse">Sincronizzazione archivio...</p>
                                    </div>
                                ) : filteredItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-500 py-20 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20">
                                        <div className="p-4 bg-zinc-800/50 rounded-full">
                                            <ImageIcon size={32} strokeWidth={1} />
                                        </div>
                                        <p className="text-sm">Nessuna immagine trovata nell'archivio</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {filteredItems.map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => onSelect(item.file_path)}
                                                className="group relative aspect-square bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden hover:border-dis-green/50 transition-all shadow-lg hover:shadow-dis-green/5"
                                            >
                                                <img 
                                                    src={item.file_path} 
                                                    alt={item.filename}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 px-3">
                                                    <p className="text-[10px] text-white font-bold truncate line-clamp-1">{item.filename}</p>
                                                    <div className="flex items-center gap-1 text-dis-green mt-1">
                                                        <span className="text-[9px] font-black uppercase tracking-tighter">Seleziona</span>
                                                        <ArrowRight size={10} />
                                                    </div>
                                                </div>
                                                <div className="absolute top-2 right-2 bg-zinc-900/80 backdrop-blur-sm p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">
                                                    <Check size={12} className="text-dis-green" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-6">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-full max-w-lg aspect-video border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group ${
                                    uploading ? 'border-dis-green/50 bg-dis-green/5' : 'border-zinc-800 hover:border-dis-green/30 hover:bg-zinc-800/30'
                                }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept={onlyImages ? "image/*" : "*"}
                                />
                                
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-4 w-full px-12">
                                        <div className="relative w-16 h-16 flex items-center justify-center">
                                            <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
                                            <div 
                                                className="absolute inset-0 border-4 border-dis-green rounded-full border-t-transparent animate-spin"
                                                style={{ borderRightColor: uploadProgress > 50 ? 'currentColor' : 'transparent', borderBottomColor: uploadProgress > 75 ? 'currentColor' : 'transparent' }}
                                            />
                                            <UploadCloud size={24} className="text-dis-green animate-pulse" />
                                        </div>
                                        <div className="w-full space-y-2">
                                            <div className="flex justify-between text-xs font-black text-zinc-500 uppercase tracking-widest">
                                                <span>Caricamento In Corso</span>
                                                <span className="text-dis-green">{uploadProgress}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-dis-green rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-5 bg-zinc-800 rounded-3xl group-hover:bg-dis-green/10 group-hover:scale-110 transition-all duration-500 border border-zinc-700 group-hover:border-dis-green/30">
                                            <UploadCloud size={40} className="text-zinc-500 group-hover:text-dis-green transition-colors" />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-white font-bold text-lg">Trascina o clicca per caricare</p>
                                            <p className="text-zinc-500 text-xs uppercase tracking-tighter font-medium">Dimensioni massime consigliate: 2MB</p>
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            {error && (
                                <div className="w-full max-w-lg p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-medium flex items-center gap-3 animate-in shake duration-300">
                                    <X size={16} />
                                    {error}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 flex items-center justify-between">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-tighter font-bold">
                        {mediaList.length} file multimediali totali trovati nel server
                    </p>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2 text-xs font-black text-zinc-400 hover:text-white uppercase tracking-widest transition-colors"
                        >
                            Annulla
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
