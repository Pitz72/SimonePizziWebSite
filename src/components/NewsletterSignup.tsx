import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../api';

type SignupState = 'idle' | 'loading' | 'success' | 'already' | 'error';

interface Props {
    compact?: boolean;
}

export default function NewsletterSignup({ compact = false }: Props) {
    const [email, setEmail]       = useState('');
    const [name, setName]         = useState('');
    const [gdpr1, setGdpr1]       = useState(false); // trattamento dati
    const [gdpr2, setGdpr2]       = useState(false); // età 16+
    const [state, setState]       = useState<SignupState>('idle');
    const [message, setMessage]   = useState('');

    const canSubmit = email && gdpr1 && (compact || gdpr2);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setState('loading');
        try {
            const res = await api.newsletterSubscribe({ email, name: name || undefined });
            if (res.status === 'success' || res.status === 'pending') {
                setState('success');
                setMessage(res.message);
            } else if (res.status === 'already') {
                setState('already');
                setMessage(res.message);
            } else {
                setState('error');
                setMessage(res.message || 'Errore. Riprova più tardi.');
            }
        } catch {
            setState('error');
            setMessage('Errore di rete. Riprova più tardi.');
        }
    };

    if (state === 'success') {
        return (
            <div className={`flex items-start gap-3 text-green-400 ${compact ? 'py-2' : 'py-6'}`}>
                <CheckCircle size={20} className="mt-0.5 shrink-0" />
                <p className="text-sm leading-relaxed">{message}</p>
            </div>
        );
    }

    if (state === 'already') {
        return (
            <div className={`flex items-start gap-3 text-zinc-400 ${compact ? 'py-2' : 'py-6'}`}>
                <CheckCircle size={20} className="mt-0.5 shrink-0 text-dis-green" />
                <p className="text-sm leading-relaxed">{message}</p>
            </div>
        );
    }

    /* ── MODALITÀ COMPACT (Footer) ── */
    if (compact) {
        return (
            <div className="space-y-2">
                {state === 'error' && (
                    <div className="flex items-center gap-2 text-red-400 text-xs">
                        <AlertCircle size={14} /><span>{message}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="La tua email"
                        required
                        className="flex-1 min-w-0 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-dis-green transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={state === 'loading' || !canSubmit}
                        className="flex items-center gap-1.5 bg-dis-green text-black font-bold px-4 py-2 rounded-lg hover:bg-green-400 transition-colors text-sm shrink-0 disabled:opacity-60"
                    >
                        {state === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                        Iscriviti
                    </button>
                </form>
                {/* Consenso GDPR compact */}
                <label className="flex items-start gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={gdpr1}
                        onChange={e => setGdpr1(e.target.checked)}
                        className="mt-0.5 shrink-0 accent-dis-green"
                        required
                    />
                    <span className="text-zinc-500 text-xs leading-relaxed">
                        Acconsento al trattamento dei miei dati personali per l'invio della newsletter, ai sensi del Regolamento UE 2016/679 (GDPR). Posso revocare il consenso in qualsiasi momento tramite il link di disiscrizione presente in ogni email.
                    </span>
                </label>
            </div>
        );
    }

    /* ── MODALITÀ STANDARD (fine articolo) ── */
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-dis-green/10 border border-dis-green/20 flex items-center justify-center">
                    <Mail size={18} className="text-dis-green" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg leading-tight">Newsletter</h3>
                    <p className="text-zinc-500 text-sm">Aggiornamenti direttamente nella tua inbox</p>
                </div>
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Nuovi articoli, racconti, progetti e riflessioni. Niente spam, solo contenuti.
                Puoi disiscriverti in qualsiasi momento.
            </p>

            {state === 'error' && (
                <div className="flex items-center gap-2 text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Il tuo nome (opzionale)"
                    className="w-full bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-dis-green transition-colors"
                />
                <div className="flex gap-3">
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="La tua email"
                        required
                        className="flex-1 min-w-0 bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-dis-green transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={state === 'loading' || !canSubmit}
                        className="flex items-center gap-2 bg-dis-green text-black font-bold px-6 py-3 rounded-xl hover:bg-green-400 transition-colors text-sm shrink-0 disabled:opacity-60"
                    >
                        {state === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 'Iscriviti'}
                    </button>
                </div>

                {/* Informativa GDPR */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-xs text-zinc-500 leading-relaxed space-y-1 mt-2">
                    <p className="font-semibold text-zinc-400 uppercase tracking-wide text-[10px] mb-2">Informativa Privacy — Aprile 2026</p>
                    <p><strong className="text-zinc-400">Titolare:</strong> Simone Pizzi — simonepizzi.1972@proton.me</p>
                    <p><strong className="text-zinc-400">Finalità:</strong> invio di comunicazioni newsletter relative alle attività creative dell'autore (articoli, progetti, racconti, podcast).</p>
                    <p><strong className="text-zinc-400">Base giuridica:</strong> consenso dell'interessato (art. 6, par. 1, lett. a) Reg. UE 2016/679 — GDPR).</p>
                    <p><strong className="text-zinc-400">Conservazione:</strong> i dati vengono conservati fino alla revoca del consenso.</p>
                    <p><strong className="text-zinc-400">Diritti:</strong> accesso, rettifica, cancellazione, limitazione, portabilità e opposizione (artt. 15–21 GDPR) scrivendo a simonepizzi.1972@proton.me o cliccando il link di disiscrizione in ogni email.</p>
                    <p><strong className="text-zinc-400">Trasferimento:</strong> i dati non vengono ceduti a terzi né trasferiti fuori dall'UE.</p>
                </div>

                {/* Checkbox consenso */}
                <div className="space-y-3 pt-1">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={gdpr1}
                            onChange={e => setGdpr1(e.target.checked)}
                            className="mt-0.5 shrink-0 accent-dis-green"
                            required
                        />
                        <span className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">
                            Ho letto l'informativa sulla privacy e acconsento al trattamento dei miei dati personali per l'invio della newsletter. <span className="text-red-400">*</span>
                        </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={gdpr2}
                            onChange={e => setGdpr2(e.target.checked)}
                            className="mt-0.5 shrink-0 accent-dis-green"
                            required
                        />
                        <span className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">
                            Confermo di avere almeno 16 anni di età (requisito minimo ai sensi del GDPR per esprimere consenso autonomo al trattamento dei dati). <span className="text-red-400">*</span>
                        </span>
                    </label>
                    <p className="text-zinc-600 text-xs"><span className="text-red-400">*</span> campi obbligatori</p>
                </div>
            </form>
        </div>
    );
}
