# Specifiche Tecniche di Pre-Produzione

**Versione Documento:** 1.0
**Data:** 25 Giugno 2025

---

## 1. Scheletro HTML per `index.html`

Questa è la struttura di base che verrà implementata nel `<body>` della homepage. Utilizza tag semantici e le classi definite nelle guide di stile e layout.

```html
<body>
    <!-- ========= HEADER ========= -->
    <header class="main-header">
        <nav class="container">
            <a href="index.html" class="logo">
                <span class="logo-name">Simone Pizzi</span>
                <span class="logo-tagline">Idee, Storie e Sperimentazione</span>
            </a>
            <ul class="nav-menu">
                <li><a href="#about">Chi Sono</a></li>
                <li><a href="#projects">Progetti</a></li>
                <li><a href="podcast-storia.html">Podcast</a></li>
                <li><a href="sono-simone.html">Blog</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <!-- ========= HERO SECTION ========= -->
        <section id="hero" class="hero-section">
            <div class="hero-content">
                <h1>Creatività Ibrida</h1>
                <p class="tagline">Esplorazioni tra codice, narrativa e mondi sonori.</p>
                <a href="#projects" class="cta-button">Scopri i Progetti</a>
            </div>
            <!-- L'effetto Aurora sarà applicato qui via CSS -->
        </section>

        <!-- ========= SEZIONE CHI SONO (ABOUT) ========= -->
        <section id="about" class="section">
            <div class="container">
                <div class="image-placeholder">
                    <img src="image/photo_2025-03-15_08-52-25.jpg" alt="Ritratto di Simone Pizzi">
                </div>
                <article class="content">
                    <h2>Un artigiano digitale</h2>
                    <p>Ciao, sono Simone. La mia carriera è un dialogo costante tra discipline diverse. Podcaster dal 2010, scrittore per passione e sviluppatore per curiosità, vedo ogni progetto come un'opportunità per imparare e sperimentare.</p>
                    <a href="sono-simone.html" class="text-link">Leggi di più sulla mia storia &rarr;</a>
                </article>
            </div>
        </section>

        <!-- ========= SEZIONE PROGETTI ========= -->
        <section id="projects" class="section">
            <div class="container column-layout">
                <div class="section-header">
                    <h2>I Miei Progetti</h2>
                    <p>Una selezione di lavori che rappresentano il mio percorso.</p>
                </div>
                <div class="project-grid">
                    <!-- Esempio di Project Card (x3) -->
                    <div class="project-card">
                        <div class="card-image">
                            <img src="image/grandereset2.png" alt="Progetto Runtime Radio">
                        </div>
                        <div class="card-content">
                            <h3>Runtime Radio</h3>
                            <p>Il network di podcast che ho fondato, un laboratorio di storie e formati audio.</p>
                            <a href="podcast-storia.html" class="text-link">Dettagli...</a>
                        </div>
                    </div>
                    <div class="project-card">
                        <div class="card-image">
                            <img src="image/thesafeplace_immagine.jpg" alt="Progetto The Safe Place">
                        </div>
                        <div class="card-content">
                            <h3>The Safe Place</h3>
                            <p>Un esperimento di narrativa interattiva che esplora le dinamiche della fiducia.</p>
                            <a href="the-safe-place.html" class="text-link">Dettagli...</a>
                        </div>
                    </div>
                    <div class="project-card">
                        <div class="card-image">
                            <img src="image/albero.jpg" alt="Progetto L'Albero">
                        </div>
                        <div class="card-content">
                            <h3>L'Albero</h3>
                            <p>Una raccolta di racconti che unisce realismo e immaginazione.</p>
                            <a href="#" class="text-link">Dettagli...</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- ========= FOOTER ========= -->
        <footer class="main-footer">
            <div class="container">
                <div class="social-links">
                    <a href="https://github.com/Pitz72" target="_blank">GitHub</a>
                    <a href="https://www.instagram.com/pizzisimone1972/" target="_blank">Instagram</a>
                    <a href="https://www.spreaker.com/user/runtime-radio--8395974" target="_blank">Spreaker</a>
                </div>
                <p class="copyright">&copy; 2025 Simone Pizzi. Tutti i diritti riservati.</p>
            </div>
        </footer>
    </main>
</body>
```

---

## 2. Componente: Effetto "Aurora" per la Hero Section

Questo effetto crea un background animato e soffuso, dando un tocco premium e moderno. Si applica allo pseudo-elemento `::before` della `hero-section`.

