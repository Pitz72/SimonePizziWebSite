import React from 'react';
import { BookOpen, Feather, Sparkles, Clock, Scroll, Zap } from 'lucide-react';

const Libri = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-accent to-primary p-6 rounded-full">
                  <BookOpen className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent mb-6">
              Libri & Racconti
            </h1>
            
            <p className="text-xl md:text-2xl text-text-muted mb-8 max-w-3xl mx-auto leading-relaxed">
              Dove le parole prendono vita e le storie trovano la loro voce. 
              Un universo narrativo in continua espansione, 
              <span className="text-accent font-semibold">pronto a svelarsi</span>.
            </p>
            
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-accent/10 to-primary/10 px-8 py-4 rounded-full border border-accent/20">
              <Clock className="w-5 h-5 text-accent animate-spin" />
              <span className="text-lg font-medium text-accent">Biblioteca in allestimento</span>
            </div>
          </div>
        </div>
      </div>

      {/* Literary Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-accent to-primary p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Feather className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-text">Racconti Originali</h3>
            </div>
            <p className="text-text-muted leading-relaxed">
              Storie brevi che esplorano l'animo umano, la tecnologia e i mondi possibili. 
              Narrazioni che nascono dall'intersezione tra realtà e immaginazione.
            </p>
          </div>

          <div className="group bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-primary to-accent p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-text">The Safe Place</h3>
            </div>
            <p className="text-text-muted leading-relaxed">
              Il romanzo che ha dato vita all'omonimo videogioco. 
              Una storia di sopravvivenza, mistero e scoperta di sé in un mondo post-apocalittico.
            </p>
          </div>

          <div className="group bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-accent to-primary p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Scroll className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-text">Progetti Futuri</h3>
            </div>
            <p className="text-text-muted leading-relaxed">
              Nuove opere in cantiere che mescolano narrativa tradizionale, 
              elementi interattivi e sperimentazione con l'intelligenza artificiale.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Quote */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-primary/5 rounded-3xl"></div>
          <blockquote className="relative bg-card/30 backdrop-blur-sm p-12 rounded-3xl border border-border/30 text-center">
            <Sparkles className="w-8 h-8 text-accent mx-auto mb-6" />
            <p className="text-2xl md:text-3xl font-light text-text mb-6 italic leading-relaxed">
              "Ogni storia è un ponte tra ciò che siamo e ciò che potremmo diventare. 
              Nelle parole troviamo non solo intrattenimento, ma 
              <span className="text-accent font-medium">trasformazione</span>."
            </p>
            <cite className="text-text-muted font-medium">— Simone Pizzi</cite>
          </blockquote>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative overflow-hidden bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10 rounded-3xl p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-primary/5 animate-pulse"></div>
          <div className="relative">
            <div className="flex justify-center mb-6">
              <Zap className="w-12 h-12 text-accent animate-bounce" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              La Biblioteca Digitale Sta Nascendo
            </h2>
            <p className="text-lg text-text-muted mb-8 max-w-2xl mx-auto">
              Sto preparando uno spazio dedicato dove ogni parola conta, 
              ogni storia ha il suo posto e ogni lettore può immergersi 
              in universi narrativi unici e coinvolgenti.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-medium">
                📚 Lettura Immersiva
              </span>
              <span className="bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium">
                ✍️ Contenuti Esclusivi
              </span>
              <span className="bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-medium">
                🎭 Narrativa Interattiva
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Libri;