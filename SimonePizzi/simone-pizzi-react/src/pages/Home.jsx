import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, Play, BookOpen, Code, Gamepad2, Sparkles } from 'lucide-react';
import { Button, Card, ParticleBackground, TypewriterText, ParallaxCard, AnimatedSection, AnimatedList, AnimatedCard, AchievementPanel } from '../components/ui';
import { useAchievements, useEasterEggs, useNavigationTracking } from '../hooks';
import { useToastContext } from '../hooks/useToastContext';
import { achievements } from '../data/achievements';

const Home = () => {
  const [typewriterComplete, setTypewriterComplete] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  // Sistema toast per notifiche
  const { showToast } = useToastContext();

  // Sistema gamification
  const { unlockAchievement, updateProgress } = useAchievements({
    achievements,
    enabled: true,
    onUnlock: (achievement, id) => {
      console.log(`🎉 Achievement sbloccato: ${achievement?.title || id}`);
      showToast({
        title: `🏆 Achievement Sbloccato!`,
        message: achievement?.title || id,
        type: 'success',
        duration: 5000
      });
    }
  });

  useEasterEggs({
    easterEggs: [
      {
        id: 'konami-code',
        title: 'Konami Code',
        description: 'Hai inserito il Konami Code!',
        type: 'keyboard',
        trigger: 'konami'
      }
    ],
    enabled: true,
    onTrigger: (egg, id) => {
      if (id === 'konami-code') {
        unlockAchievement('konami-master');
      }
    }
  });

  // Sistema tracking navigazione
  useNavigationTracking({
    enabled: true,
    unlockAchievement,
    updateProgress,
    onPageVisit: (pathname, count) => {
      console.log(`📍 Pagina visitata: ${pathname} (totale: ${count})`);
    }
  });

  // Sblocca achievement prima visita (una sola volta)
  useEffect(() => {
    const hasVisited = localStorage.getItem('simone-pizzi-first-visit');
    if (!hasVisited) {
      unlockAchievement('first-visit');
      localStorage.setItem('simone-pizzi-first-visit', 'true');
    }
  }, [unlockAchievement]); // Dipendenze vuote per eseguire solo una volta

  return (
    <>
      {/* Hero Section Avanzata */}
      <AnimatedSection
        variant="fadeInUp"
        threshold={0.1}
        className="hero relative overflow-hidden min-h-screen flex items-center"
      >
        {/* Particle Background */}
        <ParticleBackground />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-bg-accent/80 via-bg-primary/60 to-bg-secondary/80"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary-500/10 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-primary-500/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-primary-500/15 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 transition-all duration-1000">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-500 text-sm font-medium animate-fade-in-up">
                <Sparkles size={16} />
                Benvenuto nel mio universo creativo
              </div>
              
              {/* Main Title */}
              <h1 className="text-5xl lg:text-7xl font-extrabold text-text-primary leading-tight">
                <span className="block">
                  <TypewriterText 
                    text="Benvenuto nel mio"
                    speed={80}
                    delay={500}
                    className="block"
                    onComplete={() => setTypewriterComplete(true)}
                  />
                </span>
                <span className="block mt-2">
                  <span className="text-gradient animate-pulse-glow">
                    {typewriterComplete ? 'universo creativo' : 'universo creativo'}
                  </span>
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl lg:text-2xl text-text-secondary leading-relaxed max-w-2xl animate-fade-in-up" style={{ animationDelay: '1s' }}>
                Podcaster dal 2010, scrittore di storie e racconti, sviluppatore sperimentale con AI. 
                Fondatore Italian Podcast Network e Runtime Radio.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '1.5s' }}>
                <Button 
                  variant="primary" 
                  size="lg" 
                  icon={ArrowRight}
                  to="/chi-sono"
                  className="group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    Scopri di più
                  </span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg" 
                  icon={Play}
                  to="/contatti"
                  className="group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    Contattami
                  </span>
                </Button>
              </div>
              
              {/* Stats */}
              <div className="flex gap-8 pt-8 animate-fade-in-up" style={{ animationDelay: '2s' }}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-500">13+</div>
                  <div className="text-sm text-text-muted">Anni di Podcasting</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-500">50+</div>
                  <div className="text-sm text-text-muted">Progetti Software</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-500">100+</div>
                  <div className="text-sm text-text-muted">Episodi Podcast</div>
                </div>
              </div>
            </div>
            
            {/* Hero Image con Parallax */}
            <div className="flex justify-center items-center transition-all duration-1000" style={{ animationDelay: '0.5s' }}>
              <ParallaxCard
                variant="glass"
                parallaxOptions={{ speed: 0.05, direction: 'vertical' }}
                tiltOptions={{ maxTilt: 2, speed: 400 }}
                className="p-0 bg-transparent border-0 shadow-none"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                  <img 
                    src="/assets/photo_2025-03-15_08-52-25.jpg" 
                    alt="Simone Pizzi - Ritratto" 
                    className="relative w-full max-w-md h-auto rounded-3xl shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-glow-lg"
                  />
                  {/* Floating badge */}
                  <div className="absolute -top-4 -right-4 bg-primary-500 text-bg-primary px-3 py-1 rounded-full text-sm font-semibold animate-bounce">
                    ✨ Live
                  </div>
                </div>
              </ParallaxCard>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Features Section Migliorata */}
      <AnimatedSection
        variant="fadeInUp"
        threshold={0.1}
        animationDelay={200}
        className="section bg-bg-primary"
      >
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gradient mb-6">
              Cosa Troverai Qui
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Una panoramica delle mie passioni e dei progetti che porto avanti con dedizione e creatività
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Play,
                title: "Podcast",
                description: "Runtime Radio e Italian Podcast Network: il mio viaggio nel mondo dell'audio narrativo dal 2010.",
                image: "/assets/photo_2025-01-24_07-40-45.jpg",
                disabled: true
              },
              {
                icon: BookOpen,
                title: "Libri e Racconti",
                description: "Storie che nascono dall'immaginazione e dalla sperimentazione con nuove tecnologie narrative.",
                image: "/assets/albero.jpg",
                disabled: true
              },
              {
                icon: Code,
                title: "Software",
                description: "Utility e strumenti creativi sviluppati per semplificare processi e stimolare l'innovazione.",
                image: "/assets/advjingle.png",
                link: "/software"
              },
              {
                icon: Gamepad2,
                title: "Videogiochi",
                description: "Esperimenti interattivi che uniscono storytelling e tecnologia per creare esperienze uniche.",
                image: "/assets/Whisk_d99885c46e.jpg",
                link: "/videogiochi"
              }
            ].map((feature, index) => (
              <ParallaxCard
                key={feature.title}
                variant="elevated"
                parallaxOptions={{ speed: 0.04, direction: 'vertical' }}
                tiltOptions={{ maxTilt: 2.5, speed: 350 }}
                className="group transition-all duration-700 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative overflow-hidden rounded-xl">
                  {/* Immagine con overlay gradiente al hover */}
                  <div className="relative overflow-hidden">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-48 object-cover rounded-t-xl transition-all duration-500 group-hover:scale-110"
                    />
                    {/* Overlay gradiente al hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-500/80 via-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  </div>
                  
                  <div className="p-6">
                    <div className="relative z-10 text-center">
                      {/* Icona sempre visibile nel testo */}
                      <div className="text-primary-500 mb-6 flex justify-center">
                        <feature.icon size={40} />
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-4 text-text-primary group-hover:text-primary-500 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-text-secondary leading-relaxed mb-6">
                        {feature.description}
                      </p>
                      {feature.disabled ? (
                        <span className="text-text-muted cursor-not-allowed opacity-70 inline-flex items-center gap-2">
                          Prossimamente <ArrowRight size={16} />
                        </span>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={ArrowRight}
                          to={feature.link}
                          className="group/btn"
                        >
                          <span className="group-hover/btn:translate-x-1 transition-transform duration-300">
                            Scopri
                          </span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </ParallaxCard>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Latest Updates Section Migliorata */}
      <AnimatedSection
        variant="fadeInUp"
        threshold={0.1}
        animationDelay={400}
        className="section bg-bg-secondary"
      >
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gradient mb-6">
              Ultimi Aggiornamenti
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Le novità più recenti dai miei progetti e le ultime sperimentazioni
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                category: "Software",
                title: "Advanced Jingle Machine",
                description: "Nuovo strumento per la creazione automatica di jingle professionali con AI integrata.",
                date: "Gennaio 2025",
                link: "/software/advanced-jingle-machine",
                icon: Download
              },
              {
                category: "Videogioco",
                title: "Il Respiro Trattenuto del Mondo",
                description: "Avventura narrativa che esplora temi profondi attraverso meccaniche innovative.",
                date: "Dicembre 2024",
                link: "/videogiochi/il-respiro-trattenuto-del-mondo",
                icon: Play
              },
              {
                category: "Blog",
                title: "The Safe Place v0.2.0",
                description: "Riflessioni sul processo di sviluppo e le sfide della narrativa interattiva moderna.",
                date: "Novembre 2024",
                link: "/chi-sono/articoli/the-safe-place-v100",
                icon: BookOpen
              }
            ].map((update, index) => (
              <Card
                key={update.title}
                variant="elevated"
                className="transition-all duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-center mb-4">
                  <Card.Badge variant="primary">{update.category}</Card.Badge>
                  <span className="text-text-muted text-sm">{update.date}</span>
                </div>
                <Card.Title className="text-xl font-semibold mb-3">
                  {update.title}
                </Card.Title>
                <Card.Content className="text-text-secondary leading-relaxed mb-4">
                  {update.description}
                </Card.Content>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  icon={update.icon}
                  to={update.link}
                  className="group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    Scopri di più
                  </span>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Contact Section Migliorata */}
      <AnimatedSection
        variant="fadeInUp"
        threshold={0.1}
        animationDelay={600}
        className="section bg-bg-primary"
      >
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gradient mb-6">
              Perché Contattarmi?
            </h2>
            <p className="text-xl text-text-secondary max-w-4xl mx-auto">
              Ci sono diversi motivi per cui potresti voler entrare in contatto con me. Ecco alcune delle opportunità di collaborazione e interazione che mi interessano maggiormente.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "Collaborazione Podcast",
                description: "Sempre aperto a partecipare come ospite o a collaborare su progetti audio che riguardano tecnologia, narrativa e innovazione."
              },
              {
                title: "Progetto Sviluppo Software",
                description: "Interessato a progetti che coinvolgono AI, automazione, tools creativi o applicazioni che uniscono tecnologia e storytelling."
              },
              {
                title: "Proposta Editoriale",
                description: "Disponibile a valutare proposte di scrittura, recensioni, o progetti editoriali legati ai miei ambiti di competenza."
              },
              {
                title: "Richiesta Intervista",
                description: "Felice di condividere la mia esperienza su podcasting, sviluppo indie, narrative design e uso creativo dell'intelligenza artificiale."
              },
              {
                title: "Consulenza Tecnica",
                description: "Consulenze su progetti digitali, workflow di produzione audio, o implementazione creativa di strumenti AI."
              }
            ].map((reason, index) => (
              <Card
                key={reason.title}
                variant="default"
                className="transition-all duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card.Title className="text-xl font-semibold mb-3">
                  {reason.title}
                </Card.Title>
                <Card.Content>
                  {reason.description}
                </Card.Content>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              variant="primary" 
              size="xl" 
              icon={ArrowRight}
              to="/contatti"
              className="group animate-pulse-glow"
            >
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                Iniziamo a Collaborare
              </span>
            </Button>
          </div>
        </div>
      </AnimatedSection>

      {/* Achievement Panel */}
      <AnimatedSection
        variant="fadeInUp"
        threshold={0.1}
        animationDelay={800}
        className="section bg-bg-secondary"
      >
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-gradient mb-6">
              I Tuoi Achievement
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
              Scopri i trofei che puoi sbloccare esplorando il sito
            </p>
            <Button 
              variant="ghost" 
              size="lg"
              onClick={() => setShowAchievements(!showAchievements)}
              className="group"
            >
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                {showAchievements ? 'Nascondi' : 'Mostra'} Achievement
              </span>
            </Button>
          </div>
          
          {showAchievements && (
            <div className="max-w-4xl mx-auto">
              <AchievementPanel 
                achievements={achievements}
                showProgress={true}
                showControls={true}
                className="animate-fade-in-up"
              />
            </div>
          )}
        </div>
      </AnimatedSection>

    </>
  );
};

export default Home;
