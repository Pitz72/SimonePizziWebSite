import { Activity, FileText, Image as ImageIcon, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const [stats, setStats] = useState({
        articles: '...',
        media: '...',
        subs: '...',
        status: 'Online'
    });

    useEffect(() => {
        api.getStats().then(data => {
            setStats({
                articles: data.total_articles.toString(),
                media: data.total_media.toString(),
                subs: data.total_subscribers.toString(),
                status: data.system_status
            });
        }).catch(err => {
            console.error('Errore caricamento statistiche:', err);
            setStats(prev => ({ ...prev, status: 'Errore API' }));
        });
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                <p className="text-zinc-400 mt-2">Benvenuto nel centro di controllo del tuo Portfolio Dinamico.</p>
            </header>

            {/* Stat Cards Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Articoli Totali', value: stats.articles, icon: <FileText size={24} className="text-blue-400" /> },
                    { label: 'File Media', value: stats.media, icon: <ImageIcon size={24} className="text-purple-400" /> },
                    { label: 'Iscritti Newsletter', value: stats.subs, icon: <Users size={24} className="text-dis-green" /> },
                    { label: 'Stato Sistema', value: stats.status, icon: <Activity size={24} className="text-emerald-400" /> },
                ].map((stat, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-zinc-500 text-sm font-medium mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-white">{stat.value}</p>
                        </div>
                        <div className="p-4 bg-zinc-950 rounded-full">
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions Placeholder */}
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
                </div>
            </div>
        </div>
    );
}
