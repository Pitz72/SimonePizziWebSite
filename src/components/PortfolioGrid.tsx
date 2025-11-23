import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from './Hero';
import Modal from './Modal'; // Import Modal component
import SEO from './SEO';
import { portfolioData } from '../data/portfolioData';
import { Category, PortfolioItem } from '../types';
import { motion } from 'framer-motion';

const FeaturedCard: React.FC<{ item: PortfolioItem, category: Category }> = ({ item, category }) => (
    <Link to={`/${category}`}>
        <motion.div
            whileHover={{
                scale: 1.02,
                rotateX: 5,
                rotateY: 5,
                transition: { duration: 0.3 }
            }}
            className="block bg-white/5 border border-white/10 rounded-xl p-6 group backdrop-blur-sm hover:bg-white/10 hover:border-green-400/30 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300"
            style={{ transformStyle: 'preserve-3d' }}
        >
            <div className="h-40 mb-6 rounded-lg overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <h3 className="font-bold text-xl text-white mb-2 group-hover:text-green-400 transition-colors">{item.title}</h3>
            <p className="text-gray-400 text-sm line-clamp-3 mb-4">{item.summary}</p>
            <span className="font-semibold text-green-400 text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                Scopri di più &rarr;
            </span>
        </motion.div>
    </Link>
);

const HomePage: React.FC = () => {
    const featuredVideogiochi = portfolioData[Category.VIDEOGIOCHI]?.[0];
    const featuredSoftware = portfolioData[Category.PROGETTI_SOFTWARE]?.[0];
    // Trova "IL RELITTO SILENTE" nella categoria VIDEOGIOCHI
    const featuredRelittoSilente = portfolioData[Category.VIDEOGIOCHI]?.find(item => item.id === 2);

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
                    {featuredVideogiochi && <FeaturedCard item={featuredVideogiochi} category={Category.VIDEOGIOCHI} />}
                    {featuredSoftware && <FeaturedCard item={featuredSoftware} category={Category.PROGETTI_SOFTWARE} />}
                    {featuredRelittoSilente && <FeaturedCard item={featuredRelittoSilente} category={Category.VIDEOGIOCHI} />} {/* Usa la categoria VIDEOGIOCHI per il link */}
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
                        className="inline-block bg-green-500 text-black font-bold text-lg px-8 py-4 rounded-lg hover:bg-green-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30"
                    >
                        IL MIO GITHUB
                    </a>
                    <a
                        href="mailto:pizzisimone1972@gmail.com"
                        className="inline-block bg-gray-700 text-white font-bold text-lg px-8 py-4 rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-gray-700/30"
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
