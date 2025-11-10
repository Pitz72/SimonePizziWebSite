import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Copy, Check } from 'lucide-react';
import { Button, Card, Tooltip, RippleEffect } from '../components/ui';
import { useToast } from '../hooks/useToast';

const Contatti = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    messaggio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const { success, error, info } = useToast();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simula invio form
    setTimeout(() => {
      setIsSubmitting(false);
      success('Messaggio inviato con successo! Ti risponderò presto.');
      setFormData({ nome: '', email: '', messaggio: '' });
    }, 2000);
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      success(`${field} copiato negli appunti!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      error('Errore nella copia negli appunti');
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'pizzisimon1972@gmail.com',
      action: () => copyToClipboard('pizzisimon1972@gmail.com', 'Email'),
      tooltip: 'Clicca per copiare l\'email'
    },
    {
      icon: Phone,
      label: 'Telefono',
      value: '+39 123 456 7890',
      action: () => copyToClipboard('+39 123 456 7890', 'Telefono'),
      tooltip: 'Clicca per copiare il numero'
    },
    {
      icon: MapPin,
      label: 'Località',
      value: 'Milano, Italia',
      action: () => copyToClipboard('Milano, Italia', 'Località'),
      tooltip: 'Clicca per copiare la località'
    }
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl lg:text-5xl font-bold text-gradient mb-6">
          Contattami
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
          Hai un progetto interessante? Vuoi collaborare? 
          Sono sempre aperto a nuove opportunità e conversazioni stimolanti.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <Card variant="elevated" className="p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Informazioni di Contatto
            </h2>
            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <Tooltip key={index} content={item.tooltip}>
                  <RippleEffect>
                    <button
                      onClick={item.action}
                      className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-primary-500/10 transition-all duration-300 group"
                    >
                      <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center group-hover:bg-primary-500/20 transition-colors duration-300">
                        <item.icon size={24} className="text-primary-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm text-text-muted font-medium">
                          {item.label}
                        </p>
                        <p className="text-text-primary font-semibold">
                          {item.value}
                        </p>
                      </div>
                      <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center group-hover:bg-primary-500/20 transition-colors duration-300">
                        {copiedField === item.label ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <Copy size={16} className="text-primary-500" />
                        )}
                      </div>
                    </button>
                  </RippleEffect>
                </Tooltip>
              ))}
            </div>
          </Card>

          <Card variant="glass" className="p-8">
            <h3 className="text-xl font-bold text-text-primary mb-4">
              Orari di Disponibilità
            </h3>
            <div className="space-y-3 text-text-secondary">
              <div className="flex justify-between">
                <span>Lunedì - Venerdì</span>
                <span className="font-semibold text-primary-500">9:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span>Sabato</span>
                <span className="font-semibold text-primary-500">10:00 - 16:00</span>
              </div>
              <div className="flex justify-between">
                <span>Domenica</span>
                <span className="text-text-muted">Chiuso</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <Card variant="elevated" className="p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Invia un Messaggio
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-text-secondary mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-bg-secondary border border-border-primary rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 text-text-primary placeholder-text-muted"
                placeholder="Il tuo nome"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-bg-secondary border border-border-primary rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 text-text-primary placeholder-text-muted"
                placeholder="la-tua-email@esempio.com"
              />
            </div>

            <div>
              <label htmlFor="messaggio" className="block text-sm font-medium text-text-secondary mb-2">
                Messaggio *
              </label>
              <textarea
                id="messaggio"
                name="messaggio"
                value={formData.messaggio}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-3 bg-bg-secondary border border-border-primary rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 text-text-primary placeholder-text-muted resize-none"
                placeholder="Raccontami del tuo progetto..."
              />
            </div>

            <RippleEffect>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
                icon={isSubmitting ? null : Send}
              >
                {isSubmitting ? 'Invio in corso...' : 'Invia Messaggio'}
              </Button>
            </RippleEffect>
          </form>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-16">
        <Card variant="featured" className="p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-text-primary mb-4">
            Iniziamo a Collaborare?
          </h3>
          <p className="text-text-secondary mb-6">
            Ogni grande progetto inizia con una conversazione. 
            Non esitare a contattarmi per discutere delle tue idee.
          </p>
          <RippleEffect>
            <Button
              variant="primary"
              size="lg"
              onClick={() => info('Funzionalità in sviluppo!')}
              icon={Send}
            >
              Iniziamo Subito
            </Button>
          </RippleEffect>
        </Card>
      </div>
    </div>
  );
};

export default Contatti;
