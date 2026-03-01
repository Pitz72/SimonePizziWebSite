import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const file = path.join(__dirname, 'src', 'data', 'portfolioData.ts');

let content = fs.readFileSync(file, 'utf8');

content = content.replace(/title:\s*['"](.*?)['"],/g, "slug: '$1',\n      title: '$1',");

fs.writeFileSync(file, content);
console.log("Slug properties successfully injected into portfolioData.ts");
