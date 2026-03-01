import React, { useState } from 'react';
import { api } from '../../api';
import { KeyRound, ShieldAlert } from 'lucide-react';

export default function Settings() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Le nuove password non combaciano.' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'La password deve contenere almeno 6 caratteri.' });
            return;
        }

        setLoading(true);
        try {
            const res = await api.changePassword({ current_password: currentPassword, new_password: newPassword });
            setMessage({ type: 'success', text: res.message });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Errore durante l\'aggiornamento.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <KeyRound className="text-dis-green" size={28} />
                    Impostazioni Sicurezza
                </h1>
                <p className="text-zinc-400 mt-2">Gestisci le credenziali di accesso al pannello di amministrazione.</p>
            </header>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <ShieldAlert className="text-orange-400 shrink-0 mt-1" size={24} />
                    <div>
                        <h3 className="text-orange-400 font-bold mb-1">Avviso di Sicurezza</h3>
                        <p className="text-zinc-300 text-sm leading-relaxed">
                            Se stai ancora utilizzando la password predefinita (<code className="bg-zinc-800 px-1 rounded text-white">admin2026</code>),
                            è strettamente consigliato aggiornarla per proteggere la sezione editoriale del sito.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
                    {message.text && (
                        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-dis-green/10 text-dis-green border border-dis-green/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Password Attuale</label>
                        <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-dis-green transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Nuova Password</label>
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-dis-green transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Conferma Nuova Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-dis-green transition-colors"
                        />
                    </div>

                    <div className="pt-4 border-t border-zinc-800">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-dis-green text-black font-bold px-6 py-2.5 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Aggiornamento...' : 'Aggiorna Credenziali'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
