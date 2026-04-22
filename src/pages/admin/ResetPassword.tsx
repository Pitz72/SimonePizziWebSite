import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Lock, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { api } from '../../api';

export default function ResetPassword() {
    const { token } = useParams<{ token: string }>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);


    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('La password deve essere di almeno 8 caratteri.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Le password non coincidono.');
            return;
        }

        setLoading(true);

        try {
            await api.resetPassword({ token, password });
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Token non valido o scaduto. Richiedi un nuovo link.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-dis-green/10 via-transparent to-transparent opacity-50 pointer-events-none" />
                
                <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl relative z-10 text-center">
                    <div className="w-16 h-16 bg-dis-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="text-dis-green w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-4">Password Aggiornata!</h1>
                    <p className="text-zinc-400 mb-8 leading-relaxed">
                        La tua password è stata modificata con successo. Ora puoi accedere al pannello di amministrazione.
                    </p>
                    <Link 
                        to="/admin/login" 
                        className="w-full inline-block bg-dis-green text-zinc-950 font-bold py-3 px-4 rounded-lg hover:bg-green-400 transition-all text-center"
                    >
                        Vai al Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-dis-green/10 via-transparent to-transparent opacity-50 pointer-events-none" />

            <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Nuova Password</h1>
                    <p className="text-zinc-400">Inserisci la tua nuova chiave di accesso</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleReset} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Nuova Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-3 pl-10 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-dis-green/50 transition-all"

                                placeholder="Minimo 8 caratteri"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Conferma Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-dis-green/50 transition-all"
                                placeholder="Ripeti password..."
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-dis-green text-zinc-950 font-bold py-3 px-4 rounded-lg hover:bg-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Aggiornamento in corso...' : 'Salva Nuova Password'}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-zinc-800 pt-6">
                    <Link to="/admin/recovery" className="text-sm text-zinc-500 hover:text-dis-green transition-colors flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Indietro
                    </Link>
                </div>
            </div>
        </div>
    );
}
