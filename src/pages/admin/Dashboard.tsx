import { Activity, FileText, Image as ImageIcon, Users, Eye, MousePointerClick, TrendingUp, Heart } from 'lucide-react';
import { useLoaderData, Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import { chartColors, commonOptions } from '../../utils/chartConfig';

interface AnalyticsData {
    total_views: number;
    total_clicks: number;
    total_reactions: number;
    top_articles: { id: number; title: string; slug: string; view_count: number }[];
    top_articles_by_reactions: { id: number; title: string; slug: string; reaction_count: number }[];
    clicks_by_button: { button_label: string; count: number }[];
    reactions_by_type: { reaction: string; count: number }[];
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
        total_reactions: (analytics?.total_reactions ?? 0).toString(),
        status: rawStats.system_status
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    };

    const analyticsError = !analytics;

    // Configurazione Dati per Grafico Visualizzazioni (Line Area)
    const viewsChartData = {
        labels: analytics?.weekly_views?.map(d => formatDate(d.view_date)) || [],
        datasets: [{
            label: 'Visualizzazioni',
            data: analytics?.weekly_views?.map(d => d.count) || [],
            borderColor: chartColors.green,
            backgroundColor: chartColors.greenTransparent,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: chartColors.green,
            pointBorderColor: '#fff',
            pointHoverRadius: 6,
            pointRadius: 4
        }]
    };

    // Configurazione Dati per Grafico Click CTA (Doughnut)
    const clicksChartData = {
        labels: analytics?.clicks_by_button?.map(b => b.button_label) || [],
        datasets: [{
            data: analytics?.clicks_by_button?.map(b => b.count) || [],
            backgroundColor: [
                chartColors.green,
                chartColors.cyan,
                chartColors.purple,
                chartColors.orange,
                '#4ade80',
                '#2dd4bf'
            ],
            borderColor: chartColors.bg,
            borderWidth: 2,
            hoverOffset: 15
        }]
    };

    const doughnutOptions = {
        ...commonOptions,
        cutout: '70%',
        plugins: {
            ...commonOptions.plugins,
            legend: {
                ...commonOptions.plugins.legend,
                position: 'right' as const,
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                <p className="text-zinc-400 mt-2">Benvenuto nel centro di controllo del tuo Portfolio Dinamico.</p>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                {[
                    { label: 'Articoli Totali',     value: stats.articles,      icon: <FileText size={22} className="text-blue-400" /> },
                    { label: 'File Media',           value: stats.media,         icon: <ImageIcon size={22} className="text-purple-400" /> },
                    { label: 'Iscritti Newsletter',  value: stats.subs,          icon: <Users size={22} className="text-dis-green" /> },
                    { label: 'Visualizzazioni',      value: stats.total_views,   icon: <Eye size={22} className="text-cyan-400" /> },
                    { label: 'Click CTA',            value: stats.total_clicks,  icon: <MousePointerClick size={22} className="text-orange-400" /> },
                    { label: 'Reazioni',             value: stats.total_reactions, icon: <Heart size={22} className="text-rose-400" /> },
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
                        <div className="h-64 w-full">
                            {analytics?.weekly_views && analytics.weekly_views.length > 0 ? (
                                <Line data={viewsChartData} options={commonOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center border border-dashed border-zinc-800 rounded-lg">
                                    <p className="text-zinc-600 text-sm">Nessuna visualizzazione negli ultimi 7 giorni.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Click CTA per Bottone */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <MousePointerClick size={18} className="text-orange-400" />
                            <h2 className="text-white font-semibold">Distribuzione Click CTA</h2>
                        </div>
                        <div className="h-64 w-full">
                            {analytics?.clicks_by_button && analytics.clicks_by_button.length > 0 ? (
                                <Doughnut data={clicksChartData} options={doughnutOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center border border-dashed border-zinc-800 rounded-lg">
                                    <p className="text-zinc-600 text-sm">Nessun click registrato sui pulsanti.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Distribuzione Reazioni per Tipo */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <Heart size={18} className="text-rose-400" />
                            <h2 className="text-white font-semibold">Distribuzione Reazioni</h2>
                        </div>
                        <div className="h-64 w-full">
                            {analytics?.reactions_by_type && analytics.reactions_by_type.length > 0 ? (
                                <Doughnut 
                                    data={{
                                        labels: analytics.reactions_by_type.map(r => r.reaction),
                                        datasets: [{
                                            data: analytics.reactions_by_type.map(r => r.count),
                                            backgroundColor: [
                                                '#fb7185', // rose
                                                '#38bdf8', // sky
                                                '#fb923c', // orange
                                                '#a78bfa', // violet
                                                '#4ade80'  // green
                                            ],
                                            borderColor: chartColors.bg,
                                            borderWidth: 2,
                                            hoverOffset: 15
                                        }]
                                    }} 
                                    options={doughnutOptions} 
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center border border-dashed border-zinc-800 rounded-lg">
                                    <p className="text-zinc-600 text-sm">Nessuna reazione ancora registrata.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Articoli per Reazioni */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <TrendingUp size={18} className="text-rose-400" />
                            <h2 className="text-white font-semibold">Articoli con più Reazioni</h2>
                        </div>
                        {analytics?.top_articles_by_reactions && analytics.top_articles_by_reactions.length > 0 ? (
                            <ul className="space-y-3">
                                {analytics.top_articles_by_reactions.slice(0, 5).map((art, i) => (
                                    <li key={art.id} className="flex items-center gap-3">
                                        <span className="text-zinc-600 text-sm font-mono w-4 text-right">{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-zinc-300 text-sm truncate">{art.title}</p>
                                        </div>
                                        <span className="flex items-center gap-1 text-rose-400 text-sm font-bold whitespace-nowrap">
                                            <Heart size={12} />
                                            {art.reaction_count}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-zinc-600 text-sm">Nessun articolo ha ancora ricevuto reazioni.</p>
                        )}
                    </div>

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
