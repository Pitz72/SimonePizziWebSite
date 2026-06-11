import { useState, useEffect, useCallback } from 'react';
import { Mail, MailOpen, Trash2, Reply, Loader2, Inbox, AlertCircle, ChevronUp } from 'lucide-react';
import { api } from '../../api';

interface MessageRow {
    id: number;
    name: string;
    email: string;
    subject: string;
    preview: string;
    read_at: string | null;
    created_at: string;
}

interface MessageFull extends Omit<MessageRow, 'preview'> {
    message: string;
}

export default function MessagesList() {
    const [messages, setMessages] = useState<MessageRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dettaglio espanso
    const [openId, setOpenId] = useState<number | null>(null);
    const [detail, setDetail] = useState<MessageFull | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const loadMessages = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const rows = await api.getMessages();
            setMessages(Array.isArray(rows) ? rows : []);
        } catch (err: any) {
            setError(err.message || 'Errore durante il caricamento dei messaggi.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadMessages(); }, [loadMessages]);

    const unreadCount = messages.filter(m => !m.read_at).length;

    const handleOpen = async (msg: MessageRow) => {
        // Click sul messaggio già aperto → chiude
        if (openId === msg.id) {
            setOpenId(null);
            setDetail(null);
            return;
        }
        setOpenId(msg.id);
        setDetail(null);
        setDetailLoading(true);
        try {
            const full: MessageFull = await api.getMessage(msg.id);
            setDetail(full);
            // Se non letto, marca come letto e aggiorna lo stato locale
            if (!msg.read_at) {
                try {
                    await api.markMessageRead(msg.id);
                    const now = new Date().toISOString();
                    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read_at: now } : m));
                } catch { /* silenzioso: il dettaglio resta visibile */ }
            }
        } catch (err: any) {
            setError(err.message || 'Errore durante il caricamento del messaggio.');
            setOpenId(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Eliminare definitivamente questo messaggio?')) return;
        try {
            await api.deleteMessage(id);
            setMessages(prev => prev.filter(m => m.id !== id));
            if (openId === id) {
                setOpenId(null);
                setDetail(null);
            }
        } catch (err: any) {
            alert(err.message || "Errore durante l'eliminazione.");
        }
    };

    const formatDate = (s: string) => new Date(s.replace(' ', 'T')).toLocaleDateString('it-IT', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const mailtoHref = (m: { email: string; subject: string }) =>
        `mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`;

    return (
        <div className="space-y-6">
            {/* Testata */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Messaggi</h1>
                    <p className="text-zinc-400 text-sm mt-1">I messaggi ricevuti dal form Contatti</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-3 py-1">
                        <Mail size={12} />
                        {unreadCount} non lett{unreadCount === 1 ? 'o' : 'i'}
                    </span>
                    <span className="text-xs text-zinc-500 bg-zinc-800 rounded-full px-3 py-1">
                        {messages.length} totali
                    </span>
                </div>
            </div>

            {/* Errore */}
            {error && (
                <div className="flex items-start gap-3 text-sm rounded-xl px-4 py-3 border bg-red-500/10 border-red-500/20 text-red-400">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center py-16 text-zinc-500">
                    <Loader2 size={20} className="animate-spin mr-2" />Caricamento messaggi…
                </div>
            ) : messages.length === 0 ? (
                /* Empty state */
                <div className="text-center py-16 text-zinc-500">
                    <Inbox size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Nessun messaggio ricevuto.</p>
                </div>
            ) : (
                /* Lista messaggi */
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800/50">
                    {messages.map(m => {
                        const isUnread = !m.read_at;
                        const isOpen = openId === m.id;
                        return (
                            <div key={m.id} className={isUnread ? 'bg-dis-green/5' : ''}>
                                {/* Riga messaggio */}
                                <button
                                    onClick={() => handleOpen(m)}
                                    className="w-full text-left px-4 py-3 hover:bg-zinc-800/30 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className={`mt-1 shrink-0 ${isUnread ? 'text-dis-green' : 'text-zinc-600'}`}>
                                            {isUnread ? <Mail size={16} /> : <MailOpen size={16} />}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                                <span className={`text-sm truncate ${isUnread ? 'text-white font-bold' : 'text-zinc-300 font-medium'}`}>
                                                    {m.name}
                                                </span>
                                                <span className="text-zinc-500 text-xs font-mono truncate">{m.email}</span>
                                                {isUnread && (
                                                    <span className="text-[10px] uppercase tracking-wider bg-dis-green/10 text-dis-green border border-dis-green/20 rounded-full px-2 py-0.5">
                                                        Non letto
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm mt-0.5 truncate ${isUnread ? 'text-white' : 'text-zinc-400'}`}>
                                                {m.subject}
                                            </p>
                                            {!isOpen && (
                                                <p className="text-zinc-500 text-xs mt-0.5 truncate">{m.preview}</p>
                                            )}
                                        </div>
                                        <div className="shrink-0 flex flex-col items-end gap-1">
                                            <span className="text-zinc-500 text-xs whitespace-nowrap">{formatDate(m.created_at)}</span>
                                            {isOpen && <ChevronUp size={14} className="text-zinc-600" />}
                                        </div>
                                    </div>
                                </button>

                                {/* Dettaglio espanso */}
                                {isOpen && (
                                    <div className="px-4 pb-4 pl-11">
                                        {detailLoading ? (
                                            <div className="flex items-center py-4 text-zinc-500 text-sm">
                                                <Loader2 size={16} className="animate-spin mr-2" />Caricamento…
                                            </div>
                                        ) : detail ? (
                                            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
                                                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                    {detail.message}
                                                </p>
                                                <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                                                    <a
                                                        href={mailtoHref(detail)}
                                                        className="inline-flex items-center gap-2 bg-dis-green text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-green-400 transition-colors"
                                                    >
                                                        <Reply size={14} /> Rispondi
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(m.id)}
                                                        className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-red-400 border border-zinc-700 hover:border-red-500/40 px-4 py-2 rounded-lg transition-colors"
                                                        title="Elimina messaggio"
                                                    >
                                                        <Trash2 size={14} /> Elimina
                                                    </button>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
