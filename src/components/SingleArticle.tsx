import React from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { Share2, Tag, Heart } from 'lucide-react';
import DOMPurify from 'dompurify';
import { api } from '../api';
import { PortfolioItem } from '../types';
import SEO from './SEO';
import ShareModal from './ShareModal';
import LetterModal from './LetterModal';
import NewsletterSignup from './NewsletterSignup';
import ReactionBar, { ReactionData } from './ReactionBar';

const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
};

const formatExternalUrl = (url?: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) return url;
    return `https://${url}`;
};

const SingleArticle: React.FC = () => {
    const { article, reactions } = useLoaderData() as { article: PortfolioItem; reactions: ReactionData };
    const navigate = useNavigate();

    const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
    const [isLetterModalOpen, setIsLetterModalOpen] = React.useState(false);

    React.useEffect(() => {
        if (article) {
            api.trackView(article.id);
            window.scrollTo(0, 0);
        }
    }, [article.id]);

    if (!article) return null;

    return (
        <article className="min-h-[100vh] pb-32 w-full">
            <SEO title={article.title} description={article.summary} image={article.imageUrl} />
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} url={window.location.href} title={article.title} />
            <LetterModal isOpen={isLetterModalOpen} onClose={() => setIsLetterModalOpen(false)} />

            {/* ── HERO ───────────────────────────────────────── */}
            <header className="relative w-full min-h-[60vh] md:min-h-[70vh] flex items-end pt-32">
                <div className="absolute inset-0 w-full h-full">
                    <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover object-[50%_35%]"
                        style={{ filter: 'brightness(0.6) saturate(0.8)' }}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-4/5"
                        style={{ background: 'linear-gradient(to top, #05080a 0%, rgba(5,8,10,0.85) 40%, transparent 100%)' }} />
                </div>

                <div className="relative z-10 px-6 md:px-[52px] pb-14 md:pb-20 w-full" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Back button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-10 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase transition-all"
                        style={{
                            padding: '8px 18px',
                            background: 'rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#d4e8d8',
                            borderRadius: '999px',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.8)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.4)')}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                        Torna all'Archivio
                    </button>

                    {/* Meta badges */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        {article.category && (
                            <span className="font-mono text-[11px] tracking-[0.1em] uppercase px-3 py-1.5"
                                style={{ color: '#fff', background: 'rgba(12,20,16,0.8)', border: '1px solid rgba(34,197,94,0.2)', backdropFilter: 'blur(8px)', borderRadius: '999px' }}>
                                {String(article.category).replace(/-/g, ' ')}
                            </span>
                        )}
                        {article.publishedAt && (
                            <span className="font-mono text-[11px] tracking-[0.1em] uppercase px-3 py-1.5"
                                style={{ color: '#6a9070', border: '1px solid rgba(34,197,94,0.15)', background: 'rgba(5,8,10,0.4)', borderRadius: '999px' }}>
                                {formatDate(article.publishedAt)}
                            </span>
                        )}
                        {article.tags.map(tag => (
                            <span key={tag} className="font-mono text-[11px] tracking-[0.1em] uppercase px-3 py-1.5 text-black bg-dis-green flex items-center gap-1.5"
                                style={{ borderRadius: '999px' }}>
                                <Tag size={10} />
                                {tag}
                            </span>
                        ))}
                    </div>

                    <h1
                        className="font-serif text-white leading-[1.1] mb-5 tracking-tight text-balance"
                        style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', letterSpacing: '-0.03em', maxWidth: '900px' }}
                    >
                        {article.title}
                    </h1>
                    <p className="font-light leading-[1.6] text-balance" style={{ fontSize: '1.2rem', color: '#d4e8d8', maxWidth: '700px' }}>
                        {article.summary}
                    </p>
                </div>
            </header>

            {/* ── READING VIEW ───────────────────────────────── */}
            <div className="relative z-20" style={{ background: '#05080a' }}>
                <div
                    className="
                        mx-auto px-6 md:px-10 py-16 md:py-24
                        prose prose-invert prose-lg md:prose-xl max-w-none
                        prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-tight
                        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-4
                        prose-p:leading-relaxed prose-p:mb-8
                        prose-a:text-dis-green prose-a:no-underline hover:prose-a:underline
                        prose-img:shadow-2xl
                        prose-blockquote:border-l-4 prose-blockquote:border-dis-green prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-v3-fg
                    "
                    style={{
                        maxWidth: '820px',
                        color: '#d4e8d8',
                    }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.description, { ADD_ATTR: ['style'] }) }}
                />
            </div>

            {/* ── REACTION BAR ───────────────────────────────── */}
            <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0 24px 0 40px' }}>
                <ReactionBar articleId={article.id} initialData={reactions} />
            </div>

            {/* ── CTA BOX ────────────────────────────────────── */}
            <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0 24px 0 40px' }}>
                <div
                    className="relative overflow-hidden p-8 md:p-12"
                    style={{
                        background: 'rgba(12,20,16,0.4)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(34,197,94,0.15)',
                        borderRadius: '2px',
                    }}
                >
                    {/* Ambient glow */}
                    <div className="absolute -top-16 -right-16 w-56 h-56 pointer-events-none"
                        style={{ background: 'rgba(34,197,94,0.05)', borderRadius: '50%', filter: 'blur(40px)' }} />

                    <div className="relative z-10 flex flex-col gap-10">
                        {/* Top row: text + donation/share */}
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="flex-1 text-center lg:text-left">
                                <h3 className="font-serif text-white mb-3" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
                                    Ti è piaciuto il progetto?
                                </h3>
                                <p className="leading-[1.7]" style={{ color: '#6a9070', maxWidth: '480px' }}>
                                    Sostieni il mio lavoro e la struttura di{' '}
                                    <span className="text-white font-medium">Runtime Radio</span>{' '}
                                    con una donazione, oppure aiutami a diffonderlo condividendo questa pagina.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                                <a
                                    href="https://www.paypal.com/paypalme/simonepizzi"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 px-7 py-4 font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                                    style={{ background: '#0070BA', borderRadius: '2px', boxShadow: '0 4px 14px rgba(0,112,186,0.2)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#003087')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '#0070BA')}
                                >
                                    <Heart size={18} fill="currentColor" />
                                    Dona con PayPal
                                </a>
                                <button
                                    onClick={() => setIsShareModalOpen(true)}
                                    className="flex items-center justify-center gap-3 px-7 py-4 font-bold transition-all hover:scale-[1.02] active:scale-95"
                                    style={{
                                        background: 'rgba(12,20,16,0.5)',
                                        border: '1px solid rgba(34,197,94,0.2)',
                                        color: '#d4e8d8',
                                        borderRadius: '2px',
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(34,197,94,0.5)';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLButtonElement).style.color = '#d4e8d8';
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(34,197,94,0.2)';
                                    }}
                                >
                                    <Share2 size={18} />
                                    Condividi
                                </button>
                            </div>
                        </div>

                        {/* Bottom row: functional CTA buttons */}
                        {(article.link || article.extraLink || article.hasLetter) && (
                            <div className="pt-10" style={{ borderTop: '1px solid rgba(34,197,94,0.1)' }}>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {article.link && (
                                        <a
                                            href={formatExternalUrl(article.link)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => api.trackClick(article.id, article.buttonText || 'Naviga')}
                                            className="flex justify-center items-center gap-3 font-bold font-sans text-[13px] px-6 py-4 bg-dis-green text-black transition-all hover:bg-green-400 hover:scale-[1.02] active:scale-95"
                                            style={{ borderRadius: '2px', boxShadow: '0 0 40px -10px rgba(34,197,94,0.3)' }}
                                        >
                                            {article.buttonText || 'Naviga'}
                                        </a>
                                    )}
                                    {article.extraLink && (
                                        <a
                                            href={formatExternalUrl(article.extraLink)}
                                            download
                                            onClick={() => api.trackClick(article.id, article.extraLinkText || 'File Aggiuntivo')}
                                            className="flex justify-center items-center gap-3 font-bold font-sans text-[13px] px-6 py-4 text-white transition-all hover:scale-[1.02] active:scale-95"
                                            style={{ background: 'rgba(12,20,16,0.8)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '2px' }}
                                            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)')}
                                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.2)')}
                                        >
                                            {article.extraLinkText || 'File Aggiuntivo'}
                                        </a>
                                    )}
                                    {article.hasLetter && (
                                        <button
                                            onClick={() => setIsLetterModalOpen(true)}
                                            className="flex justify-center items-center gap-3 font-bold font-sans text-[13px] px-6 py-4 transition-all hover:scale-[1.02] active:scale-95"
                                            style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '2px' }}
                                        >
                                            Leggi Lettera
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── NEWSLETTER ─────────────────────────────────── */}
            <div className="max-w-2xl mx-auto mt-10 px-6">
                <NewsletterSignup />
            </div>
        </article>
    );
};

export default SingleArticle;
