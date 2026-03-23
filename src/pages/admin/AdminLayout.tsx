import { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Image as ImageIcon, Settings, LogOut, FolderOpen } from 'lucide-react';
import { api } from '../../api';

export default function AdminLayout() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Verifica sessione al mount del Layout (che è genitore di tutti i moduli Admin)
        api.checkSession()
            .then(() => setIsAuthenticated(true))
            .catch(() => navigate('/admin/login'))
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleLogout = async () => {
        await api.logout();
        navigate('/admin/login');
    };

    if (loading) {
        return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-dis-green">Caricamento cruscotto...</div>;
    }

    if (!isAuthenticated) return null;

    const navLinks = [
        { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/admin/articles', icon: <FileText size={20} />, label: 'Articoli (Mini-CMS)' },
        { path: '/admin/projects', icon: <FolderOpen size={20} />, label: 'Tutti i Progetti' },
        { path: '/admin/media', icon: <ImageIcon size={20} />, label: 'Media Gallery' },
        { path: '/admin/settings', icon: <Settings size={20} />, label: 'Impostazioni' },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
                <div className="p-6">
                    <h2 className="text-white font-bold text-xl">Console<span className="text-dis-green">SP</span></h2>
                    <p className="text-zinc-500 text-xs mt-1 uppercase tracking-wider">Pannello Gestione</p>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navLinks.map((link) => {
                        const isActive = location.pathname.startsWith(link.path);
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-dis-green/10 text-dis-green border border-dis-green/20'
                                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                                    }`}
                            >
                                {link.icon}
                                <span className="font-medium text-sm">{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-zinc-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium text-sm">Disconnetti</span>
                    </button>
                    <div className="mt-4 text-center">
                        <a href="#/" target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-600 hover:text-dis-green transition-colors">Vedi Sito Live ↗</a>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto bg-zinc-950/50">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
