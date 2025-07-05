import React, { useState } from 'react';
import { Send, Mail, MessageCircle, User, Clock, CheckCircle } from 'lucide-react';
import './Contatti.css';

const Contatti = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    tipo: '',
    messaggio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulazione invio form (da implementare con backend)
    try {
      // Qui implementeremo l'invio al backend Flask
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({ nome: '', email: '', tipo: '', messaggio: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactReasons = [
    {
      icon: <MessageCircle size={24} />,
      title: "Collaborazione Podcast",
      description: "Partecipazione come ospite o collaborazione su progetti audio",
      value: "podcast"
    },
    {
      icon: <User size={24} />,
      title: "Progetto Sviluppo",
      description: "Progetti AI, automazione, tools creativi o applicazioni narrative",
      value: "sviluppo"
    },
    {
      icon: <Mail size={24} />,
      title: "Proposta Editoriale",
      description: "Scrittura, recensioni o progetti editoriali",
      value: "editoriale"
    },
    {
      icon: <CheckCircle size={24} />,
      title: "Richiesta Intervista",
      description: "Condivisione esperienza su podcasting, sviluppo indie, AI",
      value: "intervista"
    },
    {
      icon: <Clock size={24} />,
      title: "Consulenza Tecnica",
      description: "Progetti digitali, workflow audio, implementazione AI",
      value: "consulenza"
    }
  ];

  return (
    <>
      <header className="page-hero">
        <div className="container section-column">
          <h1>Contattami</h1>
          <p className="tagline">
            Hai un'idea, una proposta o semplicemente vuoi fare due chiacchiere? 
            Sono sempre aperto a nuove collaborazioni e conversazioni interessanti.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <h2>Perché Contattarmi?</h2>
              <p>
                Ci sono diversi motivi per cui potresti voler entrare in contatto con me. 
                Ecco le aree in cui sono più attivo e interessato a collaborare:
              </p>

              <div className="reasons-grid">
                {contactReasons.map((reason, index) => (
                  <div key={index} className="reason-card">
                    <div className="reason-icon">
                      {reason.icon}
                    </div>
                    <div className="reason-content">
                      <h3>{reason.title}</h3>
                      <p>{reason.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="contact-note">
                <h3>Tempi di Risposta</h3>
                <p>
                  Cerco di rispondere a tutti i messaggi entro 48-72 ore. Per richieste urgenti, 
                  specificalo nel messaggio e farò del mio meglio per rispondere prima.
                </p>
              </div>
            </div>

            <div className="contact-form-container">
              <div className="form-card">
                <h2>Invia un Messaggio</h2>
                
                {submitStatus === 'success' && (
                  <div className="alert alert-success">
                    <CheckCircle size={20} />
                    Messaggio inviato con successo! Ti risponderò presto.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="alert alert-error">
                    Si è verificato un errore. Riprova più tardi o contattami direttamente via email.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-group">
                    <label htmlFor="nome">Nome *</label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                      placeholder="Il tuo nome"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="la-tua-email@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="tipo">Tipo di Richiesta</label>
                    <select
                      id="tipo"
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleInputChange}
                    >
                      <option value="">Seleziona un tipo...</option>
                      {contactReasons.map((reason, index) => (
                        <option key={index} value={reason.value}>
                          {reason.title}
                        </option>
                      ))}
                      <option value="altro">Altro</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="messaggio">Messaggio *</label>
                    <textarea
                      id="messaggio"
                      name="messaggio"
                      value={formData.messaggio}
                      onChange={handleInputChange}
                      required
                      rows="6"
                      placeholder="Descrivi la tua idea, proposta o richiesta..."
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="spinner"></div>
                        Invio in corso...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Invia Messaggio
                      </>
                    )}
                  </button>
                </form>

                <div className="direct-contact">
                  <p>
                    <strong>Preferisci l'email diretta?</strong><br />
                    Puoi scrivermi a: <a href="mailto:info@simonepizzi.it">info@simonepizzi.it</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contatti;
