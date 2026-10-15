// Copia o bloco de dados do site (window.REVEAL) para pdf/data.js.
// O PDF lê os mesmos dados do site: espaços, diretrizes, zonas da planta, renders R02.
import fs from 'fs';
const here = new URL('.', import.meta.url).pathname;
const html = fs.readFileSync(here + '../index.html', 'utf8');
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const data = blocks.find(b => b.includes('window.REVEAL = {};'));
if (!data) { console.error('Bloco window.REVEAL não encontrado em index.html'); process.exit(1); }
fs.writeFileSync(here + 'data.js', data.trim() + '\n');
console.log('data.js ok ·', data.split('\n').length, 'linhas');
