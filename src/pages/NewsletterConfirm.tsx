import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '../api';

type State = 'loading' | 'success' | 'already' | 'error';

export default function NewsletterConfirm() {
    const [params]          = useSearchParams();
    const [state, setState] = useState<State>('loading');

    useEffect(() => {
        const token = params.get('token') ?? '';
        if (!token) { setState('error'); return; }

        api.newsletterConfirm(token).then(res => {
            if (res.status === 'success')  setState('success');
            else if (res.status === 'already') setState('already');
            else setState('error');
        }).catch(() => setState('error'));
    }, [params]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {state === 'loading' && (
                    <>
                        <Loader2 size={48} className="text-dis-green mx-auto mb-4 animate-spin" />
                        <p className="text-zinc-400">Conferma in corso…</p>
                    </>
                )}
                {(state === 'success' || state === 'already') && (
                    <>
                        <CheckCircle size={56} className="text-dis-green mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-white mb-3">Iscrizione confermata!</h1>
                        <p className="text-zinc-400 mb-8">
                            {state === 'success'
                                ? 'Benvenuto nella newsletter di Simone Pizzi. Ti avviserò quando pubblicherò qualcosa di nuovo.'
                                : 'La tua email era già confermata. Sei già in lista!'}
                        </p>
                        <Link to="/" className="inline-flex items-center gap-2 bg-dis-green text-black font-bold px-6 py-3 rounded-xl hover:bg-green-400 transition-colors">
                            Vai al sito
                        </Link>
                    </>
                )}
                {state === 'error' && (
                    <>
                        <XCircle size={56} className="text-red-500 mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-white mb-3">Link non valido</h1>
                        <p className="text-zinc-400 mb-8">
                            Il link di conferma è scaduto o non è valido. Prova a iscriverti di nuovo.
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
