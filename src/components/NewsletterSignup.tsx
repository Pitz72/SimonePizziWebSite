import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../api';

type SignupState = 'idle' | 'loading' | 'success' | 'already' | 'error';

export default function NewsletterSignup() {
    const [email, setEmail]       = useState('');
    const [name, setName]         = useState('');
    const [gdpr1, setGdpr1]       = useState(false); // trattamento dati
    const [gdpr2, setGdpr2]       = useState(false); // età 16+
    const [state, setState]       = useState<SignupState>('idle');
    const [message, setMessage]   = useState('');

    const canSubmit = email && gdpr1 && gdpr2;

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
            <div className="flex items-start gap-3 text-green-400 py-6">
                <CheckCircle size={20} className="mt-0.5 shrink-0" />
                <p className="text-sm leading-relaxed font-medium">{message}</p>
            </div>
        );
    }

    if (state === 'already') {
        return (
            <div className="flex items-start gap-3 text-zinc-400 py-6">
                <CheckCircle size={20} className="mt-0.5 shrink-0 text-dis-green" />
                <p className="text-sm leading-relaxed font-medium">{message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {state === 'error' && (
                <div className="flex items-center gap-2 text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                    <AlertCircle size={16} className="shrink-0" />
                    <span className="font-medium">{message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-2">
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Il tuo nome (opzionale)"
                        className="w-full bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-dis-green focus:ring-1 focus:ring-dis-green transition-all"
                    />
                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="La tua email"
                            required
                            className="flex-1 min-w-0 bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-dis-green focus:ring-1 focus:ring-dis-green transition-all"
                        />
                        <button
                            type="submit"
                            disabled={state === 'loading' || !canSubmit}
                            className="flex items-center justify-center gap-2 bg-dis-green text-black font-bold px-6 py-3 rounded-xl hover:bg-green-400 transition-all text-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
                        >
                            {state === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                        </button>
                    </div>
                </div>

                {/* Informativa GDPR Espandibile o Integrata */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-[10px] text-zinc-500 leading-relaxed space-y-1">
                    <p className="font-bold text-zinc-400 uppercase tracking-tighter mb-1">Informativa Privacy</p>
                    <p>Titolare: Simone Pizzi. Finalità: invio newsletter creativa. Base giuridica: consenso (GDPR). Dati conservati fino a revoca. Diritti (artt. 15-21) via mail o link disiscrizione.</p>
                </div>

                {/* Checkbox consenso */}
                <div className="space-y-2 pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={gdpr1}
                            onChange={e => setGdpr1(e.target.checked)}
                            className="mt-1 shrink-0 accent-dis-green w-4 h-4 rounded"
                            required
                        />
                        <span className="text-zinc-400 text-[11px] leading-tight group-hover:text-zinc-300 transition-colors">
                            Acconsento al trattamento dati per la newsletter. <span className="text-red-500/80">*</span>
                        </span>
                    </label>
                    <label className="flex items-start gap-2.5 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={gdpr2}
                            onChange={e => setGdpr2(e.target.checked)}
                            className="mt-1 shrink-0 accent-dis-green w-4 h-4 rounded"
                            required
                        />
                        <span className="text-zinc-400 text-[11px] leading-tight group-hover:text-zinc-300 transition-colors">
                            Confermo di avere almeno 16 anni. <span className="text-red-500/80">*</span>
                        </span>
                    </label>
                </div>
            </form>
        </div>
    );
}
