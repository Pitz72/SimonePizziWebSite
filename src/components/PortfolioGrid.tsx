import React, { useState } from 'react';
import Hero from './Hero';
import Modal from './Modal'; // Import Modal component
import SEO from './SEO';
import { portfolioData } from '../data/portfolioData';
import { Category } from '../types';

import FeaturedCard from './FeaturedCard';

const HomePage: React.FC = () => {
    // Trova tutti gli elementi con isFeatured: true e li ordina per featuredOrder
    const featuredItems = Object.values(Category)
        .flatMap(category => {
            return (portfolioData[category] || [])
                .filter(item => item.isFeatured)
                .map(item => ({ item, category }));
        })
        .sort((a, b) => {
            const orderA = a.item.featuredOrder ?? 999;
            const orderB = b.item.featuredOrder ?? 999;
            return orderA - orderB;
        })
        .slice(0, 6); // Limita a 6 elementi

    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    return (
        <div>
            <SEO title="Home" />
            <Hero onOpenModal={toggleModal} /> {/* Pass toggleModal to Hero */}
            <section className="container mx-auto py-16 sm:py-24">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white">Ultimi Aggiornamenti</h2>
                    <p className="text-lg text-gray-400 mt-2">Le modifiche o le pubblicazioni più recenti dei miei progetti.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredItems.map(({ item, category }) => (
                        <FeaturedCard key={item.id} item={item} category={category} />
                    ))}
                </div>
            </section>

            <section className="container mx-auto py-16 sm:py-24 text-center">
                <h2 className="text-4xl font-bold text-white mb-4">Contattami</h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
                    Hai un'idea brillante, un progetto in mente o semplicemente vuoi scambiare due chiacchiere sui miei lavori? Sono sempre aperto a nuove collaborazioni, feedback costruttivi e proposte innovative. Non esitare a contattarmi!
                </p>
                <div className="flex justify-center space-x-4">
                    <a
                        href="https://github.com/Pitz72"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-green-500 text-black font-bold text-lg px-8 py-4 rounded-lg hover:bg-green-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/40 ring-1 ring-green-400/50 hover:ring-white/50"
                    >
                        IL MIO GITHUB
                    </a>
                    <a
                        href="mailto:pizzisimone1972@gmail.com"
                        className="inline-block bg-gray-800/80 backdrop-blur-md text-white font-bold text-lg px-8 py-4 rounded-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-900/20 ring-1 ring-white/10 hover:ring-green-500/50"
                    >
                        INVIAMI UNA MAIL
                    </a>
                </div>
            </section>

            {/* Render Modal component */}
            <Modal isOpen={isModalOpen} onClose={toggleModal} title="Ciao, sono Simone!">
                <p>Ciao e benvenuto in questo angolo speciale del web, dove condivido con te un caleidoscopio di passioni, progetti e sogni che prendono forma attraverso le parole e la tecnologia. Qui troverai il racconto sincero delle mie tantissime idee e dei miei pochissimi talenti – una confessione ironica che nasconde in realtà un mondo ricco di sperimentazioni e curiosità intellettuali.</p>
                <h3>Il Podcasting: La Mia Prima Grande Passione</h3>
                <p>Dal 2010, il podcasting è stata la mia prima finestra sul mondo della comunicazione digitale. Con Runtime Radio e Italian Podcast Network, ho avuto il privilegio di esplorare le infinite possibilità dell'audio narrativo, creando contenuti che spaziano dalla tecnologia alla cultura, dalle interviste alle riflessioni personali.</p>
                <h3>La Scrittura: Quando le Parole Diventano Mondi</h3>
                <p>La narrativa è sempre stata il mio rifugio creativo. Attraverso racconti e romanzi, esploro temi che mi affascinano: la tecnologia, l'umanità, i rapporti interpersonali e le infinite possibilità del futuro. Ogni storia che scrivo è un esperimento, un tentativo di catturare qualcosa di autentico e significativo.</p>
                <h3>Lo Sviluppo Software: Dove Creatività e Logica si Incontrano</h3>
                <p>Il mondo del software development mi ha conquistato per la sua capacità di trasformare idee astratte in strumenti concreti e utili. Dalle utility per la gestione audio ai videogiochi narrativi, ogni progetto rappresenta una sfida tecnica e creativa che mi spinge a crescere e imparare continuamente.</p>
                <h3>L'Intelligenza Artificiale: Il Mio Nuovo Compagno di Viaggio</h3>
                <p>Negli ultimi anni, l'AI è diventata non solo un oggetto di studio, ma un vero e proprio collaboratore creativo. Attraverso progetti come The Safe Place, sto esplorando come l'intelligenza artificiale possa diventare un partner nella creazione di contenuti, aprendo nuove frontiere nella narrativa interattiva e nello sviluppo software.</p>
                <h3>La Filosofia del "Fare Sperimentando"</h3>
                <p>Quello che guida ogni mio progetto è una filosofia semplice ma potente: imparare facendo. Non aspetto di avere tutte le competenze necessarie prima di iniziare; piuttosto, mi lancio nei progetti con curiosità e determinazione, lasciando che sia il processo stesso a insegnarmi quello che devo sapere.</p>
                <p>Questo sito è più di un portfolio: è un diario di bordo delle mie esplorazioni creative e tecnologiche. Qui condivido non solo i risultati finiti, ma anche i processi, gli errori, le scoperte e le riflessioni che accompagnano ogni progetto.</p>
                <p>Ti invito a esplorare le diverse sezioni, a leggere i miei articoli, a provare i software che sviluppo e a giocare ai miei esperimenti videoludici. E se qualcosa ti incuriosisce o vorresti saperne di più, non esitare a contattarmi. Adoro le conversazioni che nascono dalla condivisione di passioni comuni!</p>
            </Modal>
        </div>
    );
};

export default HomePage;
