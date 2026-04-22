import { useState, useEffect, useCallback, ReactElement } from 'react';
import { Users, Send, Trash2, Download, CheckCircle, Clock, XCircle, Loader2, AlertCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../api';

type Tab = 'subscribers' | 'send';

interface Subscriber {
    id: number;
    email: string;
    name: string | null;
    status: 'pending' | 'confirmed' | 'unsubscribed';
    confirmed_at: string | null;
    created_at: string;
}

interface Stats {
    total: number;
    confirmed: number;
    pending: number;
    unsub: number;
}

interface HistoryItem {
    id: number;
    subject: string;
    sent_at: string;
    recipient_count: number;
}

interface Article {
    id: number;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    cover_image: string;
    published_at: string;
}

const STATUS_BADGE: Record<string, ReactElement> = {
    confirmed:    <span className="inline-flex items-center gap-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-2 py-0.5"><CheckCircle size={10}/>Confermato</span>,
    pending:      <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full px-2 py-0.5"><Clock size={10}/>In attesa</span>,
    unsubscribed: <span className="inline-flex items-center gap-1 text-xs bg-zinc-700/50 text-zinc-500 border border-zinc-700 rounded-full px-2 py-0.5"><XCircle size={10}/>Disiscritto</span>,
};

function buildArticleHtml(article: Article, siteBase: string): string {
    const url = `${siteBase}/${article.category}/${article.slug}`;
    const img = article.cover_image
        ? (article.cover_image.startsWith('http') ? article.cover_image : `${siteBase}/${article.cover_image.replace(/^\//, '')}`)
        : '';
    return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border:1px solid #222;border-radius:10px;overflow:hidden;background:#0f0f0f;">
  ${img ? `<tr><td><img src="${img}" alt="${article.title}" style="width:100%;max-height:200px;object-fit:cover;display:block;border-radius:10px 10px 0 0;"></td></tr>` : ''}
  <tr><td style="padding:20px;">
    <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">${article.category.replace(/-/g, ' ')}</p>
    <h3 style="margin:0 0 10px;color:#fff;font-size:18px;font-weight:700;line-height:1.3;">${article.title}</h3>
    ${article.excerpt ? `<p style="margin:0 0 16px;color:#9ca3af;font-size:14px;line-height:1.6;">${article.excerpt}</p>` : ''}
    <a href="${url}" style="display:inline-block;background:#22c55e;color:#000;font-weight:700;font-size:13px;padding:10px 22px;border-radius:7px;text-decoration:none;">Leggi l'articolo →</a>
  </td></tr>
</table>`;
}

export default function NewsletterAdmin() {
    const [tab, setTab]                 = useState<Tab>('subscribers');
    const [stats, setStats]             = useState<Stats | null>(null);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [history, setHistory]         = useState<HistoryItem[]>([]);
    const [loading, setLoading]         = useState(true);

    // Compositore
    const [subject, setSubject]         = useState('');
    const [body, setBody]               = useState('');
    const [sending, setSending]         = useState(false);
    const [sendResult, setSendResult]   = useState<{ ok: boolean; message: string } | null>(null);

    // Selezione articoli
    const [articles, setArticles]         = useState<Article[]>([]);
    const [selectedIds, setSelectedIds]   = useState<Set<number>>(new Set());
    const [articlesOpen, setArticlesOpen] = useState(false);
    const [articlesLoading, setArticlesLoading] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [subData, histData] = await Promise.all([
                api.getSubscribers(),
                api.getNewsletterHistory(),
            ]);
            setStats(subData.stats);
            setSubscribers(subData.subscribers ?? []);
            setHistory(histData ?? []);
        } catch { /* silenzioso */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Carica articoli quando si apre la sezione
    const handleToggleArticles = async () => {
        if (!articlesOpen && articles.length === 0) {
            setArticlesLoading(true);
            try {
                const res = await api.getArticles({ admin: false });
                setArticles(Array.isArray(res) ? res : res.data || []);
            } catch { /* silenzioso */ }
            finally { setArticlesLoading(false); }
        }
        setArticlesOpen(v => !v);
    };

    const toggleArticle = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Eliminare questo iscritto?')) return;
        await api.deleteSubscriber(id);
        setSubscribers(prev => prev.filter(s => s.id !== id));
        setStats(prev => prev ? { ...prev, total: prev.total - 1 } : prev);
    };

    const exportCsv = () => {
        const rows = [['ID', 'Email', 'Nome', 'Stato', 'Confermato il', 'Iscritto il']];
        subscribers.forEach(s => rows.push([
            String(s.id), s.email, s.name ?? '', s.status,
            s.confirmed_at ?? '', s.created_at
        ]));
        const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = `subscribers_${new Date().toISOString().slice(0,10)}.csv`;
        a.click(); URL.revokeObjectURL(url);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !body.trim()) return;
        if (!confirm(`Inviare la newsletter a ${stats?.confirmed ?? 0} iscritti confermati?`)) return;
        setSending(true);
        setSendResult(null);

        // Costruisce il corpo finale: intro + blocchi articoli selezionati
        const siteBase = window.location.origin;
        const selectedArticles = articles.filter(a => selectedIds.has(a.id));
        const articlesHtml = selectedArticles.length > 0
            ? `<hr style="border:none;border-top:1px solid #1e1e1e;margin:32px 0;">
               <p style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Ultimi contenuti</p>
               ${selectedArticles.map(a => buildArticleHtml(a, siteBase)).join('')}`
            : '';

        const isHtml = /<[a-zA-Z][\s\S]*>/.test(body);
        const introHtml = isHtml ? body : body.split('\n').map(l => l ? `<p style="margin:0 0 14px;color:#d1d5db;font-size:16px;line-height:1.8;">${l}</p>` : '').join('');
        const fullBody = introHtml + articlesHtml;

        try {
            const res = await api.sendNewsletter({ subject, body: fullBody });
            setSendResult({ ok: true, message: `Newsletter inviata a ${res.sent} destinatari.` });
            setSubject(''); setBody(''); setSelectedIds(new Set());
            loadData();
        } catch (err: any) {
            setSendResult({ ok: false, message: err.message ?? "Errore durante l'invio." });
        } finally {
            setSending(false);
        }
    };

    const formatDate = (s: string) => new Date(s).toLocaleDateString('it-IT', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Newsletter</h1>
                <p className="text-zinc-400 text-sm mt-1">Gestisci gli iscritti e invia comunicazioni</p>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Totali',      value: stats.total,     color: 'text-white' },
                        { label: 'Confermati',  value: stats.confirmed, color: 'text-green-400' },
                        { label: 'In attesa',   value: stats.pending,   color: 'text-yellow-400' },
                        { label: 'Disiscritti', value: stats.unsub,     color: 'text-zinc-500' },
                    ].map(s => (
                        <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-zinc-800">
                {([['subscribers', 'Iscritti', <Users size={15}/>], ['send', 'Invia Newsletter', <Send size={15}/>]] as const).map(([id, label, icon]) => (
                    <button key={id} onClick={() => setTab(id)}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                            tab === id ? 'border-dis-green text-dis-green' : 'border-transparent text-zinc-400 hover:text-white'
                        }`}
                    >{icon}{label}</button>
                ))}
            </div>

            {/* ── Tab: Iscritti ── */}
            {tab === 'subscribers' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button onClick={exportCsv}
                            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-2 rounded-lg transition-colors">
                            <Download size={14}/> Esporta CSV
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-zinc-500">
                            <Loader2 size={24} className="animate-spin mr-2"/>Caricamento…
                        </div>
                    ) : subscribers.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500">
                            <Users size={40} className="mx-auto mb-3 opacity-30"/>
                            <p>Nessun iscritto ancora.</p>
                        </div>
                    ) : (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-800">
                                        <th className="text-left text-zinc-500 font-medium px-4 py-3">Email</th>
                                        <th className="text-left text-zinc-500 font-medium px-4 py-3">Nome</th>
                                        <th className="text-left text-zinc-500 font-medium px-4 py-3">Stato</th>
                                        <th className="text-left text-zinc-500 font-medium px-4 py-3">Iscritto il</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscribers.map(s => (
                                        <tr key={s.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-4 py-3 text-white font-mono text-xs">{s.email}</td>
                                            <td className="px-4 py-3 text-zinc-400">{s.name ?? '—'}</td>
                                            <td className="px-4 py-3">{STATUS_BADGE[s.status]}</td>
                                            <td className="px-4 py-3 text-zinc-500 text-xs">{formatDate(s.created_at)}</td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => handleDelete(s.id)}
                                                    className="text-zinc-600 hover:text-red-400 transition-colors" title="Elimina">
                                                    <Trash2 size={14}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Tab: Invia Newsletter ── */}
            {tab === 'send' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Compositore */}
                    <div className="space-y-4">
                        <h2 className="text-white font-semibold">Componi</h2>

                        {sendResult && (
                            <div className={`flex items-start gap-3 text-sm rounded-xl px-4 py-3 border ${
                                sendResult.ok
                                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                                <AlertCircle size={16} className="shrink-0 mt-0.5"/>
                                {sendResult.message}
                            </div>
                        )}

                        <form onSubmit={handleSend} className="space-y-4">
                            <div>
                                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1.5">Oggetto</label>
                                <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                                    placeholder="Oggetto della newsletter…" required
                                    className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-dis-green transition-colors"/>
                            </div>

                            <div>
                                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1.5">
                                    Messaggio introduttivo
                                </label>
                                <textarea value={body} onChange={e => setBody(e.target.value)}
                                    placeholder="Scrivi il tuo messaggio introduttivo…&#10;&#10;Gli articoli selezionati verranno aggiunti automaticamente sotto."
                                    required rows={10}
                                    className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-dis-green transition-colors resize-y"/>
                            </div>

                            {/* Selezione articoli */}
                            <div className="border border-zinc-800 rounded-xl overflow-hidden">
                                <button type="button" onClick={handleToggleArticles}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900 hover:bg-zinc-800/80 transition-colors text-sm">
                                    <span className="flex items-center gap-2 text-zinc-300 font-medium">
                                        <FileText size={15}/>
                                        Aggiungi articoli
                                        {selectedIds.size > 0 && (
                                            <span className="bg-dis-green text-black text-xs font-bold rounded-full px-2 py-0.5">
                                                {selectedIds.size}
                                            </span>
                                        )}
                                    </span>
                                    {articlesOpen ? <ChevronUp size={16} className="text-zinc-500"/> : <ChevronDown size={16} className="text-zinc-500"/>}
                                </button>

                                {articlesOpen && (
                                    <div className="border-t border-zinc-800 max-h-72 overflow-y-auto">
                                        {articlesLoading ? (
                                            <div className="flex items-center justify-center py-6 text-zinc-500">
                                                <Loader2 size={18} className="animate-spin mr-2"/>Caricamento articoli…
                                            </div>
                                        ) : articles.length === 0 ? (
                                            <p className="text-center text-zinc-500 text-sm py-6">Nessun articolo pubblicato.</p>
                                        ) : (
                                            articles.map(a => (
                                                <label key={a.id}
                                                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-zinc-800/50 last:border-0 ${
                                                        selectedIds.has(a.id) ? 'bg-dis-green/5' : 'hover:bg-zinc-800/30'
                                                    }`}>
                                                    <input type="checkbox"
                                                        checked={selectedIds.has(a.id)}
                                                        onChange={() => toggleArticle(a.id)}
                                                        className="mt-1 shrink-0 accent-dis-green"/>
                                                    <div className="min-w-0">
                                                        <p className="text-white text-sm font-medium leading-tight truncate">{a.title}</p>
                                                        <p className="text-zinc-500 text-xs mt-0.5">
                                                            {a.category.replace(/-/g,' ')}
                                                            {a.published_at ? ` · ${new Date(a.published_at).toLocaleDateString('it-IT')}` : ''}
                                                        </p>
                                                    </div>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {selectedIds.size > 0 && (
                                <p className="text-zinc-500 text-xs">
                                    {selectedIds.size} articolo{selectedIds.size > 1 ? 'i' : ''} selezionato{selectedIds.size > 1 ? 'i' : ''} — verranno inseriti come card dopo il messaggio.
                                </p>
                            )}

                            <button type="submit" disabled={sending || !subject || !body}
                                className="flex items-center gap-2 bg-dis-green text-black font-bold px-6 py-3 rounded-xl hover:bg-green-400 transition-colors disabled:opacity-50">
                                {sending ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
                                {sending ? 'Invio in corso…' : `Invia a ${stats?.confirmed ?? 0} iscritti`}
                            </button>
                        </form>
                    </div>

                    {/* Storico invii */}
                    <div className="space-y-4">
                        <h2 className="text-white font-semibold">Storico invii</h2>
                        {history.length === 0 ? (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-zinc-500 text-sm">
                                Nessuna newsletter ancora inviata.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {history.map(h => (
                                    <div key={h.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{h.subject}</p>
                                            <p className="text-zinc-500 text-xs mt-0.5">{formatDate(h.sent_at)}</p>
                                        </div>
                                        <span className="shrink-0 text-xs text-zinc-400 bg-zinc-800 rounded-full px-2.5 py-1">
                                            {h.recipient_count} dest.
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
