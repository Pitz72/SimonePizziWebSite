import React from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Tag, Calendar } from 'lucide-react';
import DOMPurify from 'dompurify';
import { api } from '../api';
import { PortfolioItem } from '../types';
import SEO from './SEO';
import ShareModal from './ShareModal';
import LetterModal from './LetterModal';
import NewsletterSignup from './NewsletterSignup';

interface SingleArticleProps {
    /* props riservati per sviluppi futuri */
}

// Helper per forzare protocollo http/https se non presente
const formatExternalUrl = (url?: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) return url;
    return `https://${url}`;
};

/** Formatta "19 apr 2026 · 14:30" da una stringa ISO */
const formatDateTime = (dateStr: string): string => {
    const d = new Date(dateStr);
    const date = d.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${date} · ${hh}:${mm}`;
};

const SingleArticle: React.FC<SingleArticleProps> = () => {
    const article = useLoaderData() as PortfolioItem;
    const navigate = useNavigate();

    const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
    const [isLetterModalOpen, setIsLetterModalOpen] = React.useState(false);

    React.useEffect(() => {
        if (article) {
            // Traccia visualizzazione (fire-and-forget)
            api.trackView(article.id);
            window.scrollTo(0, 0);
        }
    }, [article.id]);

    if (!article) return null;

    return (
        <article className="min-h-[100vh] pb-32 w-full animate-in fade-in duration-[1000ms]">
            <SEO title={article.title} description={article.summary} image={article.imageUrl} />
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} url={window.location.href} title={article.title} />
            <LetterModal isOpen={isLetterModalOpen} onClose={() => setIsLetterModalOpen(false)} />

            {/* HERO IMMERSIVO PARALLAX/FADE */}
            <header className="relative w-full min-h-[60vh] md:min-h-[75vh] flex items-end pt-32">
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
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        {/* Badge categoria */}
                        {article.category && (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-zinc-800/80 border border-zinc-700 backdrop-blur-md px-3 py-1.5 rounded-full uppercase tracking-wider">
                                {String(article.category).replace(/-/g, ' ')}
                            </span>
                        )}
                        {/* Data + ora */}
                        {article.publishedAt && (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 border border-zinc-800 bg-black/40 px-3 py-1.5 rounded-full uppercase tracking-wider">
                                <Calendar size={12} />
                                {formatDateTime(article.publishedAt)}
                            </span>
                        )}
                        {/* Tag tematici */}
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
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.description, { ADD_ATTR: ['style'] }) }}
                    />
                </div>
            </div>

            {/* CALL TO ACTION GLASSMORPHIC FLOAT (Fondo Pagina) */}
            <div className="max-w-4xl mx-auto px-6 md:px-10">
                <div className="bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800/80 rounded-3xl p-8 md:p-10 shadow-2xl flex flex-col gap-8">

                    {/* RIGA SUPERIORE: Testo a sinistra, Condividi a destra */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-2xl font-bold text-white mb-2">Ti è piaciuto questo progetto?</h3>
                            <p className="text-zinc-400">Sostieni il mio lavoro e Runtime Radio con una donazione, o aiutaci a diffonderlo con la condivisione sui tuoi social.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <a
                                href="https://www.paypal.com/paypalme/simonepizzi"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-[#0070BA] text-white hover:bg-[#003087] transition-all font-bold shadow-lg shadow-blue-900/20"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.946 5.05-4.336 6.73-8.339 6.73h-.69c-.314 0-.58.218-.641.524l-1.24 6.225a.645.645 0 0 1-.641.524h-1.455z" />
                                </svg>
                                Dona con PayPal
                            </a>
                            <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-3 w-full md:w-auto px-6 py-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 transition-all font-medium whitespace-nowrap" title="Condividi">
                                <Share2 size={20} />
                                Condividi
                            </button>
                        </div>
                    </div>

                    {/* RIGA INFERIORE: Bottoni Custom (Se l'articolo ne possiede almeno uno) */}
                    {(article.link || article.extraLink || article.hasLetter) && (
                        <div className="pt-6 border-t border-zinc-800/50 flex flex-col sm:flex-row items-stretch justify-center gap-4">
                            {article.link && (
                                <a
                                    href={formatExternalUrl(article.link)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => api.trackClick(article.id, article.buttonText || 'Naviga')}
                                    className="flex-1 flex justify-center items-center gap-2 bg-dis-green text-black font-bold px-6 py-4 rounded-xl hover:bg-green-400 transition-colors shadow-[0_0_30px_-5px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_-5px_rgba(34,197,94,0.6)]"
                                >
                                    {article.buttonText || 'Naviga'}
                                </a>
                            )}

                            {article.extraLink && (
                                <a
                                    href={formatExternalUrl(article.extraLink)}
                                    download
                                    onClick={() => api.trackClick(article.id, article.extraLinkText || 'File Aggiuntivo')}
                                    className="flex-1 flex justify-center items-center gap-2 bg-zinc-800 text-white font-bold px-6 py-4 rounded-xl hover:bg-zinc-700 transition-colors border border-zinc-700"
                                >
                                    {article.extraLinkText || 'File Aggiuntivo'}
                                </a>
                            )}

                            {article.hasLetter && (
                                <button onClick={() => setIsLetterModalOpen(true)} className="flex-1 flex justify-center items-center gap-2 bg-purple-600/20 text-purple-400 font-bold px-6 py-4 rounded-xl hover:bg-purple-600/30 transition-colors border border-purple-500/30">
                                    Leggi Lettera
                                </button>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Newsletter signup — sotto il box CTA */}
            <div className="max-w-2xl mx-auto mt-10">
                <NewsletterSignup />
            </div>

        </article>
    );
};

export default SingleArticle;
