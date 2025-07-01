/**
 * ===============================================
 * UI ANIMATIONS - Animazioni e Interazioni UI
 * ===============================================
 * 
 * Gestisce tutte le animazioni e interazioni dell'interfaccia utente:
 * - Accordion (specifici per pagine blog)
 * - Hamburger menu
 * - Scroll effects
 * - Modal management
 * - Hover effects
 * - Smooth scrolling
 */

export class UIAnimations {
    constructor() {
        this.isInitialized = false;
    }

    /**
     * Inizializza tutte le animazioni e interazioni UI
     */
    initialize() {
        if (this.isInitialized) return;
        
        console.log('UIAnimations: Initializing...');
        
        this.setupAccordions();
        this.setupHamburgerMenu();
        this.setupHeaderScrollEffect();
        this.setupYearUpdate();
        this.setupDisabledLinks();
        this.setupScrollReveal();
        this.setupSmoothScrolling();
        this.setupImageHoverEffects();
        this.setupModalHandlers();
        
        this.isInitialized = true;
        console.log('UIAnimations: Initialized successfully');
    }

    /**
     * Configura gli accordion specifici per le pagine blog
     */
    setupAccordions() {
        // Accordion 1 (Introduction - specifico per sono-simone.html)
        const introAccordionButton = document.querySelector('.blog-intro .accordion-intro-estendi');
        const introCollapsibleContent = document.querySelector('.blog-intro .collapsible-intro');
        const introReduceButton = document.querySelector('.blog-intro .accordion-intro-riduci');

        if (introAccordionButton && introCollapsibleContent && introReduceButton) {
            const openIntroAccordion = () => {
                introAccordionButton.style.display = 'none';
                introReduceButton.style.display = 'block';
                introCollapsibleContent.classList.add('open');
                introCollapsibleContent.style.maxHeight = introCollapsibleContent.scrollHeight + "px";
            };

            const closeIntroAccordion = () => {
                introCollapsibleContent.style.maxHeight = null;
                introCollapsibleContent.classList.remove('open');
                introReduceButton.style.display = 'none';
                introAccordionButton.style.display = 'inline-block';
            };

            introAccordionButton.addEventListener('click', openIntroAccordion);
            introReduceButton.addEventListener('click', closeIntroAccordion);
        }

        // Accordion 2 (Article - specifico per sono-simone.html)
        const articleAccordionButton = document.querySelector('.blog-article .accordion-article-estendi');
        const articleCollapsibleContent = document.querySelector('.blog-article .collapsible-article');
        const articleReduceButton = document.querySelector('.blog-article .accordion-article-riduci');

        if (articleAccordionButton && articleCollapsibleContent && articleReduceButton) {
            const openArticleAccordion = () => {
                articleAccordionButton.style.display = 'none';
                articleReduceButton.style.display = 'block';
                articleCollapsibleContent.classList.add('open');
                articleCollapsibleContent.style.maxHeight = articleCollapsibleContent.scrollHeight + "px";
            };

            const closeArticleAccordion = () => {
                articleCollapsibleContent.style.maxHeight = null;
                articleCollapsibleContent.classList.remove('open');
                articleReduceButton.style.display = 'none';
                articleAccordionButton.style.display = 'inline-block';
            };

            articleAccordionButton.addEventListener('click', openArticleAccordion);
            articleReduceButton.addEventListener('click', closeArticleAccordion);
        }
    }

    /**
     * Configura il menu hamburger per mobile
     */
    setupHamburgerMenu() {
        const hamburger = document.querySelector('.hamburger-menu');
        const navMenu = document.querySelector('.nav-menu');

        if (!hamburger || !navMenu) return;

        hamburger.addEventListener('click', function() {
            this.classList.toggle('hamburger-active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Chiudi menu quando si clicca su un link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', function() {
                if (navMenu.classList.contains('active')) {
                    hamburger.classList.remove('hamburger-active');
                    navMenu.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            });
        });

        // Chiudi menu quando si clicca fuori
        document.addEventListener('click', function(event) {
            if (navMenu.classList.contains('active') &&
                !hamburger.contains(event.target) &&
                !navMenu.contains(event.target)) {
                hamburger.classList.remove('hamburger-active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }

    /**
     * Configura l'effetto scroll dell'header
     */
    setupHeaderScrollEffect() {
        const header = document.querySelector('header');
        if (!header) return;

        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    /**
     * Aggiorna l'anno corrente nel footer
     */
    setupYearUpdate() {
        const currentYearElement = document.getElementById('currentYear');
        if (currentYearElement) {
            currentYearElement.textContent = new Date().getFullYear();
        }
    }

    /**
     * Gestisce i link disabilitati
     */
    setupDisabledLinks() {
        const disabledLinks = document.querySelectorAll('.disabled-link, .disabled-nav-link');
        
        disabledLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
        });
    }

    /**
     * Configura l'animazione di scroll reveal
     */
    setupScrollReveal() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        const sectionsToObserve = document.querySelectorAll('.section:not(.visible)');
        sectionsToObserve.forEach(section => {
            scrollObserver.observe(section);
        });
    }

    /**
     * Configura lo smooth scrolling per link di navigazione
     */
    setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        
        navLinks.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href && href.length > 1 && href.startsWith('#')) {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        e.preventDefault();
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }

    /**
     * Configura gli effetti hover per le immagini
     */
    setupImageHoverEffects() {
        const imagePlaceholders = document.querySelectorAll('.image-placeholder');
        
        imagePlaceholders.forEach(element => {
            element.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            element.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    /**
     * Configura la gestione dei modal
     */
    setupModalHandlers() {
        // Gestione chiusura modal con click esterno
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('storyModal');
            if (event.target === modal) {
                this.closeStoryModal();
            }
        });

        // Gestione chiusura modal con tasto ESC
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const modal = document.getElementById('storyModal');
                if (modal && modal.style.display === 'block') {
                    this.closeStoryModal();
                }
            }
        });
    }

    /**
     * Apre il modal della storia (metodo pubblico per onclick)
     */
    openStoryModal() {
        const modal = document.getElementById('storyModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Chiude il modal della storia (metodo pubblico per onclick)
     */
    closeStoryModal() {
        const modal = document.getElementById('storyModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
}

// Istanza globale per accesso dalle funzioni onclick
let uiAnimationsInstance = null;

/**
 * Inizializza l'istanza globale delle animazioni UI
 * @param {UIAnimations} instance Istanza delle animazioni UI
 */
export function setUIAnimationsInstance(instance) {
    uiAnimationsInstance = instance;
}

/**
 * Funzioni globali per i modal (devono essere globali per onclick HTML)
 */
export function openStoryModal() {
    if (uiAnimationsInstance) {
        uiAnimationsInstance.openStoryModal();
    }
}

export function closeStoryModal() {
    if (uiAnimationsInstance) {
        uiAnimationsInstance.closeStoryModal();
    }
} 