**Note Tecniche:**
-   Utilizza un `radial-gradient` per creare le macchie di colore.
-   L'animazione `aurora-effect` sposta e scala il gradiente in un loop infinito, creando un movimento fluido e organico.
-   `filter: blur()` è fondamentale per ammorbidire i bordi e ottenere l'effetto desiderato.

```css
/* Stile per la Hero Section */
.hero-section {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: var(--spacing-section) 2rem;
    text-align: center;
    overflow: hidden; /* Nasconde l'eccesso del gradiente animato */
}

/* Pseudo-elemento per l'effetto Aurora */
.hero-section::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 150%;
    padding-top: 150%;
    border-radius: 50%;
    background-image: radial-gradient(
        circle,
        var(--dark-green) 0%,
        rgba(13, 40, 24, 0.5) 25%,
        transparent 50%
    );
    transform: translate(-50%, -50%);
    filter: blur(100px);
    animation: aurora-effect 20s infinite linear;
    z-index: 0;
}

.hero-content {
    position: relative; /* Assicura che il contenuto sia sopra l'aurora */
    z-index: 1;
}

@keyframes aurora-effect {
    0% {
        transform: translate(-50%, -50%) rotate(0deg) scale(1);
    }
    50% {
        transform: translate(-50%, -50%) rotate(180deg) scale(1.2);
    }
    100% {
        transform: translate(-50%, -50%) rotate(360deg) scale(1);
    }
}
```

---

## 3. Componente: "Project Card"

Le card sono il modo migliore per presentare i progetti in modo visivamente accattivante e organizzato.

**Note Tecniche:**
-   La card ha uno sfondo `var(--surface-dark)` per elevarla rispetto allo sfondo della sezione.
-   Un bordo sottile `var(--primary-green)` (con trasparenza) la definisce.
-   All'hover, la card si solleva leggermente (`transform: translateY(-5px)`) e un `box-shadow` più pronunciato le dà profondità.
-   L'immagine ha un leggero `zoom` all'hover per aggiungere dinamismo.
-   Tutto è gestito con `transition` per garantire fluidità.

```css
/* Griglia per le card */
.project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
    width: 100%;
}

/* Stile della card singola */
.project-card {
    background-color: var(--surface-dark);
    border: 1px solid rgba(0, 255, 136, 0.15);
    border-radius: 20px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.project-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 255, 136, 0.1);
}

/* Immagine della card */
.project-card .card-image {
    height: 200px;
    overflow: hidden;
}

.project-card .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.project-card:hover .card-image img {
    transform: scale(1.05);
}

/* Contenuto della card */
.project-card .card-content {
    padding: 1.5rem;
}

.project-card h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-light);
}

.project-card p {
    font-size: 1rem;
    color: var(--text-muted);
    line-height: 1.6;
    margin-bottom: 1rem;
}

/* Link di testo semplice */
.text-link {
    color: var(--primary-green);
    text-decoration: none;
    font-weight: 600;
    transition: letter-spacing 0.3s ease;
}

.text-link:hover {
    letter-spacing: 0.5px;
}
```

---

## 4. Componente: Sezione Contattami

Questa sezione sarà a tutta larghezza e conterrà il form di contatto, posizionata prima del footer.

```html
<!-- ========= SEZIONE CONTATTAMI ========= -->
<section id="contact" class="section contact-section">
    <div class="container column-layout">
        <div class="section-header">
            <h2>Mettiamoci in Contatto</h2>
            <p>Hai un'idea, un progetto o vuoi semplicemente salutarmi? Scrivimi qui sotto.</p>
        </div>
        <form id="contactForm" class="contact-form">
            <div class="form-group">
                <label for="name">Nome</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="message">Messaggio</label>
                <textarea id="message" name="message" rows="5" required></textarea>
            </div>
            <button type="submit" class="cta-button">Invia Messaggio</button>
        </form>
    </div>
</section>
```

```css
/* Sezione Contattami */
.contact-section {
    background-color: var(--surface-dark);
}

.contact-form {
    width: 100%;
    max-width: 700px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    color: var(--primary-green);
    margin-bottom: 0.5rem;
    font-weight: 600;
}

.form-group input,
.form-group textarea {
    background-color: var(--background-dark);
    border: 1px solid rgba(0, 255, 136, 0.3);
    border-radius: 10px;
    padding: 1rem;
    color: var(--text-light);
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--primary-green);
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
}

.form-group textarea {
    resize: vertical;
}
``` 