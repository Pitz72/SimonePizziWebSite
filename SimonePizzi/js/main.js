/**
 * ===============================================
 * MAIN.JS - Orchestratore Modulare
 * ===============================================
 * 
 * Sistema centralizzato che importa e coordina tutti i moduli JavaScript:
 * - ComponentManager: Gestione header/footer dinamici
 * - FormHandler: Gestione form di contatto
 * - UIAnimations: Animazioni e interazioni UI
 * 
 * Inizializza le funzionalità in base alla pagina corrente.
 */

import { ComponentManager } from './modules/componentManager.js';
import { FormHandler, revealEmail } from './modules/formHandler.js';
import { UIAnimations, setUIAnimationsInstance, openStoryModal, closeStoryModal } from './modules/uiAnimations.js';

class SiteOrchestrator {
    constructor() {
        this.componentManager = null;
        this.formHandler = null;
        this.uiAnimations = null;
        this.isInitialized = false;
    }

    /**
     * Inizializza tutto il sito
     */
    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🚀 SiteOrchestrator: Inizializzazione modulare avviata...');

        try {
            // 1. Carica CSS specifico per la pagina (performance ottimizzate)
            this.loadPageSpecificCSS();
            
            // 2. Inizializza i moduli in parallelo
            await this.initializeModules();
            
            // 3. Configura le funzioni globali
            this.setupGlobalFunctions();
            
            this.isInitialized = true;
            console.log('✅ SiteOrchestrator: Tutti i moduli inizializzati con successo');
            
        } catch (error) {
            console.error('❌ SiteOrchestrator: Errore durante l\'inizializzazione:', error);
        }
    }

    /**
     * Inizializza tutti i moduli del sito
     */
    async initializeModules() {
        // 1. ComponentManager - SEMPRE necessario per header/footer
        console.log('📦 Inizializzazione ComponentManager...');
        this.componentManager = new ComponentManager();
        await this.componentManager.initialize();

        // 2. UIAnimations - SEMPRE necessario per interazioni base
        console.log('🎨 Inizializzazione UIAnimations...');
        this.uiAnimations = new UIAnimations();
        this.uiAnimations.initialize();
        
        // Configura l'istanza globale per le funzioni onclick
        setUIAnimationsInstance(this.uiAnimations);

        // 3. FormHandler - Solo se esiste un form di contatto
        console.log('📝 Controllo presenza form di contatto...');
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            console.log('📝 Inizializzazione FormHandler...');
            this.formHandler = new FormHandler();
            this.formHandler.initialize();
        } else {
            console.log('📝 Form di contatto non presente - FormHandler saltato');
        }
    }

    /**
     * Configura le funzioni globali necessarie per onclick HTML
     */
    setupGlobalFunctions() {
        // Rendi disponibili le funzioni globali
        window.revealEmail = revealEmail;
        window.openStoryModal = openStoryModal;
        window.closeStoryModal = closeStoryModal;
        
        console.log('🌐 Funzioni globali configurate');
    }

    /**
     * Carica il CSS specifico per la pagina corrente in modo condizionale
     * Migliora le performance evitando il caricamento di CSS non necessario
     */
    loadPageSpecificCSS() {
        const bodyId = document.body.id;
        console.log(`🎨 Controllo CSS specifico per: ${bodyId || 'nessun ID'}`);
        
        // Mappa ID pagina → percorso CSS (solo CSS esistenti)
        const cssMapping = {
            'page-home': 'css/pages/home.css',
            'page-contatti': 'css/pages/contatti.css',
            'page-videogiochi': 'css/pages/videogiochi.css'
            // Altre pagine utilizzano solo base.css + components.css
        };

        const cssPath = cssMapping[bodyId];
        
        if (cssPath) {
            // Calcola il basePath relativo (stesso algoritmo del ComponentManager)
            const basePath = this.calculateBasePath();
            const fullCssPath = basePath + cssPath;
            
            // Verifica se il CSS non è già stato caricato
            const existingLink = document.querySelector(`link[href*="${cssPath}"]`);
            if (existingLink) {
                console.log(`🎨 CSS ${cssPath} già caricato, skip`);
                return;
            }
            
            // Crea dinamicamente il tag <link>
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = fullCssPath;
            link.onload = () => console.log(`✅ CSS caricato: ${cssPath}`);
            link.onerror = () => console.warn(`❌ Errore caricamento CSS: ${cssPath}`);
            
            // Aggiunge alla <head>
            document.head.appendChild(link);
            console.log(`🎨 Caricamento CSS condizionale: ${fullCssPath}`);
        } else {
            console.log('🎨 Nessun CSS specifico per questa pagina');
        }
    }

    /**
     * Calcola il basePath relativo per risorse (stesso algoritmo del ComponentManager)
     * @returns {string} Il basePath corretto
     */
    calculateBasePath() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(p => p && p !== 'index.html');
        
        if (segments.length <= 1) {
            return './';
        }
        
        const depth = segments.length;
        return '../'.repeat(depth);
    }

    /**
     * Determina la pagina corrente
     * @returns {string} Nome della pagina/sezione
     */
    getCurrentPageType() {
        const path = window.location.pathname.toLowerCase();
        
        if (path.includes('/contatti')) return 'contatti';
        if (path.includes('/chi-sono/')) return 'blog';
        if (path.includes('/software/')) return 'software';
        if (path.includes('/videogiochi/')) return 'videogiochi';
        if (path.includes('/libri/')) return 'libri';
        if (path.includes('/podcast/')) return 'podcast';
        if (path === '/' || path.includes('index.html')) return 'home';
        
        return 'other';
    }

    /**
     * Esegue azioni specifiche per tipo di pagina
     */
    executePageSpecificLogic() {
        const pageType = this.getCurrentPageType();
        console.log(`📄 Pagina riconosciuta: ${pageType}`);

        switch (pageType) {
            case 'contatti':
                console.log('📞 Logica specifica per pagina Contatti caricata');
                break;
            
            case 'blog':
                console.log('✍️ Logica specifica per pagina Blog caricata (accordion disponibili)');
                break;
            
            case 'home':
                console.log('🏠 Logica specifica per Homepage caricata (scroll reveal, hero effects)');
                break;
            
            case 'software':
                console.log('💻 Logica specifica per sezione Software caricata');
                break;
            
            case 'videogiochi':
                console.log('🎮 Logica specifica per sezione Videogiochi caricata');
                break;
            
            default:
                console.log('📋 Logica generica caricata');
        }
    }

    /**
     * Getter per accedere ai moduli dall'esterno (debugging)
     */
    getModules() {
        return {
            componentManager: this.componentManager,
            formHandler: this.formHandler,
            uiAnimations: this.uiAnimations
        };
    }
}

// ===============================================
// INIZIALIZZAZIONE AUTOMATICA
// ===============================================

let siteOrchestrator = null;

/**
 * Funzione di inizializzazione principale
 */
async function initializeSite() {
    siteOrchestrator = new SiteOrchestrator();
    await siteOrchestrator.initialize();
    siteOrchestrator.executePageSpecificLogic();
    
    // Rendi disponibile per debugging in console
    window.siteOrchestrator = siteOrchestrator;
}

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSite);
} else {
    // DOM già caricato
    initializeSite();
}

// ===============================================
// LEGACY SUPPORT & DEBUGGING
// ===============================================

// Esporta l'orchestrator per testing/debugging
export { SiteOrchestrator };

// Log di caricamento modulo
console.log('📚 Main.js modulare caricato - Sistema pronto per l\'inizializzazione');