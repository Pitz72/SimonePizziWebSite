/* Sostituisce i segnaposto {{img:chiave}} con le copertine vere codificate in
   base64, così ogni proposta resta un file solo, apribile ovunque e offline.
   Uso:  node docs/design/2026-09-proposte/_sorgenti/build.cjs            */
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const out = path.join(dir, '..');
const covers = JSON.parse(fs.readFileSync(path.join(dir, 'covers.json'), 'utf8'));
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.src.html'))) {
  const src = fs.readFileSync(path.join(dir, f), 'utf8');
  let mancanti = 0;
  const html = src.replace(/\{\{img:([a-z_]+)\}\}/g, (_, k) => {
    if (!covers[k]) { mancanti++; console.log('  ! manca la copertina', k); return ''; }
    return covers[k];
  });
  const dest = path.join(out, f.replace('.src.html', '.html'));
  fs.writeFileSync(dest, html);
  console.log(path.basename(dest), (html.length / 1024).toFixed(0) + ' KB', mancanti ? '(' + mancanti + ' mancanti)' : '');
}
