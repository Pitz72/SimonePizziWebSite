import React from 'react';
import { Headphones, Mic, Radio, Clock, Star, Zap } from 'lucide-react';

const Podcast = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-primary to-accent p-6 rounded-full">
                  <Headphones className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-6">
              Podcast
            </h1>
            
            <p className="text-xl md:text-2xl text-text-muted mb-8 max-w-3xl mx-auto leading-relaxed">
              Il mondo dell'audio narrativo sta per aprirsi. 
              <span className="text-primary font-semibold">Runtime Radio</span> e 
              <span className="text-accent font-semibold">Italian Podcast Network</span> 
              arrivano presto in questa nuova casa digitale.
            </p>
            
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 to-accent/10 px-8 py-4 rounded-full border border-primary/20">
              <Clock className="w-5 h-5 text-primary animate-spin" />
              <span className="text-lg font-medium text-primary">Sezione in costruzione</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-primary to-accent p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-text">Runtime Radio</h3>
            </div>
            <p className="text-text-muted leading-relaxed">
              La mia avventura nel podcasting dal 2010. Storie, tecnologia e riflessioni 
              che hanno accompagnato migliaia di ascoltatori.
            </p>
          </div>

          <div className="group bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-accent to-primary p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-text">Italian Podcast Network</h3>
            </div>
            <p className="text-text-muted leading-relaxed">
              La rete che ho fondato per connettere podcaster italiani. 
              Una community che ha fatto la storia del podcasting in Italia.
            </p>
          </div>

          <div className="group bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-primary to-accent p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-text">Nuovi Progetti</h3>
            </div>
            <p className="text-text-muted leading-relaxed">
              Episodi inediti, collaborazioni speciali e format innovativi. 
              Il futuro dell'audio narrativo inizia qui.
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 animate-pulse"></div>
          <div className="relative">
            <div className="flex justify-center mb-6">
              <Zap className="w-12 h-12 text-primary animate-bounce" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              Qualcosa di Straordinario Sta Arrivando
            </h2>
            <p className="text-lg text-text-muted mb-8 max-w-2xl mx-auto">
              Sto preparando una nuova esperienza podcast che unisce narrazione, 
              tecnologia e innovazione. Resta sintonizzato per scoprire il futuro dell'audio digitale.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium">
                🎧 Audio Immersivo
              </span>
              <span className="bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-medium">
                🤖 AI Integration
              </span>
              <span className="bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium">
                📱 Esperienza Interattiva
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Podcast;