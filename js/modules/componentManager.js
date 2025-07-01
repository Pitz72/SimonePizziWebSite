/**
 * ===============================================
 * COMPONENT MANAGER - Sistema Componenti Centralizzati
 * ===============================================
 * 
 * Gestisce il caricamento dinamico di header e footer
 * su tutte le pagine del sito attraverso fetch API.
 * 
 * Funzionalità:
 * - Calcolo automatico basePath relativi
 * - Caricamento componenti da /components/
 * - Gestione fallback in caso di errori
 * - Navigazione attiva automatica
 */

export class ComponentManager {
    constructor() {
        this.basePath = this.calculateBasePath();
        this.currentPage = this.getCurrentPage();
        
        console.log(`[ComponentManager] Constructor Initialized. BasePath: "${this.basePath}", CurrentPage: "${this.currentPage}"`);
    }

    /**
     * Calcola il percorso relativo corretto per raggiungere la root del sito.
     * @returns {string} Il basePath corretto (es: './', '../', '../../').
     */
    calculateBasePath() {
        const path = window.location.pathname;
        const depth = (path.match(/\//g) || []).length - 1;

        let calculatedPath;
        if (depth <= 0) {
            calculatedPath = './';
        } else {
            calculatedPath = '../'.repeat(depth);
        }

        console.log(`[ComponentManager/calculateBasePath] Path: ${path}, Depth: ${depth}, Returning: "${calculatedPath}"`);
        
        return calculatedPath;
    }

    /**
     * Identifica la pagina corrente per l'highlighting della navigazione.
     * @returns {string} - Il nome della pagina corrente (es. 'home', 'chi-sono').
     */
    getCurrentPage() {
        const path = window.location.pathname;

        // Gestione robusta della homepage
        if (path === '/' || path.endsWith('/index.html')) {
            return 'home';
        }
        
        const pageName = path.split('/').filter(Boolean).pop().replace('.html', '');
        
        const mapping = {
            'software': 'software',
            'videogiochi': 'videogiochi',
            'contatti': 'contatti',
            'libri': 'libri',
            'podcast': 'podcast',
            'chi-sono': 'chi-sono',
            'sviluppo': 'chi-sono', // Mappa pagine specifiche alla sezione genitore
            'il-respiro-trattenuto-del-mondo': 'videogiochi'
        };

        // Cerca una corrispondenza parziale per le sezioni
        for (const key in mapping) {
            if (path.includes(`/${key}`)) {
                // log per vedere la corrispondenza trovata
                console.log(`[getCurrentPage] Path "${path}" matched with key "/${key}" -> section "${mapping[key]}"`);
                return mapping[key];
            }
        }
        
        console.log(`[getCurrentPage] No specific match found for path "${path}", returning 'other'`);
        return 'other';
    }

    /**
     * Carica un componente specifico dal server con retry automatico
     * @param {string} componentName Nome del componente (es: 'header', 'footer')
     * @param {string} targetSelector Selettore CSS dove inserire il componente
     * @param {number} maxRetries Numero massimo di tentativi (default: 3)
     * @returns {boolean} True se il caricamento è riuscito
     */
    async loadComponent(componentName, targetSelector, maxRetries = 3) {
        let lastError = null;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Tentativo ${attempt}/${maxRetries} per ${componentName}...`);
                
                const timeout = 1000 + (attempt * 1000);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);
                
                const response = await fetch(`${this.basePath}components/${componentName}.html`, {
                    signal: controller.signal,
                    cache: 'no-cache'
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const html = await response.text();
                const targetElement = document.querySelector(targetSelector);
                
                if (!targetElement) throw new Error(`Target element ${targetSelector} not found`);
            
                targetElement.innerHTML = html;
                
                targetElement.classList.add('loaded');
                targetElement.classList.remove('skeleton-placeholder');

                console.log(`✅ HTML per ${componentName} inserito e classe 'loaded' applicata a ${targetSelector}`);
                return true;
                
            } catch (error) {
                lastError = error;
                console.warn(`❌ Tentativo ${attempt}/${maxRetries} fallito per ${componentName}:`, error.message);
                
                if (attempt < maxRetries) {
                    const waitTime = attempt * 500;
                    console.log(`⏳ Attendo ${waitTime}ms prima del prossimo tentativo...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
        }
        
        console.error(`🚨 Tutti i ${maxRetries} tentativi falliti per ${componentName}:`, lastError);
        if (this.fallbackEnabled) {
            console.warn(`Componente non trovato, fallback disabilitato per ${componentName}`);
        }
        return false;
    }

    /**
     * Aggiorna i path relativi nei link del componente caricato
     * @param {HTMLElement} container Elemento container del componente
     */
    updatePaths(container) {
        const links = container.querySelectorAll('a[href*="BASEPATH_REPLACE"]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            const newHref = href.replace('BASEPATH_REPLACE', this.basePath);
            link.setAttribute('href', newHref);
        });

        const absoluteLinks = container.querySelectorAll('a[href^="/"]');
        absoluteLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href.startsWith('/')) {
                link.setAttribute('href', `${this.basePath}${href.substring(1)}`);
            }
        });
    }

    /**
     * Imposta la classe 'active' sul link di navigazione corrispondente alla pagina corrente
     */
    setActiveNavigation() {
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => link.classList.remove('active'));

        const activeSelector = {
            'home': '#nav-home',
            'software': '#nav-software', 
            'videogiochi': '#nav-videogiochi',
            'contatti': '#nav-contatti',
            'libri': '#nav-libri',
            'podcast': '#nav-podcast',
            'chi-sono': '#nav-chi-sono'
        };

        const targetLink = document.querySelector(activeSelector[this.currentPage]);
        if (targetLink) {
            targetLink.classList.add('active');
        }
    }

    /**
     * Inizializza il sistema di componenti
     */
    async initialize() {
        console.log('ComponentManager: Initializing...');
        
        await this.loadComponent('header', '#header-placeholder');
        await this.loadComponent('footer', '#footer-placeholder');

        // Chiama le funzioni di aggiornamento DOPO che tutto è stato caricato.
        const headerContainer = document.querySelector('#header-placeholder');
        if(headerContainer) {
            this.updatePaths(headerContainer);
            this.setActiveNavigation();
        }
        
        const footerContainer = document.querySelector('#footer-placeholder');
        if(footerContainer) {
            this.updatePaths(footerContainer); // Se anche il footer ha link da aggiornare
        }
    }

    /**
     * Crea header di fallback
     */
    createFallbackHeader() {
        const headerPlaceholder = document.querySelector('#header-placeholder');
        if (!headerPlaceholder) return;

        const fallbackHTML = `
            <header class="main-header fallback-header">
                <div class="container">
                    <div class="logo-container">
                        <a href="${this.basePath}index.html" class="logo-link">
                            <span class="logo-text">Simone Pizzi</span>
                        </a>
                        <span class="logo-tagline">Sviluppo & Creatività</span>
                    </div>
                    <nav class="nav-menu">
                        <a id="nav-home" href="${this.basePath}index.html">Home</a>
                        <a id="nav-chi-sono" href="${this.basePath}pages/chi-sono/index.html">Chi Sono</a>
                        <a id="nav-software" href="${this.basePath}pages/software/index.html">Software</a>
                        <a id="nav-videogiochi" href="${this.basePath}pages/videogiochi/index.html">Videogiochi</a>
                        <a id="nav-contatti" href="${this.basePath}pages/contatti.html">Contatti</a>
                    </nav>
                </div>
            </header>
        `;
        headerPlaceholder.innerHTML = fallbackHTML;
        this.setActiveNavigation();
    }

    /**
     * Crea footer di fallback
     */
    createFallbackFooter() {
        const footerPlaceholder = document.querySelector('#footer-placeholder');
        if (!footerPlaceholder) return;

        const fallbackHTML = `
            <footer class="main-footer fallback-footer">
                <div class="container">
                    <div class="footer-content">
                        <p>&copy; 2025 Simone Pizzi - Tutti i diritti riservati.</p>
                        <p>Sito sviluppato con il supporto di LLM. <a href="${this.basePath}pages/chi-sono/articoli/sviluppo-con-llm.html" class="footer-link">Scopri di più</a>.</p>
                    </div>
                </div>
            </footer>
        `;
        footerPlaceholder.innerHTML = fallbackHTML;
    }
} 