import { Activity, FileText, Image as ImageIcon, Users, Eye, MousePointerClick, TrendingUp } from 'lucide-react';
import { useLoaderData, Link } from 'react-router-dom';

interface AnalyticsData {
    total_views: number;
    total_clicks: number;
    top_articles: { id: number; title: string; slug: string; view_count: number }[];
    clicks_by_button: { button_label: string; count: number }[];
    weekly_views: { view_date: string; count: number }[];
}

export default function Dashboard() {
    const { stats: rawStats, analytics } = useLoaderData() as { stats: any, analytics: AnalyticsData };

    const stats = {
        articles: rawStats.total_articles.toString(),
        media: rawStats.total_media.toString(),
        subs: rawStats.total_subscribers.toString(),
        total_views: (rawStats.total_views ?? 0).toString(),
        total_clicks: (rawStats.total_clicks ?? 0).toString(),
        status: rawStats.system_status
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    };

    const maxWeeklyCount = analytics?.weekly_views?.reduce((max, d) => Math.max(max, d.count), 1) ?? 1;
    const analyticsError = !analytics;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                <p className="text-zinc-400 mt-2">Benvenuto nel centro di controllo del tuo Portfolio Dinamico.</p>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                    { label: 'Articoli Totali',     value: stats.articles,      icon: <FileText size={22} className="text-blue-400" /> },
                    { label: 'File Media',           value: stats.media,         icon: <ImageIcon size={22} className="text-purple-400" /> },
                    { label: 'Iscritti Newsletter',  value: stats.subs,          icon: <Users size={22} className="text-dis-green" /> },
                    { label: 'Visualizzazioni',      value: stats.total_views,   icon: <Eye size={22} className="text-cyan-400" /> },
                    { label: 'Click CTA',            value: stats.total_clicks,  icon: <MousePointerClick size={22} className="text-orange-400" /> },
                    { label: 'Stato Sistema',        value: stats.status,        icon: <Activity size={22} className="text-emerald-400" /> },
                ].map((stat, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between col-span-1">
                        <div>
                            <p className="text-zinc-500 text-xs font-medium mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                        <div className="p-3 bg-zinc-950 rounded-full">
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Analytics Section */}
            {!analyticsError && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Top Articoli per Visualizzazioni */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <TrendingUp size={18} className="text-dis-green" />
                            <h2 className="text-white font-semibold">Top Articoli per Visualizzazioni</h2>
                        </div>
                        {analytics?.top_articles && analytics.top_articles.length > 0 ? (
                            <ul className="space-y-3">
                                {analytics.top_articles.slice(0, 5).map((art, i) => (
                                    <li key={art.id} className="flex items-center gap-3">
                                        <span className="text-zinc-600 text-sm font-mono w-4 text-right">{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-zinc-300 text-sm truncate">{art.title}</p>
                                        </div>
                                        <span className="flex items-center gap-1 text-cyan-400 text-sm font-bold whitespace-nowrap">
                                            <Eye size={12} />
                                            {art.view_count}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-zinc-600 text-sm">Nessun dato di visualizzazione ancora registrato.</p>
                        )}
                    </div>

                    {/* Andamento Settimanale */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <Eye size={18} className="text-cyan-400" />
                            <h2 className="text-white font-semibold">Visualizzazioni Ultimi 7 Giorni</h2>
                        </div>
                        {analytics?.weekly_views && analytics.weekly_views.length > 0 ? (
                            <div className="flex items-end gap-2 h-28">
                                {analytics.weekly_views.map(day => (
                                    <div key={day.view_date} className="flex-1 flex flex-col items-center gap-1">
                                        <span className="text-zinc-500 text-[10px] font-mono">{day.count}</span>
                                        <div
                                            className="w-full bg-cyan-400/20 border border-cyan-400/30 rounded-sm transition-all"
                                            style={{ height: `${Math.max(4, (day.count / maxWeeklyCount) * 80)}px` }}
                                        ></div>
                                        <span className="text-zinc-600 text-[9px]">{formatDate(day.view_date)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-zinc-600 text-sm">Nessuna visualizzazione negli ultimi 7 giorni.</p>
                        )}
                    </div>

                    {/* Click CTA per Bottone */}
                    {analytics?.clicks_by_button && analytics.clicks_by_button.length > 0 && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 lg:col-span-2">
                            <div className="flex items-center gap-2 mb-5">
                                <MousePointerClick size={18} className="text-orange-400" />
                                <h2 className="text-white font-semibold">Click sui Pulsanti CTA</h2>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {analytics.clicks_by_button.map(btn => (
                                    <div key={btn.button_label} className="bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-lg flex items-center gap-2">
                                        <span className="text-zinc-300 text-sm">{btn.button_label}</span>
                                        <span className="text-orange-400 font-bold text-sm">{btn.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 lg:p-8">
                <h2 className="text-xl font-bold text-white mb-6">Azioni Rapide</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link to="/admin/articles/new" className="p-6 bg-zinc-950 border border-zinc-800 hover:border-dis-green/50 transition-colors rounded-lg group">
                        <h3 className="text-white font-medium mb-2 group-hover:text-dis-green">Scrivi Nuovo Articolo</h3>
                        <p className="text-sm text-zinc-500">Apri l'editor Markdown e componi un nuovo progetto.</p>
                    </Link>
                    <Link to="/admin/media" className="p-6 bg-zinc-950 border border-zinc-800 hover:border-dis-green/50 transition-colors rounded-lg group">
                        <h3 className="text-white font-medium mb-2 group-hover:text-dis-green">Vai alla Media Gallery</h3>
                        <p className="text-sm text-zinc-500">Gestisci le immagini, PDF e i caricamenti compressi ZIP.</p>
                    </Link>
                    <Link to="/admin/categories" className="p-6 bg-zinc-950 border border-zinc-800 hover:border-dis-green/50 transition-colors rounded-lg group">
                        <h3 className="text-white font-medium mb-2 group-hover:text-dis-green">Gestisci Categorie</h3>
                        <p className="text-sm text-zinc-500">Crea, rinomina o riordina le categorie del sito.</p>
                    </Link>
                    <Link to="/admin/projects" className="p-6 bg-zinc-950 border border-zinc-800 hover:border-dis-green/50 transition-colors rounded-lg group">
                        <h3 className="text-white font-medium mb-2 group-hover:text-dis-green">Gestisci Progetti</h3>
                        <p className="text-sm text-zinc-500">Amministra i progetti della pagina "Tutti i Progetti".</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
