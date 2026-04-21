import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { KeyRound, ShieldAlert, Database, Download, Save, History } from 'lucide-react';

export default function Settings() {
    // Password states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    // Backup states
    const [backupAuto, setBackupAuto] = useState(false);
    const [backupFrequency, setBackupFrequency] = useState('weekly');
    const [lastRun, setLastRun] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await api.getAppSettings();
                setBackupAuto(settings.backup_auto === '1');
                setBackupFrequency(settings.backup_frequency || 'weekly');
                setLastRun(settings.backup_last_run || '');
            } catch (err) {
                console.error('Errore caricamento impostazioni:', err);
            }
        };
        fetchSettings();
    }, []);

    const handlePasswordSubmit = async (e: React.FormEvent) => {
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

    const handleSaveBackupSettings = async () => {
        setSaveLoading(true);
        try {
            await api.updateAppSettings({
                backup_auto: backupAuto ? '1' : '0',
                backup_frequency: backupFrequency
            });
            setMessage({ type: 'success', text: 'Impostazioni backup salvate!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Errore durante il salvataggio.' });
        } finally {
            setSaveLoading(false);
        }
    };

    const handleManualDownload = () => {
        api.downloadBackup();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <header>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <KeyRound className="text-dis-green" size={28} />
                    Impostazioni Sistema
                </h1>
                <p className="text-zinc-400 mt-2">Gestisci le credenziali e i sistemi di manutenzione del sito.</p>
            </header>

            {/* SEZIONE SICUREZZA */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                    <KeyRound size={20} className="text-dis-green" />
                    Cambio Password Admin
                </h2>

                <div className="flex items-start gap-4 mb-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <ShieldAlert className="text-orange-400 shrink-0 mt-1" size={24} />
                    <div>
                        <h3 className="text-orange-400 font-bold mb-1">Avviso di Sicurezza</h3>
                        <p className="text-zinc-300 text-sm leading-relaxed">
                            Se stai ancora utilizzando la password predefinita assegnata in fase di installazione,
                            è strettamente consigliato aggiornarla subito.
                        </p>
                    </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-xl">
                    {message.text && message.type !== 'success' && (
                        <div className="p-4 rounded-lg text-sm font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                            {message.text}
                        </div>
                    )}
                    {message.text && message.type === 'success' && (
                        <div className="p-4 rounded-lg text-sm font-medium bg-dis-green/10 text-dis-green border border-dis-green/20">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <label className="text-sm font-medium text-zinc-300">Conferma Nuova</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-dis-green transition-colors"
                            />
                        </div>
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

            {/* SEZIONE BACKUP */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                    <Database size={20} className="text-dis-green" />
                    Manutenzione Database (MySQL)
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Backup Manuale */}
                    <div className="space-y-4">
                        <h3 className="text-white font-medium flex items-center gap-2">
                            <Download size={18} className="text-zinc-400" />
                            Backup Manuale
                        </h3>
                        <p className="text-zinc-400 text-sm">
                            Genera e scarica immediatamente un file SQL contenente tutto lo schema e i dati del database.
                            Utile prima di modifiche strutturali o migrazioni.
                        </p>
                        <button
                            onClick={handleManualDownload}
                            className="flex items-center gap-2 bg-zinc-800 text-white font-medium px-5 py-3 rounded-lg hover:bg-zinc-700 transition-colors border border-zinc-700"
                        >
                            <Download size={18} />
                            Scarica SQL Ora
                        </button>
                    </div>

                    {/* Backup Automatico */}
                    <div className="space-y-4">
                        <h3 className="text-white font-medium flex items-center gap-2">
                            <History size={18} className="text-zinc-400" />
                            Backup Automatico
                        </h3>
                        <p className="text-zinc-400 text-sm">
                            Attiva il salvataggio periodico del database nella cartella di sistema.
                        </p>
                        
                        <div className="space-y-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-zinc-300">Stato Servizio</label>
                                <button
                                    onClick={() => setBackupAuto(!backupAuto)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${backupAuto ? 'bg-dis-green' : 'bg-zinc-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${backupAuto ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Frequenza</label>
                                <select
                                    disabled={!backupAuto}
                                    value={backupFrequency}
                                    onChange={(e) => setBackupFrequency(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-dis-green disabled:opacity-50"
                                >
                                    <option value="daily">Quotidiano</option>
                                    <option value="weekly">Settimanale</option>
                                    <option value="monthly">Mensile</option>
                                </select>
                            </div>

                            {lastRun && (
                                <div className="text-[11px] text-zinc-500 italic">
                                    Ultimo backup eseguito: {new Date(lastRun).toLocaleString('it-IT')}
                                </div>
                            )}

                            <button
                                onClick={handleSaveBackupSettings}
                                disabled={saveLoading}
                                className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-bold py-2 rounded-lg transition-all"
                            >
                                <Save size={16} />
                                {saveLoading ? 'Salvataggio...' : 'Salva Impostazioni'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
