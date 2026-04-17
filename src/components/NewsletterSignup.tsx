import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../api';

type SignupState = 'idle' | 'loading' | 'success' | 'already' | 'error';

interface Props {
    compact?: boolean;
}

export default function NewsletterSignup({ compact = false }: Props) {
    const [email, setEmail]     = useState('');
    const [name, setName]       = useState('');
    const [state, setState]     = useState<SignupState>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setState('loading');
        try {
            const res = await api.newsletterSubscribe({ email, name: name || undefined });
            if (res.status === 'success') {
                setState('success');
                setMessage(res.message);
            } else if (res.status === 'already') {
                setState('already');
                setMessage(res.message);
            } else if (res.status === 'pending') {
                setState('success');
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

    if (compact) {
        return (
            <div>
                {state === 'error' && (
                    <div className="flex items-center gap-2 text-red-400 text-xs mb-2">
                        <AlertCircle size={14} />
                        <span>{message}</span>
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
                        disabled={state === 'loading'}
                        className="flex items-center gap-1.5 bg-dis-green text-black font-bold px-4 py-2 rounded-lg hover:bg-green-400 transition-colors text-sm shrink-0 disabled:opacity-60"
                    >
                        {state === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                        Iscriviti
                    </button>
                </form>
            </div>
        );
    }

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
                Puoi disisc riverti in qualsiasi momento.
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
                        disabled={state === 'loading'}
                        className="flex items-center gap-2 bg-dis-green text-black font-bold px-6 py-3 rounded-xl hover:bg-green-400 transition-colors text-sm shrink-0 disabled:opacity-60"
                    >
                        {state === 'loading'
                            ? <Loader2 size={16} className="animate-spin" />
                            : 'Iscriviti'
                        }
                    </button>
                </div>
            </form>
        </div>
    );
}
