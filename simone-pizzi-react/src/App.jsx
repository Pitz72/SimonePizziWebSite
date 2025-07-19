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
          <Route path="/contatti" element={<Contatti />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
