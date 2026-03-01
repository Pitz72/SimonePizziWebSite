import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Download, ExternalLink, Tag } from 'lucide-react';
import { api } from '../api';
import { PortfolioItem } from '../types';
import SEO from './SEO';
import ShareModal from './ShareModal';
import LetterModal from './LetterModal';

interface SingleArticleProps {
    /* props riservati per sviluppi futuri */
}

// Helper per forzare protocollo http/https se non presente
const formatExternalUrl = (url?: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) return url;
    return `https://${url}`;
};

const SingleArticle: React.FC<SingleArticleProps> = () => {
    const { projectSlug } = useParams<{ projectSlug: string }>();
    const navigate = useNavigate();

    const [article, setArticle] = useState<PortfolioItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!projectSlug) return;
            setLoading(true);
            try {
                // Recuperiamo dal DB passando lo slug esatto pescato dalla URL
                const found = await api.getArticleBySlug(projectSlug);

                if (found && !found.error) {
                    setArticle({
                        id: found.id,
                        slug: found.slug,
                        title: found.title,
                        summary: found.excerpt || '',
                        description: found.content,
                        imageUrl: found.cover_image || '/api/placeholder/1200/800',
                        category: found.category,
                        tags: found.tags ? found.tags.split(',').map((t: string) => t.trim()) : [],
                        isFeatured: found.is_featured === 1,
                        link: found.button_a_link,
                        buttonText: found.button_a_label,
                        extraLink: found.button_b_link,
                        extraLinkText: found.button_b_label,
                        // Feature legacy The Safe Place se i tag la menzionano
                        hasLetter: found.tags && found.tags.toLowerCase().includes('lettera')
                    });
                } else {
                    setError('Articolo non trovato o non più disponibile.');
                }
            } catch (err: any) {
                setError('Errore di connessione al database.');
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
        window.scrollTo(0, 0); // Scroll in cima all'apertura dell'articolo
    }, [projectSlug]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center text-zinc-500">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-dis-green mb-6"></div>
                <p>Apertura Lettore...</p>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-4">Articolo Smarrito</h2>
                    <p className="text-zinc-400 mb-8">{error || 'Impossibile caricare il testo.'}</p>
                    <button onClick={() => navigate(-1)} className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition">
                        Torna all'Elenco
                    </button>
                </div>
            </div>
        );
    }

    return (
        <article className="min-h-[100vh] pb-32 w-full animate-in fade-in duration-[1000ms]">
            <SEO title={article.title} description={article.summary} image={article.imageUrl} />
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} url={window.location.href} title={article.title} />
            <LetterModal isOpen={isLetterModalOpen} onClose={() => setIsLetterModalOpen(false)} />

            {/* HERO IMMERSIVO PARALLAX/FADE */}
            <header className="relative w-full h-[60vh] md:h-[75vh] flex items-end">
                {/* Immagine di Copertina */}
                <div className="absolute inset-0 w-full h-full">
                    <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover object-[50%_35%] filter brightness-75 md:brightness-[0.85]"
                    />
                    {/* Sfumatura Nera Inferiore E Aggressiva per Leggibilità Titolo */}
                    <div className="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                </div>

                {/* Contenuto dell'Hero */}
                <div className="relative z-10 container mx-auto px-4 md:px-8 pb-12 md:pb-24">
                    {/* Back Button Tattico */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-8 md:mb-12 inline-flex items-center gap-2 px-5 py-2.5 bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/10 text-zinc-300 rounded-full text-sm font-medium transition-all group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Torna all'Archivio
                    </button>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        {article.tags.map(tag => (
                            <span key={tag} className="flex items-center gap-1.5 text-xs font-bold text-black bg-dis-green px-3 py-1.5 rounded-full uppercase tracking-wider">
                                <Tag size={12} />
                                {tag}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 tracking-tight text-balance">
                        {article.title}
                    </h1>

                    <p className="text-xl md:text-2xl text-zinc-300 font-medium max-w-3xl leading-relaxed text-balance">
                        {article.summary}
                    </p>
                </div>
            </header>

            {/* FOGLIO DI LETTURA (Typography Container) */}
            <div className="bg-black relative z-20">
                <div className="max-w-4xl mx-auto px-6 md:px-10 py-16 md:py-24">
                    <div
                        className="
                            prose prose-invert prose-lg md:prose-xl max-w-none text-zinc-300
                            prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-zinc-800 prose-h2:pb-4
                            prose-p:leading-relaxed prose-p:mb-8
                            prose-a:text-dis-green prose-a:no-underline hover:prose-a:underline
                            prose-img:rounded-2xl prose-img:shadow-2xl prose-img:border prose-img:border-zinc-800
                            prose-blockquote:border-l-4 prose-blockquote:border-dis-green prose-blockquote:bg-zinc-900/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-zinc-200
                        "
                        dangerouslySetInnerHTML={{ __html: article.description }}
                    />
                </div>
            </div>

            {/* CALL TO ACTION GLASSMORPHIC FLOAT (Fondo Pagina) */}
            <div className="max-w-4xl mx-auto px-6 md:px-10">
                <div className="bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800/80 rounded-3xl p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-center gap-6 justify-between">

                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">Ti è piaciuto questo progetto?</h3>
                        <p className="text-zinc-400">Aiutaci a diffonderlo con la condivisione sui tuoi social.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {article.link && (
                            <a href={formatExternalUrl(article.link)} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-dis-green text-black font-bold px-6 py-4 rounded-xl hover:bg-green-400 transition-colors shadow-[0_0_30px_-5px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_-5px_rgba(34,197,94,0.6)]">
                                {article.buttonText || 'Naviga'}
                                <ExternalLink size={18} />
                            </a>
                        )}

                        {article.extraLink && (
                            <a href={formatExternalUrl(article.extraLink)} download className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-zinc-800 text-white font-bold px-6 py-4 rounded-xl hover:bg-zinc-700 transition-colors border border-zinc-700">
                                {article.extraLinkText || 'File Aggiuntivo'}
                                <Download size={18} />
                            </a>
                        )}

                        {article.hasLetter && (
                            <button onClick={() => setIsLetterModalOpen(true)} className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-purple-600/20 text-purple-400 font-bold px-6 py-4 rounded-xl hover:bg-purple-600/30 transition-colors border border-purple-500/30">
                                Leggi Lettera
                            </button>
                        )}

                        <button onClick={() => setIsShareModalOpen(true)} className="flex justify-center flex-1 md:flex-none p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors" title="Condividi">
                            <Share2 size={20} />
                        </button>
                    </div>

                </div>
            </div>

        </article>
    );
};

export default SingleArticle;
