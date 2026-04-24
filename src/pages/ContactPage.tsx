import React, { useState } from 'react';
import { Send, User, Mail, MessageSquare, CheckCircle, AlertCircle, Loader2, Facebook, Instagram, Github, Heart } from 'lucide-react';
import SEO from '../components/SEO';
import NewsletterSignup from '../components/NewsletterSignup';

interface FormState {
    name: string;
    email: string;
    subject: string;
    message: string;
}

interface FeedbackState {
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
}

const ContactPage: React.FC = () => {
    const [form, setForm] = useState<FormState>({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const [gdprConsent, setGdprConsent] = useState(false); // trattamento dati
    const [gdprAge, setGdprAge]         = useState(false); // età 16+
    const [feedback, setFeedback] = useState<FeedbackState>({ type: 'idle', message: '' });

    const canSubmit = gdprConsent && gdprAge;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (feedback.type === 'loading' || !canSubmit) return;

        setFeedback({ type: 'loading', message: '' });

        try {
            const res = await fetch('/api/messages.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                setFeedback({ type: 'success', message: data.message });
                setForm({ name: '', email: '', subject: '', message: '' });
                setGdprConsent(false);
                setGdprAge(false);
            } else {
                setFeedback({ type: 'error', message: data.message || 'Si è verificato un errore. Riprova.' });
            }
        } catch {
            setFeedback({ type: 'error', message: 'Impossibile contattare il server. Controlla la connessione.' });
        }
    };

    const inputClass = `
        w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl px-4 py-3 text-white
        placeholder-zinc-500 text-sm
        focus:outline-none focus:border-dis-green/60 focus:bg-zinc-900 focus:ring-1 focus:ring-dis-green/30
        transition-all duration-200
    `;

    return (
        <>
            <SEO
                title="Contattami"
                description="Hai un'idea, un progetto o vuoi semplicemente dire ciao? Scrivimi direttamente dal sito."
            />

            <section className="container mx-auto py-16 sm:py-24 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
                
                {/* Header Integrato */}
                <div className="max-w-4xl mx-auto text-center mb-16 relative">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-dis-green/10 rounded-full blur-3xl pointer-events-none" />
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4 relative z-10">
                        Restiamo in <span className="text-dis-green">Contatto</span>
                    </h1>
                    <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl mx-auto relative z-10">
                        Hai un'idea brillante, un progetto in mente o semplicemente vuoi scambiare due parole sui miei lavori? Scrivimi pure qui sotto.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-start">
                    
                    {/* COLONNA SINISTRA: Form Messaggi */}
                    <div className="lg:col-span-7">
                        <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-dis-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            
                            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-dis-green/10 flex items-center justify-center text-dis-green">
                                    <Send size={18} />
                                </div>
                                Inviami un Messaggio
                            </h2>

                            {feedback.type === 'success' ? (
                                <div className="flex flex-col items-center justify-center text-center py-16 gap-6">
                                    <div className="w-20 h-20 rounded-full bg-dis-green/10 border border-dis-green/30 flex items-center justify-center animate-bounce">
                                        <CheckCircle size={40} className="text-dis-green" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-white mb-3">Ricevuto!</h3>
                                        <p className="text-zinc-400 text-lg">{feedback.message}</p>
                                    </div>
                                    <button
                                        onClick={() => setFeedback({ type: 'idle', message: '' })}
                                        className="px-8 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-2xl hover:bg-zinc-700 hover:text-white font-bold transition-all"
                                    >
                                        Scrivi un altro messaggio
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10" noValidate>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="contact-name" className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                <User size={12} /> Nome *
                                            </label>
                                            <input id="contact-name" name="name" type="text" required placeholder="Il tuo nome" value={form.name} onChange={handleChange} disabled={feedback.type === 'loading'} className={inputClass} />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="contact-email" className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                <Mail size={12} /> Email *
                                            </label>
                                            <input id="contact-email" name="email" type="email" required placeholder="la.tua@email.com" value={form.email} onChange={handleChange} disabled={feedback.type === 'loading'} className={inputClass} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="contact-subject" className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                            <MessageSquare size={12} /> Oggetto
                                        </label>
                                        <input id="contact-subject" name="subject" type="text" placeholder="Di cosa vuoi parlare?" value={form.subject} onChange={handleChange} disabled={feedback.type === 'loading'} className={inputClass} />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="contact-message" className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                            <Send size={12} /> Messaggio *
                                        </label>
                                        <textarea id="contact-message" name="message" required rows={6} placeholder="Scrivimi pure qui. Rispondo in tempi brevi." value={form.message} onChange={handleChange} disabled={feedback.type === 'loading'} className={`${inputClass} resize-none`} />
                                    </div>

                                    {/* Informativa GDPR */}
                                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-[10px] text-zinc-500 leading-relaxed space-y-2">
                                        <p className="font-black text-zinc-400 uppercase tracking-widest mb-2 border-b border-zinc-800 pb-2">Privacy Policy — Contatti</p>
                                        <p><strong className="text-zinc-400">Titolare:</strong> Simone Pizzi. <strong className="text-zinc-400">Finalità:</strong> gestione della richiesta di contatto. <strong className="text-zinc-400">Diritti:</strong> Accesso, rettifica, cancellazione via mail.</p>
                                    </div>

                                    {/* Checkbox GDPR */}
                                    <div className="space-y-3">
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input type="checkbox" checked={gdprConsent} onChange={e => setGdprConsent(e.target.checked)} className="mt-1 shrink-0 accent-dis-green w-4 h-4 rounded" required />
                                            <span className="text-zinc-400 text-xs leading-relaxed group-hover:text-zinc-300 transition-colors">
                                                Acconsento al trattamento dei dati personali per questa richiesta. <span className="text-red-500">*</span>
                                            </span>
                                        </label>
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input type="checkbox" checked={gdprAge} onChange={e => setGdprAge(e.target.checked)} className="mt-1 shrink-0 accent-dis-green w-4 h-4 rounded" required />
                                            <span className="text-zinc-400 text-xs leading-relaxed group-hover:text-zinc-300 transition-colors">
                                                Confermo di avere almeno 16 anni di età. <span className="text-red-500">*</span>
                                            </span>
                                        </label>
                                    </div>

                                    {feedback.type === 'error' && (
                                        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                                            <AlertCircle size={14} className="shrink-0" />
                                            <span>{feedback.message}</span>
                                        </div>
                                    )}

                                    <button type="submit" disabled={feedback.type === 'loading' || !canSubmit} className="flex items-center justify-center gap-3 bg-dis-green text-black font-black py-4 rounded-2xl hover:bg-green-400 transition-all disabled:opacity-50 shadow-lg shadow-green-500/20 active:scale-95">
                                        {feedback.type === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Invia Messaggio</>}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* COLONNA DESTRA: Hub Community, Social & Donazioni */}
                    <div className="lg:col-span-5 space-y-8">
                        
                        {/* Newsletter Card */}
                        <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-8 shadow-xl">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-dis-green/10 flex items-center justify-center text-dis-green">
                                    <Mail size={16} />
                                </div>
                                Newsletter Creativa
                            </h3>
                            <p className="text-zinc-500 text-sm mb-6">Ricevi aggiornamenti su articoli e progetti direttamente nella tua inbox.</p>
                            <NewsletterSignup />
                        </div>

                        {/* Social & Support Card */}
                        <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-8 shadow-xl">
                            <h3 className="text-xl font-bold text-white mb-6">Social & Supporto</h3>
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <a href="https://www.facebook.com/simonepizzi72" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl hover:border-blue-500 transition-all text-zinc-400 hover:text-white">
                                    <Facebook size={18} /> <span className="text-sm font-medium">Facebook</span>
                                </a>
                                <a href="https://www.instagram.com/pizzisimone1972/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl hover:border-pink-500 transition-all text-zinc-400 hover:text-white">
                                    <Instagram size={18} /> <span className="text-sm font-medium">Instagram</span>
                                </a>
                                <a href="https://t.me/simonepizzi72" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl hover:border-blue-400 transition-all text-zinc-400 hover:text-white">
                                    <Send size={18} /> <span className="text-sm font-medium">Telegram</span>
                                </a>
                                <a href="https://github.com/Pitz72" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl hover:border-zinc-300 transition-all text-zinc-400 hover:text-white">
                                    <Github size={18} /> <span className="text-sm font-medium">GitHub</span>
                                </a>
                            </div>

                            <a href="https://www.paypal.com/paypalme/simonepizzi" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full bg-[#0070BA] text-white font-bold py-4 rounded-2xl hover:bg-[#003087] transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                                <Heart size={18} fill="currentColor" /> Sostieni con PayPal
                            </a>
                        </div>

                    </div>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-zinc-600 text-sm">
                        Preferisci scrivere via email tradizionale? <a href="mailto:simonepizzi.1972@proton.me" className="text-dis-green hover:underline">simonepizzi.1972@proton.me</a>
                    </p>
                </div>

            </section>
        </>
    );
};

export default ContactPage;
