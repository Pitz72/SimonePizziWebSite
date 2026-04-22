import { useBlocker } from 'react-router-dom';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';

interface NavigationBlockerProps {
    isDirty: boolean;
}

export function NavigationBlocker({ isDirty }: NavigationBlockerProps) {
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            isDirty && currentLocation.pathname !== nextLocation.pathname
    );

    if (blocker.state === 'blocked') {
        return (
            <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden group">
                    {/* Sfondo decorativo Cyber-Soviet */}
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <AlertTriangle size={120} />
                    </div>
                    
                    <div className="flex flex-col items-center text-center gap-6 relative z-10">
                        <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)] animate-pulse">
                            <AlertTriangle size={40} />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Modifiche non salvate</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                Hai apportato delle modifiche che andranno perse se lasci questa pagina ora. Cosa desideri fare?
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
                            <button
                                onClick={() => blocker.reset?.()}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-all border border-zinc-700 group/btn"
                            >
                                <X size={18} className="group-hover:rotate-90 transition-transform" />
                                Rimani Qui
                            </button>
                            <button
                                onClick={() => blocker.proceed?.()}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-all shadow-lg shadow-red-900/20 group/btn"
                            >
                                Esci
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
