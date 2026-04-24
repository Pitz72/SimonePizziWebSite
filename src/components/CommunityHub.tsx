import React from 'react';
import { Mail, Heart, Share2, Facebook, Instagram, Send, Github, MessageSquare } from 'lucide-react';
import NewsletterSignup from './NewsletterSignup';

const CommunityHub: React.FC = () => {
    return (
        <section className="container mx-auto py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                    Entra nel <span className="text-dis-green text-glow">Mondo</span>
                </h2>
                <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                    Sostieni il mio lavoro, resta aggiornato sulle ultime uscite o connettiamoci sui social per scambiare due chiacchiere.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-stretch">
                {/* 1. NEWSLETTER CARD */}
                <div className="group relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 hover:border-dis-green/30 transition-all duration-500 flex flex-col h-full shadow-2xl">
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-dis-green/10 border border-dis-green/20 rounded-2xl flex items-center justify-center text-dis-green shadow-[0_0_20px_rgba(34,197,94,0.1)] group-hover:scale-110 transition-transform duration-500">
                        <Mail size={22} />
                    </div>
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2">Newsletter</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Niente spam, solo contenuti reali: nuovi articoli, progetti e riflessioni direttamente nella tua inbox.
                        </p>
                    </div>
                    <div className="mt-auto">
                        <NewsletterSignup />
                    </div>
                </div>

                {/* 2. SUPPORT CARD */}
                <div className="group relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 hover:border-blue-500/30 transition-all duration-500 flex flex-col h-full shadow-2xl">
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)] group-hover:scale-110 transition-transform duration-500">
                        <Heart size={22} />
                    </div>
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">Sostieni il Lavoro</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                            Sostenendo me, aiuti a mantenere vivi i miei progetti e tutta la struttura di Runtime Radio. Ogni contributo è prezioso.
                        </p>
                        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl mb-6">
                            <p className="text-xs text-blue-300/60 uppercase font-bold tracking-widest mb-1 italic">Dona ora tramite</p>
                            <span className="text-xl font-black text-white italic tracking-tighter flex items-center gap-1">
                                Pay<span className="text-blue-400">Pal</span>
                            </span>
                        </div>
                    </div>
                    <div className="mt-auto">
                        <a
                            href="https://www.paypal.com/paypalme/simonepizzi"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-3 bg-[#0070BA] text-white font-bold py-4 px-8 rounded-2xl hover:bg-[#003087] transition-all duration-300 shadow-lg shadow-blue-900/20 group-hover:shadow-blue-500/20"
                        >
                            Fai una donazione
                        </a>
                    </div>
                </div>

                {/* 3. CONNECT CARD */}
                <div className="group relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 hover:border-purple-500/30 transition-all duration-500 flex flex-col h-full shadow-2xl">
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.1)] group-hover:scale-110 transition-transform duration-500">
                        <Share2 size={22} />
                    </div>
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2">Connettiamoci</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Seguimi sui social o scrivimi direttamente. Sono sempre aperto a nuove collaborazioni e feedback costruttivi.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-auto">
                        <a 
                            href="https://www.facebook.com/simonepizzi72" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl hover:bg-zinc-800 hover:border-zinc-500 transition-all text-zinc-300 hover:text-white group/social"
                        >
                            <Facebook size={18} className="group-hover/social:text-blue-500 transition-colors" />
                            <span className="text-sm font-medium">Facebook</span>
                        </a>
                        <a 
                            href="https://www.instagram.com/pizzisimone1972/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl hover:bg-zinc-800 hover:border-zinc-500 transition-all text-zinc-300 hover:text-white group/social"
                        >
                            <Instagram size={18} className="group-hover/social:text-pink-500 transition-colors" />
                            <span className="text-sm font-medium">Instagram</span>
                        </a>
                        <a 
                            href="https://t.me/simonepizzi72" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl hover:bg-zinc-800 hover:border-zinc-500 transition-all text-zinc-300 hover:text-white group/social"
                        >
                            <Send size={18} className="group-hover/social:text-blue-400 transition-colors" />
                            <span className="text-sm font-medium">Telegram</span>
                        </a>
                        <a 
                            href="https://github.com/Pitz72" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl hover:bg-zinc-800 hover:border-zinc-500 transition-all text-zinc-300 hover:text-white group/social"
                        >
                            <Github size={18} className="group-hover/social:text-white transition-colors" />
                            <span className="text-sm font-medium">GitHub</span>
                        </a>
                        <a 
                            href="mailto:pizzisimone1972@gmail.com"
                            className="col-span-2 flex items-center justify-center gap-3 p-4 bg-dis-green/5 border border-dis-green/20 rounded-xl hover:bg-dis-green/10 hover:border-dis-green transition-all text-dis-green font-bold text-sm"
                        >
                            <MessageSquare size={18} />
                            INVIAMI UNA MAIL
                        </a>
                    </div>
                </div>
            </div>

            <style>{`
                .text-glow {
                    text-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
                }
            `}</style>
        </section>
    );
};

export default CommunityHub;
