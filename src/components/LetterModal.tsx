import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface LetterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LetterModal: React.FC<LetterModalProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-gray-900 border border-green-500/30 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl shadow-green-900/20 custom-scrollbar"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                        >
                            <X size={24} />
                        </button>

                        <div className="p-8 sm:p-12 font-serif leading-relaxed text-gray-300">
                            <h2 className="text-3xl sm:text-4xl font-bold text-green-400 mb-2 font-sans tracking-tight">
                                Lettera Aperta alla Community
                            </h2>
                            <h3 className="text-xl text-green-400/60 mb-8 italic font-sans">
                                Il Silenzio è Finito
                            </h3>

                            <div className="space-y-6 text-lg">
                                <p className="font-bold text-white">
                                    Amici, sostenitori, compagni di viaggio,
                                </p>
                                <p>
                                    Quando ho iniziato questo percorso, mesi fa, avevo in tasca solo un'idea e tanta incoscienza. Non ero un programmatore, non ero un esperto di intelligenza artificiale. Ero solo qualcuno con una storia da raccontare e la voglia testarda di provare a farlo in un modo nuovo.
                                </p>
                                <p>
                                    Se qualcuno mi avesse detto allora che sarei arrivato qui, oggi, a scrivere queste righe con una versione "Golden Master" tra le mani, probabilmente avrei sorriso incredulo. Ho sempre mostrato sicurezza, è vero, fa parte del gioco. Ma la verità è che la strada è stata molto più ripida e accidentata di quanto immaginassi.
                                </p>
                                <p>
                                    Oggi, però, posso dirlo: <strong className="text-white">ce l'abbiamo fatta.</strong>
                                </p>
                                <p>
                                    "The Safe Place Chronicles" è finito. È completo. È vivo.
                                </p>
                                <p>
                                    È un traguardo che va oltre il codice. È il compimento di una sfida sperimentale non solo tecnica, ma profondamente umana. È la vittoria della caparbietà, del rifiuto di mollare quando i bug sembravano insormontabili e la logica sembrava crollare.
                                </p>
                                <p>
                                    Siamo arrivati al traguardo a pezzi e bocconi, non lo nascondo. Il codice su cui poggia questo mondo è al limite estremo della sua capacità. Abbiamo spinto l'architettura iniziale fino al punto di rottura. Ogni nuova quest, ogni nuovo dialogo è diventato un peso che le fondamenta faticano a reggere. Un esperto direbbe che servirebbe un "refactoring" totale, riscrivere tutto da zero per portarlo a un livello superiore.
                                </p>
                                <p>
                                    Ma la verità è che farlo adesso sarebbe una follia. Sarebbe come voler cambiare le fondamenta di una casa mentre ci si abita dentro.
                                </p>
                                <p>
                                    Sono costretto a fermarmi. E lo dico con serenità: non è un'imposizione, è una scelta consapevole. Fermarsi ora significa proteggere ciò che abbiamo costruito, evitare che la casa crolli sotto il peso della nostra stessa ambizione.
                                </p>
                                <p>
                                    E sono immensamente soddisfatto. Nelle ultime, frenetiche ore di sviluppo abbiamo fatto un lavoro incredibile. Abbiamo smontato e ricostruito il sistema di crafting per renderlo finalmente giusto e gratificante. Abbiamo dato la caccia a bug invisibili che bloccavano le storie più belle. E, con un ultimo sforzo di pignoleria che forse solo voi potete capire, abbiamo aggiornato tutti i test tecnici fino a vedere quella sfilza di "semafori verdi" che certifica la stabilità del sistema.
                                </p>
                                <p>
                                    Forse ci sono ancora dei bug nascosti negli angoli più remoti della mappa. Forse qualche testo è ancora imperfetto. Ma questo è il massimo che è possibile fare oggi.
                                </p>
                                <p>
                                    Vi consegno quest'opera con il cuore in mano. È costata un tempo infinito, notti insonni, fatica vera e anche risorse economiche, mie e vostre.
                                </p>
                                <p>
                                    "The Safe Place Chronicles" è un gioco grezzo, forse rozzo per gli standard moderni. Ma è nostro. Ed è la prova vivente che uno che un anno fa poteva solo sognare di creare un videogioco, oggi può farlo davvero.
                                </p>
                                <p>
                                    Questo progetto mi ha insegnato tutto quello che mi servirà per i prossimi. Ma TSPC, con i suoi pixel verdi e il suo silenzio, per me è, e resterà sempre, bellissimo.
                                </p>
                                <p className="font-bold text-white mt-8">
                                    Grazie. Grazie di averci creduto con me.
                                </p>
                                <p className="text-right text-green-400 font-sans font-bold mt-8 text-xl">
                                    Simone Pizzi
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LetterModal;
