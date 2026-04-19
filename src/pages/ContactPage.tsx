import React, { useState } from 'react';
import { Send, User, Mail, MessageSquare, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';

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
        w-full bg-zinc-900/60 border border-zinc-700/80 rounded-xl px-4 py-3 text-white
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

            <section className="max-w-2xl mx-auto py-16 sm:py-24 px-0 animate-in fade-in duration-500">

                {/* Header */}
                <div className="mb-12 text-center md:text-left relative">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-dis-green/8 rounded-full blur-3xl pointer-events-none" />
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 relative z-10">
                        Contattami
                    </h1>
                    <p className="text-zinc-400 text-lg leading-relaxed relative z-10">
                        Hai un'idea, un progetto in mente, o vuoi semplicemente scambiare due parole sui miei lavori?
                        Compila il form e ti rispondo al più presto.
                    </p>
                    <div className="h-1 w-16 bg-dis-green rounded-full mt-6 md:mx-0 mx-auto relative z-10" />
                </div>

                {/* Form */}
                <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800/80 rounded-3xl p-8 md:p-10 shadow-2xl relative">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-dis-green/3 to-transparent pointer-events-none" />

                    {feedback.type === 'success' ? (
                        /* Stato di successo */
                        <div className="flex flex-col items-center justify-center text-center py-12 gap-5">
                            <div className="w-16 h-16 rounded-full bg-dis-green/10 border border-dis-green/30 flex items-center justify-center">
                                <CheckCircle size={32} className="text-dis-green" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Messaggio inviato!</h2>
                                <p className="text-zinc-400">{feedback.message}</p>
                            </div>
                            <button
                                onClick={() => setFeedback({ type: 'idle', message: '' })}
                                className="mt-2 px-6 py-2.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl hover:bg-zinc-700 hover:text-white text-sm font-medium transition-all duration-200"
                            >
                                Invia un altro messaggio
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10" noValidate>

                            {/* Nome */}
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="contact-name" className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <User size={11} />
                                    Nome *
                                </label>
                                <input
                                    id="contact-name"
                                    name="name"
                                    type="text"
                                    required
                                    autoComplete="name"
                                    placeholder="Il tuo nome"
                                    value={form.name}
                                    onChange={handleChange}
                                    disabled={feedback.type === 'loading'}
                                    className={inputClass}
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="contact-email" className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Mail size={11} />
                                    Email *
                                </label>
                                <input
                                    id="contact-email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    placeholder="la.tua@email.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    disabled={feedback.type === 'loading'}
                                    className={inputClass}
                                />
                            </div>

                            {/* Oggetto */}
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="contact-subject" className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <MessageSquare size={11} />
                                    Oggetto
                                </label>
                                <input
                                    id="contact-subject"
                                    name="subject"
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Di cosa vuoi parlare?"
                                    value={form.subject}
                                    onChange={handleChange}
                                    disabled={feedback.type === 'loading'}
                                    className={inputClass}
                                />
                            </div>

                            {/* Messaggio */}
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="contact-message" className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Send size={11} />
                                    Messaggio *
                                </label>
                                <textarea
                                    id="contact-message"
                                    name="message"
                                    required
                                    rows={6}
                                    placeholder="Scrivimi pure qui. Rispondo entro 24–48 ore."
                                    value={form.message}
                                    onChange={handleChange}
                                    disabled={feedback.type === 'loading'}
                                    className={`${inputClass} resize-none`}
                                />
                            </div>

                            {/* Informativa GDPR */}
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-xs text-zinc-500 leading-relaxed space-y-1">
                                <p className="font-semibold text-zinc-400 uppercase tracking-wide text-[10px] mb-2">Informativa Privacy — Aprile 2026</p>
                                <p><strong className="text-zinc-400">Titolare:</strong> Simone Pizzi — simonepizzi.1972@proton.me</p>
                                <p><strong className="text-zinc-400">Finalità:</strong> gestione della richiesta di contatto e risposta alla medesima.</p>
                                <p><strong className="text-zinc-400">Base giuridica:</strong> consenso dell'interessato (art. 6, par. 1, lett. a) Reg. UE 2016/679 — GDPR).</p>
                                <p><strong className="text-zinc-400">Conservazione:</strong> i dati vengono conservati per il tempo necessario a evadere la richiesta e per eventuali comunicazioni successive correlate, salvo diversa indicazione.</p>
                                <p><strong className="text-zinc-400">Diritti:</strong> accesso, rettifica, cancellazione, limitazione, portabilità e opposizione (artt. 15–21 GDPR) scrivendo a simonepizzi.1972@proton.me.</p>
                                <p><strong className="text-zinc-400">Trasferimento:</strong> i dati non vengono ceduti a terzi né trasferiti fuori dall'UE.</p>
                            </div>

                            {/* Checkbox consensi GDPR */}
                            <div className="space-y-3">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={gdprConsent}
                                        onChange={e => setGdprConsent(e.target.checked)}
                                        className="mt-0.5 shrink-0 accent-dis-green"
                                        required
                                    />
                                    <span className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">
                                        Ho letto l'informativa sulla privacy e acconsento al trattamento dei miei dati personali per la gestione di questa richiesta di contatto. <span className="text-red-400">*</span>
                                    </span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={gdprAge}
                                        onChange={e => setGdprAge(e.target.checked)}
                                        className="mt-0.5 shrink-0 accent-dis-green"
                                        required
                                    />
                                    <span className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">
                                        Confermo di avere almeno 16 anni di età (requisito minimo ai sensi del GDPR per esprimere consenso autonomo al trattamento dei dati). <span className="text-red-400">*</span>
                                    </span>
                                </label>
                                <p className="text-zinc-600 text-xs"><span className="text-red-400">*</span> campi obbligatori</p>
                            </div>

                            {/* Feedback errore */}
                            {feedback.type === 'error' && (
                                <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                    <AlertCircle size={16} className="flex-shrink-0" />
                                    <span>{feedback.message}</span>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={feedback.type === 'loading' || !canSubmit}
                                className="mt-2 flex items-center justify-center gap-2.5 w-full bg-dis-green text-black font-bold text-sm py-4 rounded-xl hover:bg-green-400 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-green-500/20 hover:shadow-green-500/30 active:scale-[0.98]"
                            >
                                {feedback.type === 'loading' ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Invio in corso...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Invia il Messaggio
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-zinc-600 mt-1">
                                * Campi obbligatori. Niente spam, promesso.
                            </p>
                        </form>
                    )}
                </div>

                {/* Contatto diretto */}
                <div className="mt-8 text-center">
                    <p className="text-zinc-500 text-sm">
                        Preferisci la mail diretta?{' '}
                        <a
                            href="mailto:simonepizzi.1972@proton.me"
                            className="text-dis-green hover:text-green-400 transition-colors font-medium"
                        >
                            simonepizzi.1972@proton.me
                        </a>
                    </p>
                </div>

            </section>
        </>
    );
};

export default ContactPage;
