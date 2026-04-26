import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, 'dist');
const apiPath = path.join(distPath, 'api');

// Directory da rimuovere integralmente
const dirsToRemove = [
    path.join(apiPath, '.data'),
    path.join(distPath, 'uploads'),
    path.join(distPath, 'public'), // Residuo di build errate
    path.join(distPath, '.dh-diag') // Residuo hosting DreamHost
];

// File specifici da rimuovere
const filesToRemove = [
    path.join(apiPath, 'config.php'),
    path.join(apiPath, 'config.example.php'),
    path.join(distPath, 'favicon.gif'),
    path.join(distPath, 'robots.txt'),   // Usiamo robots.php
    path.join(distPath, 'sitemap.xml'),  // Usiamo sitemap.php
];

// Funzione per rimuovere file basati su prefissi/pattern
const removeByPattern = (dir, patterns) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        if (patterns.some(p => file.startsWith(p))) {
            const fullPath = path.join(dir, file);
            try {
                fs.unlinkSync(fullPath);
                console.log(`✅ Rimosso file di servizio/debug: ${file}`);
            } catch (err) {
                console.error(`❌ Errore rimuovendo ${file}:`, err);
            }
        }
    });
};

console.log('🧹 Esecuzione clean-dist.js: Pulizia profonda post-build...');

// 1. Rimozione Directory
dirsToRemove.forEach((dir) => {
    if (fs.existsSync(dir)) {
        try {
            fs.rmSync(dir, { recursive: true, force: true });
            console.log(`✅ Eliminata directory non necessaria: ${path.basename(dir)}`);
        } catch (err) {
            console.error(`❌ Errore durante l'eliminazione di ${dir}:`, err);
        }
    }
});

// 2. Rimozione File Specifici
filesToRemove.forEach((file) => {
    if (fs.existsSync(file)) {
        try {
            fs.unlinkSync(file);
            console.log(`✅ Eliminato file ridondante: ${path.basename(file)}`);
        } catch (err) {
            console.error(`❌ Errore durante l'eliminazione di ${file}:`, err);
        }
    }
});

// 3. Pulizia pattern in /api (debug, test, fix, migrate)
const apiPatterns = ['debug_', 'test_', 'fix_', 'migrate_', 'diag_', 'porting_data', 'check_schema'];
removeByPattern(apiPath, apiPatterns);

console.log('🎉 Pulizia profonda completata. La cartella dist/ è ora "Production Ready".');
