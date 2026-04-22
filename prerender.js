/**
 * Prerendering Script - Genera file HTML statici per ogni route
 * Eseguito in postbuild per pre-renderizzare la SPA
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateRoutes } from './prerender-routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');

// Leggi il file index.html compilato di Vite
if (!fs.existsSync(INDEX_HTML)) {
  console.error(`❌ ${INDEX_HTML} non trovato. Assicurati di aver eseguito 'npm run build' prima.`);
  process.exit(1);
}

const indexHtmlContent = fs.readFileSync(INDEX_HTML, 'utf-8');

async function prerender() {
  console.log('\n🔨 Inizio pre-rendering delle route...\n');

  try {
    const routes = await generateRoutes();

    if (routes.length === 0) {
      console.warn('⚠️  Nessuna route da pre-renderizzare');
      return;
    }

    let created = 0;
    let skipped = 0;

    for (const route of routes) {
      const routePath = route === '/' ? '' : route;
      const filePath = path.join(DIST_DIR, routePath, 'index.html');
      const dirPath = path.dirname(filePath);

      // Crea directory se non esiste
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Non sovrascrivere se il file esiste già (la root è già presente)
      if (fs.existsSync(filePath)) {
        skipped++;
      } else {
        fs.writeFileSync(filePath, indexHtmlContent, 'utf-8');
        created++;
      }
    }

    console.log(`✅ Pre-rendering completato!`);
    console.log(`   Creati: ${created}`);
    console.log(`   Skip (già presenti): ${skipped}`);
    console.log(`   Totale route: ${routes.length}\n`);

  } catch (err) {
    console.error('❌ Errore durante il pre-rendering:', err.message);
    process.exit(1);
  }
}

prerender();
