/**
 * ===============================================
 * FORM HANDLER - Gestione Form di Contatto
 * ===============================================
 * 
 * Gestisce validazione, invio e feedback per il form di contatto.
 * Include logica di fallback automatico e gestione CORS.
 * 
 * Funzionalità:
 * - Validazione lato client
 * - Invio multiprotocollo (Flask backend/mailto fallback)
 * - Status messaggi animati
 * - Effetti focus sui campi
 */

export class FormHandler {
    constructor() {
        this.form = null;
        this.formStatus = null;
    }

    /**
     * Inizializza il gestore del form di contatto
     */
    initialize() {
        this.form = document.getElementById('contactForm');
        this.formStatus = document.getElementById('formStatus');
        
        if (this.form) {
            console.log('Form di contatto trovato, aggiungendo event listener');
            this.setupFormSubmission();
            this.setupFormFieldEffects();
        }
    }

    /**
     * Configura la gestione dell'invio del form
     */
    setupFormSubmission() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Form submit intercettato');

            const formData = this.collectFormData();
            if (!formData) return; // Validazione fallita

            this.showFormStatus('', 'Invio in corso...');

            try {
                await this.submitForm(formData);
            } catch (error) {
                console.error('Errore invio form:', error);
                this.handleFormError(formData);
            }
        });
    }

    /**
     * Raccoglie e valida i dati del form
     * @returns {Object|null} Dati del form o null se validazione fallisce
     */
    collectFormData() {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const subjectInput = document.getElementById('subject');
        const messageInput = document.getElementById('message');
        const privacyCheckbox = document.getElementById('privacy');

        // Controllo esistenza elementi
        if (!nameInput || !emailInput || !subjectInput || !messageInput || !privacyCheckbox) {
            console.error('Uno o più campi del form di contatto sono mancanti nel DOM.');
            this.showFormStatus('error', 'Errore nel form. Si prega di ricaricare la pagina.');
            return null;
        }

        const formData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            subject: subjectInput.value,
            message: messageInput.value.trim(),
            privacy: privacyCheckbox.checked
        };

        // Validazione
        if (!this.validateFormData(formData)) {
            return null;
        }

        return formData;
    }

    /**
     * Valida i dati del form
     * @param {Object} formData Dati da validare
     * @returns {boolean} True se validazione passa
     */
    validateFormData(formData) {
        // Campi obbligatori
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            this.showFormStatus('error', 'Per favore compila tutti i campi obbligatori.');
            return false;
        }

        // Consenso GDPR
        if (!formData.privacy) {
            this.showFormStatus('error', 'È necessario accettare il trattamento dei dati personali per procedere.');
            return false;
        }

        // Validazione email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            this.showFormStatus('error', 'Per favore inserisci un indirizzo email valido.');
            return false;
        }

        return true;
    }

    /**
     * Invia il form al backend
     * @param {Object} formData Dati del form
     */
    async submitForm(formData) {
        const apiUrl = this.determineApiUrl();
        
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
            this.showFormStatus('success', data.message || 'Messaggio inviato con successo! Ti risponderò al più presto.');
            this.form.reset();
        } else {
            const data = await response.json();
            this.showFormStatus('error', data.error || 'Errore durante l\'invio. Riprova tra qualche minuto.');
        }
    }

    /**
     * Determina l'URL API corretto in base al contesto
     * @returns {string} URL dell'API
     */
    determineApiUrl() {
        if (window.location.protocol === 'file:') {
            // Se è file locale, forza il fallback
            throw new Error('Modalità file locale - usa fallback email');
        } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Se è localhost, prova il backend Flask
            return 'http://localhost:5000/api/contact';
        } else {
            // Se è produzione, usa endpoint relativo
            return '/api/contact';
        }
    }

    /**
     * Gestisce errori di invio con fallback email
     * @param {Object} formData Dati del form per il fallback
     */
    handleFormError(formData) {
        const emailBody = `Nome: ${formData.name}\nEmail: ${formData.email}\nOggetto: ${formData.subject}\n\nMessaggio:\n${formData.message}`;
        const mailtoLink = `mailto:pizzisimone1972@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(emailBody)}`;
        
        this.showFormStatus('error', 'Il server non è disponibile. Clicca qui per aprire il tuo client email.', mailtoLink);
    }

    /**
     * Mostra messaggio di status del form
     * @param {string} type Tipo di messaggio ('success', 'error', '')
     * @param {string} message Testo del messaggio
     * @param {string} mailtoLink Link email opzionale per fallback
     */
    showFormStatus(type, message, mailtoLink = null) {
        console.log('Mostrando messaggio:', type, message);
        
        if (!this.formStatus) return;

        this.formStatus.style.display = 'block';
        this.formStatus.className = `form-status ${type}`;
        
        if (mailtoLink) {
            // Crea un link cliccabile per aprire il client email
            this.formStatus.innerHTML = `<span style="cursor: pointer; text-decoration: underline;" onclick="window.location.href='${mailtoLink}'">${message}</span>`;
        } else {
            this.formStatus.textContent = message;
        }
        
        // Animazione di entrata
        this.formStatus.style.transform = 'translateX(100%)';
        setTimeout(() => {
            this.formStatus.style.transform = 'translateX(0)';
        }, 100);
        
        // Nascondi il messaggio dopo 8 secondi
        setTimeout(() => {
            this.formStatus.style.transform = 'translateX(100%)';
            setTimeout(() => {
                this.formStatus.style.display = 'none';
                this.formStatus.innerHTML = '';
            }, 300);
        }, 8000);
    }

    /**
     * Configura effetti focus sui campi del form
     */
    setupFormFieldEffects() {
        const formFields = this.form.querySelectorAll('input, textarea');
        
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

/**
 * Funzione globale per rivelare email (deve rimanere globale per onclick HTML)
 * @param {string} elementId ID dell'elemento da modificare
 * @param {string} user Parte user dell'email
 * @param {string} domain Dominio dell'email
 */
export function revealEmail(elementId, user, domain) {
    const element = document.getElementById(elementId);
    if (element) {
        const email = user + '@' + domain;
        element.innerHTML = '<a href="mailto:' + email + '" style="color: #00ff88; text-decoration: none;">' + email + '</a>';
        element.style.cursor = 'default';
        element.onclick = null;
    }
} 