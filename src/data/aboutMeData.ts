export interface AboutSection {
    title?: string;
    paragraphs: string[];
}

export const aboutMeData: { title: string; sections: AboutSection[] } = {
    title: "Ciao, sono Simone!",
    sections: [
        {
            paragraphs: [
                "Ciao e benvenuto in questo angolo speciale del web, dove condivido con te un caleidoscopio di passioni, progetti e sogni che prendono forma attraverso le parole e la tecnologia. Qui troverai il racconto sincero delle mie tantissime idee e dei miei pochissimi talenti – una confessione ironica che nasconde in realtà un mondo ricco di sperimentazioni e curiosità intellettuali."
            ]
        },
        {
            title: "Il Podcasting: La Mia Prima Grande Passione",
            paragraphs: [
                "Dal 2010, il podcasting è stata la mia prima finestra sul mondo della comunicazione digitale. Con Runtime Radio e Italian Podcast Network, ho avuto il privilegio di esplorare le infinite possibilità dell'audio narrativo, creando contenuti che spaziano dalla tecnologia alla cultura, dalle interviste alle riflessioni personali."
            ]
        },
        {
            title: "La Scrittura: Quando le Parole Diventano Mondi",
            paragraphs: [
                "La narrativa è sempre stata il mio rifugio creativo. Attraverso racconti e romanzi, esploro temi che mi affascinano: la tecnologia, l'umanità, i rapporti interpersonali e le infinite possibilità del futuro. Ogni storia che scrivo è un esperimento, un tentativo di catturare qualcosa di autentico e significativo."
            ]
        },
        {
            title: "Lo Sviluppo Software: Dove Creatività e Logica si Incontrano",
            paragraphs: [
                "Il mondo del software development mi ha conquistato per la sua capacità di trasformare idee astratte in strumenti concreti e utili. Dalle utility per la gestione audio ai videogiochi narrativi, ogni progetto rappresenta una sfida tecnica e creativa che mi spinge a crescere e imparare continuamente."
            ]
        },
        {
            title: "L'Intelligenza Artificiale: Il Mio Nuovo Compagno di Viaggio",
            paragraphs: [
                "Negli ultimi anni, l'AI è diventata non solo un oggetto di studio, ma un vero e proprio collaboratore creativo. Attraverso progetti come The Safe Place, sto esplorando come l'intelligenza artificiale possa diventare un partner nella creazione di contenuti, aprendo nuove frontiere nella narrativa interattiva e nello sviluppo software."
            ]
        },
        {
            title: "La Filosofia del \"Fare Sperimentando\"",
            paragraphs: [
                "Quello che guida ogni mio progetto è una filosofia semplice ma potente: imparare facendo. Non aspetto di avere tutte le competenze necessarie prima di iniziare; piuttosto, mi lancio nei progetti con curiosità e determinazione, lasciando che sia il processo stesso a insegnarmi quello che devo sapere.",
                "Questo sito è più di un portfolio: è un diario di bordo delle mie esplorazioni creative e tecnologiche. Qui condivido non solo i risultati finiti, ma anche i processi, gli errori, le scoperte e le riflessioni che accompagnano ogni progetto.",
                "Ti invito a esplorare le diverse sezioni, a leggere i miei articoli, a provare i software che sviluppo e a giocare ai miei esperimenti videoludici. E se qualcosa ti incuriosisce o vorresti saperne di più, non esitare a contattarmi. Adoro le conversazioni che nascono dalla condivisione di passioni comuni!"
            ]
        }
    ]
};
