// Funzione per rivelare le email (deve essere globale se chiamata da onclick in HTML)
function revealEmail(elementId, user, domain) {
    const element = document.getElementById(elementId);
    if (element) { // Controlla se l'elemento esiste
        const email = user + '@' + domain;
        element.innerHTML = '<a href="mailto:' + email + '" style="color: #00ff88; text-decoration: none;">' + email + '</a>';
        element.style.cursor = 'default';
        element.onclick = null; // Rimuove l'handler onclick per prevenire riattivazioni
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing JavaScript...');

    // Accordion 1 (Introduction - specifico per sono-simone.html)
    const introAccordionButton = document.querySelector('.blog-intro .accordion-intro-estendi');
    const introCollapsibleContent = document.querySelector('.blog-intro .collapsible-intro');
    const introReduceButton = document.querySelector('.blog-intro .accordion-intro-riduci');

    function openIntroAccordion() {
        if (introAccordionButton && introCollapsibleContent && introReduceButton) {
            introAccordionButton.style.display = 'none';
            introReduceButton.style.display = 'block';
            introCollapsibleContent.classList.add('open');
            introCollapsibleContent.style.maxHeight = introCollapsibleContent.scrollHeight + "px";
        }
    }

    function closeIntroAccordion() {
        if (introAccordionButton && introCollapsibleContent && introReduceButton) {
            introCollapsibleContent.style.maxHeight = null;
            introCollapsibleContent.classList.remove('open');
            introReduceButton.style.display = 'none';
            introAccordionButton.style.display = 'inline-block';
        }
    }

    if (introAccordionButton) {
        introAccordionButton.addEventListener('click', openIntroAccordion);
    }
    if (introReduceButton) {
        introReduceButton.addEventListener('click', closeIntroAccordion);
    }

    // Accordion 2 (Article - specifico per sono-simone.html)
    const articleAccordionButton = document.querySelector('.blog-article .accordion-article-estendi');
    const articleCollapsibleContent = document.querySelector('.blog-article .collapsible-article');
    const articleReduceButton = document.querySelector('.blog-article .accordion-article-riduci');

    function openArticleAccordion() {
        if (articleAccordionButton && articleCollapsibleContent && articleReduceButton) {
            articleAccordionButton.style.display = 'none';
            articleReduceButton.style.display = 'block';
            articleCollapsibleContent.classList.add('open');
            articleCollapsibleContent.style.maxHeight = articleCollapsibleContent.scrollHeight + "px";
        }
    }

    function closeArticleAccordion() {
        if (articleAccordionButton && articleCollapsibleContent && articleReduceButton) {
            articleCollapsibleContent.style.maxHeight = null;
            articleCollapsibleContent.classList.remove('open');
            articleReduceButton.style.display = 'none';
            articleAccordionButton.style.display = 'inline-block';
        }
    }

    if (articleAccordionButton) {
        articleAccordionButton.addEventListener('click', openArticleAccordion);
    }
    if (articleReduceButton) {
        articleReduceButton.addEventListener('click', closeArticleAccordion);
    }

    // Hamburger menu toggle (Comune)
    const hamburger = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('hamburger-active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', function() {
                if (navMenu.classList.contains('active')) {
                    hamburger.classList.remove('hamburger-active');
                    navMenu.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            });
        });

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

    // Header scroll effect (Comune)
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Set current year in footer (Comune)
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Gestione link disabilitati (Comune)
    const disabledLinks = document.querySelectorAll('.disabled-link, .disabled-nav-link');
    if (disabledLinks.length > 0) {
        disabledLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
        });
    }

    // --- Script specifici per index.html ---

    // Scroll reveal animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // scrollObserver.unobserve(entry.target); // Opzionale: de-osserva dopo la rivelazione
            }
        });
    }, observerOptions);

    const sectionsToObserve = document.querySelectorAll('.section:not(.visible)');
    if (sectionsToObserve.length > 0) {
        sectionsToObserve.forEach(section => {
            scrollObserver.observe(section);
        });
    }

    // Smooth scrolling per i link di navigazione
    const navLinks = document.querySelectorAll('a[href^="#"]');
    if (navLinks.length > 0) {
        navLinks.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href && href.length > 1 && href.startsWith('#')) { // Check if href is not just "#"
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

    // Effetto hover migliorato per le immagini
    const imagePlaceholders = document.querySelectorAll('.image-placeholder');
    if (imagePlaceholders.length > 0) {
        imagePlaceholders.forEach(element => {
            element.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.02)';
            });
            element.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // Gestione form di contatto
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        console.log('Form di contatto trovato, aggiungendo event listener');
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Form submit intercettato');

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const subjectInput = document.getElementById('subject');
            const messageInput = document.getElementById('message');
            const privacyCheckbox = document.getElementById('privacy');
            const formStatus = document.getElementById('formStatus');

            // Mostra loading
            if (formStatus) {
                formStatus.style.display = 'block';
                formStatus.className = 'form-status';
                formStatus.textContent = 'Invio in corso...';
            }

            // Basic check for element existence
            if (!nameInput || !emailInput || !subjectInput || !messageInput || !privacyCheckbox) {
                console.error('Uno o più campi del form di contatto sono mancanti nel DOM.');
                showFormStatus('error', 'Errore nel form. Si prega di ricaricare la pagina.');
                return;
            }

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const subject = subjectInput.value;
            const message = messageInput.value.trim();
            const privacy = privacyCheckbox.checked;

            // Validazione base
            if (!name || !email || !subject || !message) {
                showFormStatus('error', 'Per favore compila tutti i campi obbligatori.');
                return;
            }

            // Validazione consenso GDPR
            if (!privacy) {
                showFormStatus('error', 'È necessario accettare il trattamento dei dati personali per procedere.');
                return;
            }

            // Validazione email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showFormStatus('error', 'Per favore inserisci un indirizzo email valido.');
                return;
            }

            try {
                // Tentativo di invio al backend locale
                const formData = {
                    name: name,
                    email: email,
                    subject: subject,
                    message: message,
                    privacy: privacy
                };

                // Determina l'URL corretto in base al contesto
                let apiUrl;
                if (window.location.protocol === 'file:') {
                    // Se è file locale, usa direttamente il fallback
                    throw new Error('Modalità file locale - usa fallback email');
                } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    // Se è localhost, prova il backend Flask
                    apiUrl = 'http://localhost:5000/api/contact';
                } else {
                    // Se è produzione, usa endpoint relativo
                    apiUrl = '/api/contact';
                }

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    const data = await response.json();
                    showFormStatus('success', data.message || 'Messaggio inviato con successo! Ti risponderò al più presto.');
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    showFormStatus('error', data.error || 'Errore durante l\'invio. Riprova tra qualche minuto.');
                }
            } catch (error) {
                console.error('Errore invio form:', error);
                // Fallback: apri client email come alternativa
                const emailBody = `Nome: ${name}\nEmail: ${email}\nOggetto: ${subject}\n\nMessaggio:\n${message}`;
                const mailtoLink = `mailto:pizzisimone1972@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
                
                // Mostra messaggio con opzione di aprire il client email
                showFormStatus('error', 'Il server non è disponibile. Clicca qui per aprire il tuo client email.', mailtoLink);
            }
        });

        function showFormStatus(type, message, mailtoLink = null) {
            console.log('Mostrando messaggio:', type, message);
            const formStatus = document.getElementById('formStatus');
            if (formStatus) {
                formStatus.style.display = 'block';
                formStatus.className = `form-status ${type}`;
                
                if (mailtoLink) {
                    // Crea un link cliccabile per aprire il client email
                    formStatus.innerHTML = `<span style="cursor: pointer; text-decoration: underline;" onclick="window.location.href='${mailtoLink}'">${message}</span>`;
                } else {
                    formStatus.textContent = message;
                }
                
                // Animazione di entrata
                formStatus.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    formStatus.style.transform = 'translateX(0)';
                }, 100);
                
                // Nascondi il messaggio dopo 8 secondi (più tempo per leggere il messaggio di fallback)
                setTimeout(() => {
                    formStatus.style.transform = 'translateX(100%)';
                    setTimeout(() => {
                        formStatus.style.display = 'none';
                        formStatus.innerHTML = ''; // Pulisci il contenuto HTML
                    }, 300);
                }, 8000);
            } else {
                console.log('Elemento formStatus non trovato');
            }
        }

        // Stili focus per i campi del form
        const formFields = contactForm.querySelectorAll('input, textarea');
        if (formFields.length > 0) {
            formFields.forEach(field => {
                field.addEventListener('focus', function() {
                    this.style.borderColor = '#00ff88';
                    this.style.boxShadow = '0 0 10px rgba(0, 255, 136, 0.3)';
                });
                field.addEventListener('blur', function() {
                    this.style.borderColor = 'rgba(0, 255, 136, 0.3)';
                    this.style.boxShadow = 'none';
                });
            });
        }
    }
}); // Fine DOMContentLoaded

// Funzioni per il modal della storia (devono essere globali per onclick)
function openStoryModal() {
    const modal = document.getElementById('storyModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Previene lo scroll della pagina
    }
}

function closeStoryModal() {
    const modal = document.getElementById('storyModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Ripristina lo scroll della pagina
    }
}

// Chiude il modal se si clicca fuori dal contenuto
window.addEventListener('click', function(event) {
    const modal = document.getElementById('storyModal');
    if (event.target === modal) {
        closeStoryModal();
    }
});

// Chiude il modal con il tasto ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('storyModal');
        if (modal && modal.style.display === 'block') {
            closeStoryModal();
        }
    }
});

// ===============================================
// SISTEMA COMPONENTI CENTRALIZZATI (Header/Footer)
// ===============================================

class ComponentManager {
    constructor() {
        this.basePath = this.calculateBasePath();
        this.currentPage = this.getCurrentPage();
        console.log(`ComponentManager: basePath="${this.basePath}", currentPage="${this.currentPage}"`);
    }

    calculateBasePath() {
        const path = window.location.pathname;
        console.log('Current path:', path);
        
        // Conta quante directory dobbiamo risalire per arrivare alla root
        const segments = path.split('/').filter(p => p && p !== 'index.html');
        console.log('Path segments:', segments);
        
        // Se siamo nella root (es: /index.html o /) non risaliamo
        if (segments.length <= 1) {
            console.log('At root, basePath: ./');
            return './';
        }
        
        // Altrimenti risaliamo di segments.length livelli  
        const depth = segments.length;
        const basePath = '../'.repeat(depth);
        console.log('Depth:', depth, 'basePath:', basePath);
        return basePath;
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('/software/')) return 'software';
        if (path.includes('/videogiochi/')) return 'videogiochi';
        if (path.includes('/contatti')) return 'contatti';
        if (path.includes('/libri/')) return 'libri';
        if (path.includes('/podcast/')) return 'podcast';
        if (path.includes('/chi-sono/')) return 'chi-sono';
        return 'home';
    }

    async loadComponent(componentName, targetSelector) {
        try {
            const response = await fetch(`${this.basePath}components/${componentName}.html`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const html = await response.text();
            const targetElement = document.querySelector(targetSelector);
            
            if (targetElement) {
                targetElement.innerHTML = html;
                this.updatePaths(targetElement);
                this.setActiveNavigation();
                return true;
            }
        } catch (error) {
            console.warn(`Could not load ${componentName}:`, error);
            return false;
        }
    }

    updatePaths(container) {
        // Sostituisci i placeholder BASEPATH_REPLACE con il basePath corretto
        const links = container.querySelectorAll('a[href*="BASEPATH_REPLACE"]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            const newHref = href.replace('BASEPATH_REPLACE', this.basePath);
            link.setAttribute('href', newHref);
        });

        // Aggiorna anche i link assoluti legacy
        const absoluteLinks = container.querySelectorAll('a[href^="/"]');
        absoluteLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href.startsWith('/')) {
                link.setAttribute('href', `${this.basePath}${href.substring(1)}`);
            }
        });
    }

    setActiveNavigation() {
        // Rimuovi tutte le classi active esistenti
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => link.classList.remove('active'));

        // Aggiungi classe active al link corrispondente
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

    async initialize() {
        console.log('ComponentManager: Initializing...');
        
        // Rimuovi header esistente (dalla homepage) per sostituirlo con quello dinamico
        const existingHeader = document.querySelector('.main-header');
        if (existingHeader) {
            existingHeader.remove();
        }
        
        // Carica header dinamico
        const headerLoaded = await this.loadHeader();
        if (!headerLoaded) {
            console.log('Fallback: Creating header directly');
            this.createFallbackHeader();
        }

        // Carica footer se non è già presente  
        if (!document.querySelector('.main-footer')) {
            const footerLoaded = await this.loadFooter();
            if (!footerLoaded) {
                console.log('Fallback: Creating footer directly');
                this.createFallbackFooter();
            }
        }
    }

    createFallbackHeader() {
        const headerHtml = `
        <header class="main-header">
            <nav class="container">
                <a href="${this.basePath}index.html" class="logo">
                    <span class="logo-name">Simone Pizzi</span>
                    <span class="logo-tagline">Idee, Storie e Sperimentazione</span>
                </a>
                <ul class="nav-menu">
                    <li><a href="${this.basePath}index.html" id="nav-home">Home</a></li>
                    <li><a href="${this.basePath}pages/chi-sono/" id="nav-chi-sono">Sono Simone (blog)</a></li>
                    <li><a href="#" class="disabled-nav-link" data-tooltip="Sezione in arrivo presto">Podcast</a></li>
                    <li><a href="#" class="disabled-nav-link" data-tooltip="Sezione in arrivo presto">Libri</a></li>
                    <li><a href="${this.basePath}pages/software/" id="nav-software">Software</a></li>
                    <li><a href="${this.basePath}pages/videogiochi/" id="nav-videogiochi">Videogiochi</a></li>
                    <li><a href="${this.basePath}pages/contatti.html" id="nav-contatti">Contattami</a></li>
                </ul>
            </nav>
        </header>`;
        
        document.body.insertAdjacentHTML('afterbegin', headerHtml);
        this.setActiveNavigation();
    }

    createFallbackFooter() {
        const footerHtml = `
        <footer class="main-footer">
            <div class="container">
                <div class="social-links">
                    <a href="mailto:pizzisimon1972@gmail.com" aria-label="Email di Simone Pizzi">
                        <i class="fas fa-envelope"></i>
                        <span>Email</span>
                    </a>
                    <a href="https://github.com/Pitz72" target="_blank" aria-label="GitHub di Simone Pizzi">
                        <i class="fab fa-github"></i>
                        <span>GitHub</span>
                    </a>
                    <a href="https://www.instagram.com/pizzisimone1972/" target="_blank" aria-label="Instagram di Simone Pizzi">
                        <i class="fab fa-instagram"></i>
                        <span>Instagram</span>
                    </a>
                    <a href="https://www.spreaker.com/user/runtime-radio--8395974" target="_blank" aria-label="Spreaker di Runtime Radio">
                        <i class="fas fa-microphone-alt"></i>
                        <span>Spreaker</span>
                    </a>
                </div>
                <p class="copyright">&copy; 2025 Simone Pizzi. Tutti i diritti riservati.</p>
            </div>
        </footer>`;
        
        document.body.insertAdjacentHTML('beforeend', footerHtml);
    }

    async loadHeader() {
        try {
            console.log(`Loading header from: ${this.basePath}components/header.html`);
            
            // Timeout di 3 secondi per il fetch
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(`${this.basePath}components/header.html`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const html = await response.text();
            const body = document.body;
            
            // Inserisci header all'inizio del body
            body.insertAdjacentHTML('afterbegin', html);
            
            const headerElement = document.querySelector('.main-header');
            if (headerElement) {
                this.updatePaths(headerElement);
                this.setActiveNavigation();
                console.log('Header loaded successfully');
                return true;
            }
            return false;
        } catch (error) {
            console.warn(`Could not load header:`, error);
            return false;
        }
    }

    async loadFooter() {
        try {
            console.log(`Loading footer from: ${this.basePath}components/footer.html`);
            
            // Timeout di 3 secondi per il fetch
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(`${this.basePath}components/footer.html`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const html = await response.text();
            const body = document.body;
            
            // Inserisci footer alla fine del body
            body.insertAdjacentHTML('beforeend', html);
            
            const footerElement = document.querySelector('.main-footer');
            if (footerElement) {
                this.updatePaths(footerElement);
                console.log('Footer loaded successfully');
                return true;
            }
            return false;
        } catch (error) {
            console.warn(`Could not load footer:`, error);
            return false;
        }
    }
}

// Inizializza il sistema di componenti quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const componentManager = new ComponentManager();
        componentManager.initialize();
    });
} else {
    const componentManager = new ComponentManager();
    componentManager.initialize();
}