# Changelog

Tutte le modifiche notevoli a questo progetto saranno documentate in questo file.

## [2.2.0] - 2025-01-24 - "Too much is too much"

### 🎯 Obiettivo della Release
Semplificazione drastica del sito web per eliminare gli errori "Maximum update depth exceeded" e migliorare la stabilità generale.

### ✅ Problemi Risolti
- **Eliminati errori "Maximum update depth exceeded"**: Risolti tutti i loop infiniti causati da hook mal configurati
- **Stabilità migliorata**: Sito ora completamente funzionante senza crash
- **Performance ottimizzate**: Ridotto carico computazionale rimuovendo effetti pesanti

### 🗑️ Rimosso
- **Sistema Achievement completo**: Eliminato `useAchievements`, `AchievementPanel` e tutte le funzionalità correlate
- **Easter Eggs**: Rimosso `useEasterEggs` per ridurre complessità
- **Navigation Tracking**: Eliminato `useNavigationTracking` che causava instabilità
- **Effetti Parallax**: Sostituiti tutti i `ParallaxCard` con `Card` normali
- **Hook problematici**: Rimossi `useParallax`, `useMouseParallax`, `useTilt3D`

### 🔧 Modifiche Tecniche
- Corretti dependency array in `useEffect` hooks
- Rimossi callback che causavano re-render infiniti
- Semplificata architettura dei componenti
- Mantenuto `ParticleBackground` come richiesto dall'utente

### 📁 File Modificati
- `src/pages/Home.jsx`: Semplificazione completa, rimozione achievement e parallax
- `src/hooks/useParallax.js`: Corretti loop infiniti (poi rimosso l'uso)
- `src/hooks/useAchievements.js`: Corretti loop infiniti (poi rimosso l'uso)
- `src/hooks/useNavigationTracking.js`: Corretti errori sintassi (poi rimosso l'uso)
- `package.json`: Aggiornata versione a 2.2.0

### 🎨 Interfaccia Utente
- Mantenuta estetica pulita e moderna
- Conservati `AnimatedSection` e `TypewriterText`
- Preservato `ParticleBackground` per effetti visivi
- Sostituiti effetti pesanti con componenti stabili

### 🚀 Risultati
- ✅ Zero errori nel browser
- ✅ Zero errori nel terminale
- ✅ Sito completamente funzionante
- ✅ Performance migliorate
- ✅ Codice più manutenibile

---

## [2.1.1] - Precedente
### Problemi Identificati
- Errori "Maximum update depth exceeded" ricorrenti
- Hook con dependency array problematici
- Troppi effetti simultanei causavano instabilità
- Sistema achievement troppo complesso per il beneficio offerto

---

## Formato
Questo changelog segue il formato [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e questo progetto aderisce al [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### Tipi di Modifiche
- **Added** per nuove funzionalità
- **Changed** per modifiche a funzionalità esistenti
- **Deprecated** per funzionalità che saranno rimosse nelle prossime versioni
- **Removed** per funzionalità rimosse
- **Fixed** per correzioni di bug
- **Security** per vulnerabilità di sicurezza