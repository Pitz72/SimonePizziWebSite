import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Software from './pages/Software';
import Videogiochi from './pages/Videogiochi';
import Contatti from './pages/Contatti';
import GestoreDuplicatiMusicali from './pages/software/GestoreDuplicatiMusicali';
import AudioMetadataConverter from './pages/software/AudioMetadataConverter';
import AdvancedJingleMachine from './pages/software/AdvancedJingleMachine';
import SviluppoVideogiocoIA from './pages/articoli/SviluppoVideogiocoIA';
import TheSafePlaceV100 from './pages/articoli/TheSafePlaceV100';
import LemmonsFortunaSpenta from './pages/articoli/LemmonsFortunaSpenta';
import AperturaSezioniSito from './pages/articoli/AperturaSezioniSito';
import IlRespiroTrattenutoDelMondo from './pages/articoli/IlRespiroTrattenutoDelMondo';
import Corridor2193TheLastRun from './pages/articoli/Corridor2193TheLastRun';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chi-sono" element={<About />} />
          <Route path="/podcast" element={<div className="coming-soon">Sezione Podcast in arrivo presto!</div>} />
          <Route path="/libri" element={<div className="coming-soon">Sezione Libri in arrivo presto!</div>} />
          <Route path="/software" element={<Software />} />
          <Route path="/software/gestore-duplicati-musicali" element={<GestoreDuplicatiMusicali />} />
          <Route path="/software/audio-metadata-converter" element={<AudioMetadataConverter />} />
          <Route path="/software/advanced-jingle-machine" element={<AdvancedJingleMachine />} />
          <Route path="/videogiochi" element={<Videogiochi />} />
          <Route path="/videogiochi/il-respiro-trattenuto-del-mondo" element={<IlRespiroTrattenutoDelMondo />} />
          <Route path="/videogiochi/the-safe-place" element={<TheSafePlaceV100 />} />
          <Route path="/videogiochi/lemmons" element={<LemmonsFortunaSpenta />} />
          <Route path="/contatti" element={<Contatti />} />
          <Route path="/chi-sono/articoli/sviluppo-videogioco-ia" element={<SviluppoVideogiocoIA />} />
          <Route path="/chi-sono/articoli/the-safe-place-v100" element={<TheSafePlaceV100 />} />
          <Route path="/chi-sono/articoli/lemmons-fortuna-spenta" element={<LemmonsFortunaSpenta />} />
          <Route path="/chi-sono/articoli/apertura-sezioni-sito" element={<AperturaSezioniSito />} />
          <Route path="/chi-sono/articoli/il-respiro-trattenuto-del-mondo" element={<IlRespiroTrattenutoDelMondo />} />
          <Route path="/chi-sono/articoli/corridor-2193-the-last-run" element={<Corridor2193TheLastRun />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
