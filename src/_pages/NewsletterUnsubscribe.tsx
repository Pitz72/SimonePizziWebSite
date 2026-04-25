import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '../api';

type State = 'loading' | 'success' | 'error';

export default function NewsletterUnsubscribe() {
    const [params]          = useSearchParams();
    const [state, setState] = useState<State>('loading');

    useEffect(() => {
        const token = params.get('token') ?? '';
        if (!token) { setState('error'); return; }

        api.newsletterUnsubscribe(token).then(res => {
            setState(res.status === 'success' ? 'success' : 'error');
        }).catch(() => setState('error'));
    }, [params]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {state === 'loading' && (
                    <>
                        <Loader2 size={48} className="text-zinc-400 mx-auto mb-4 animate-spin" />
                        <p className="text-zinc-400">Elaborazione…</p>
                    </>
                )}
                {state === 'success' && (
                    <>
                        <CheckCircle size={56} className="text-zinc-500 mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-white mb-3">Disiscrizione effettuata</h1>
                        <p className="text-zinc-400 mb-8">
                            Ci dispiace vederti andare. Non riceverai più email dalla newsletter di Simone Pizzi.<br />
                            Puoi reiscriverti in qualsiasi momento dal sito.
                        </p>
                        <Link to="/" className="inline-flex items-center gap-2 bg-zinc-800 text-white font-bold px-6 py-3 rounded-xl hover:bg-zinc-700 transition-colors">
                            Torna alla home
                        </Link>
                    </>
                )}
                {state === 'error' && (
                    <>
                        <XCircle size={56} className="text-red-500 mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-white mb-3">Link non valido</h1>
                        <p className="text-zinc-400 mb-8">
                            Il link di disiscrizione non è valido o è già stato utilizzato.
                        </p>
                        <Link to="/" className="inline-flex items-center gap-2 bg-zinc-800 text-white font-bold px-6 py-3 rounded-xl hover:bg-zinc-700 transition-colors">
                            Torna alla home
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
