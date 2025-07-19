import React, { useState } from 'react';
import { Send, Mail, MessageCircle, User, Clock, CheckCircle } from 'lucide-react';

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
      <header className="py-16 bg-gradient-to-br from-[#002a15] to-[#1a1a1a] border-b border-[#2a2a2a] text-center">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col gap-12 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-white">Contattami</h1>
            <p className="text-xl text-[#b3b3b3] max-w-2xl mx-auto">
              Hai un'idea, una proposta o semplicemente vuoi fare due chiacchiere? 
              Sono sempre aperto a nuove collaborazioni e conversazioni interessanti.
            </p>
          </div>
        </div>
      </header>

      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-3xl font-bold text-[#00ff88] mb-6">Perché Contattarmi?</h2>
                <p className="text-lg text-[#e0e0e0] leading-relaxed mb-8">
                  Ci sono diversi motivi per cui potresti voler entrare in contatto con me. 
                  Ecco le aree in cui sono più attivo e interessato a collaborare:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contactReasons.map((reason, index) => (
                  <div key={index} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:border-[#00ff88]/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="text-[#00ff88] mt-1">
                        {reason.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{reason.title}</h3>
                        <p className="text-[#b3b3b3] text-sm leading-relaxed">{reason.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#1a1a1a] border border-[#00ff88]/30 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#00ff88] mb-4">Tempi di Risposta</h3>
                <p className="text-[#e0e0e0] leading-relaxed">
                  Cerco di rispondere a tutti i messaggi entro 48-72 ore. Per richieste urgenti, 
                  specificalo nel messaggio e farò del mio meglio per rispondere prima.
                </p>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8">
                <h2 className="text-2xl font-bold text-[#00ff88] mb-6">Invia un Messaggio</h2>
                
                {submitStatus === 'success' && (
                  <div className="bg-[#00ff88]/20 border border-[#00ff88] text-[#00ff88] px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
                    <CheckCircle size={20} />
                    Messaggio inviato con successo! Ti risponderò presto.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
                    <CheckCircle size={20} />
                    Si è verificato un errore. Riprova più tardi o contattami direttamente via email.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="nome" className="block text-white font-medium mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                      placeholder="Il tuo nome"
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:border-[#00ff88] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-white font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="la-tua-email@example.com"
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:border-[#00ff88] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="tipo" className="block text-white font-medium mb-2">
                      Tipo di Richiesta
                    </label>
                    <select
                      id="tipo"
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:border-[#00ff88] focus:outline-none transition-colors"
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

                  <div>
                    <label htmlFor="messaggio" className="block text-white font-medium mb-2">
                      Messaggio *
                    </label>
                    <textarea
                      id="messaggio"
                      name="messaggio"
                      value={formData.messaggio}
                      onChange={handleInputChange}
                      required
                      rows="6"
                      placeholder="Descrivi la tua idea, proposta o richiesta..."
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:border-[#00ff88] focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-[#00ff88] text-[#0a0a0a] px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#00ff88] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0a0a0a] border-t-transparent"></div>
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

                <div className="mt-8 pt-6 border-t border-[#2a2a2a] text-center">
                  <p className="text-[#e0e0e0]">
                    <strong className="text-white">Preferisci l'email diretta?</strong><br />
                    Puoi scrivermi a: <a href="mailto:info@simonepizzi.it" className="text-[#00ff88] hover:text-[#00cc6a] transition-colors">info@simonepizzi.it</a>
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
