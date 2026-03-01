import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirsToRemove = [
    path.join(__dirname, 'dist', 'api', '.data'),
    path.join(__dirname, 'dist', 'uploads')
];

const filesToRemove = [
    path.join(__dirname, 'dist', 'api', 'init_db.php'),
    path.join(__dirname, 'dist', 'api', 'migrate_rate_limit.php')
];

console.log('🧹 Esecuzione clean-dist.js: Pulizia elementi di sicurezza post-build...');

dirsToRemove.forEach((dir) => {
    if (fs.existsSync(dir)) {
        try {
            fs.rmSync(dir, { recursive: true, force: true });
            console.log(`✅ Eliminata con successo la directory sensibile: ${dir}`);
        } catch (err) {
            console.error(`❌ Errore durante l'eliminazione di ${dir}:`, err);
        }
    } else {
        console.log(`ℹ️ La directory ${dir} non esiste in dist, niente da pulire.`);
    }
});

filesToRemove.forEach((file) => {
    if (fs.existsSync(file)) {
        try {
            fs.unlinkSync(file);
            console.log(`✅ Eliminato con successo lo script eseguibile: ${file}`);
        } catch (err) {
            console.error(`❌ Errore durante l'eliminazione di ${file}:`, err);
        }
    } else {
        console.log(`ℹ️ Il file ${file} non esiste in dist.`);
    }
});

console.log('🎉 Pulizia post-build completata. La cartella dist/ è sicura per il caricamento FTP.');
