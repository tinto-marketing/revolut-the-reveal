// Gera o PDF a partir de pdf/doc.html.
// Antes de imprimir, troca todos os degradês CSS por imagens: alguns leitores (Firefox, prévia do app,
// pdf.js) não desenham o sombreamento vetorial do Chromium e pintam um rosa de erro no lugar.
import { chromium } from 'playwright';
import fs from 'fs';
const here = new URL('.', import.meta.url).pathname;
const out = process.argv[2] || here + 'out/The-Reveal-Moodboard.pdf';
const PORT = process.env.PORT || 8765;
fs.mkdirSync(here + 'out', { recursive: true });
fs.rmSync(here + 'ras', { recursive: true, force: true }); fs.mkdirSync(here + 'ras', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1123, height: 794 }, deviceScaleFactor: 2.4 });
page.on('pageerror', e => console.log('PAGEERR', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
await page.emulateMedia({ media: 'print' });
await page.goto(`http://localhost:${PORT}/pdf/doc.html`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__report, null, { timeout: 120000 });
const rep = await page.evaluate(() => window.__report);
fs.writeFileSync(here + 'out/report.json', JSON.stringify(rep, null, 1));
if (rep.error) { console.log('ERRO no build.js:', rep.error); process.exit(1); }
console.log('páginas', rep.pages, '· problemas de diagramação', rep.issues.length);
rep.issues.forEach(i => console.log(JSON.stringify(i)));

// marca elementos com degradê (no próprio fundo ou em ::before/::after)
const marks = await page.evaluate(() => {
  const g = s => s && s.includes('gradient');
  const res = []; let id = 0;
  document.querySelectorAll('.page .body *, .page .foot').forEach(el => {
    if (el.closest('svg')) return;
    const own = g(getComputedStyle(el).backgroundImage), b = g(getComputedStyle(el, '::before').backgroundImage), a = g(getComputedStyle(el, '::after').backgroundImage);
    if (!own && !b && !a) return;
    el.dataset.r = ++id; res.push({ id, whole: el.classList.contains('graded') });
  });
  return res;
});
console.log('elementos com degradê', marks.length);
const shotEl = async (sel, path, prep, undo) => {
  await page.evaluate(prep); const el = await page.$(sel); await el.scrollIntoViewIfNeeded();
  await el.screenshot({ path, type: 'jpeg', quality: 90, animations: 'disabled' }); await page.evaluate(undo);
};
// 1) degradês dentro do conteúdo
for (const m of marks) {
  const sel = `[data-r="${m.id}"]`;
  if (m.whole) await shotEl(sel, here + `ras/r${m.id}.jpg`, () => {}, () => {});
  else await shotEl(sel, here + `ras/r${m.id}.jpg`,
    `document.querySelectorAll('[data-r="${m.id}"] > *').forEach(c => { c.dataset.v = c.style.visibility; c.style.visibility = 'hidden'; })`,
    `document.querySelectorAll('[data-r="${m.id}"] > *').forEach(c => { c.style.visibility = c.dataset.v || ''; })`);
}
// 2) fundo de cada página (cor + ::before + sangria), sem o conteúdo
const n = rep.pages;
await page.addStyleTag({ content: '.hidecontent .body, .hidecontent .foot { visibility: hidden !important; }' });
for (let i = 0; i < n; i++) {
  await shotEl(`.page:nth-of-type(${i + 1})`, here + `ras/bg${i + 1}.jpg`, `document.querySelectorAll('.page')[${i}].classList.add('hidecontent')`, `document.querySelectorAll('.page')[${i}].classList.remove('hidecontent')`);
}
// 3) aplica as imagens e desliga os degradês
await page.evaluate(({ marks }) => {
  const st = document.createElement('style');
  st.textContent = `.page::before, .page .bleed { display: none !important; }
    [data-r] { background-image: var(--ras) !important; background-size: 100% 100% !important; background-color: transparent !important; }
    [data-r]::before, [data-r]::after { display: none !important; }`;
  document.head.appendChild(st);
  document.querySelectorAll('.page').forEach((pg, i) => { pg.style.background = `url(ras/bg${i + 1}.jpg) 0 0 / 100% 100% no-repeat`; });
  marks.forEach(m => {
    const el = document.querySelector(`[data-r="${m.id}"]`);
    if (m.whole) { el.classList.remove('graded'); el.innerHTML = `<img src="ras/r${m.id}.jpg" alt="" style="width:100%;height:100%;object-fit:fill">`; el.removeAttribute('data-r'); }
    else el.style.setProperty('--ras', `url(ras/r${m.id}.jpg)`);
  });
}, { marks });
await page.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => {}))));
// fundos aplicados por CSS: espera cada imagem carregar e decodificar antes de imprimir
await page.evaluate(async () => {
  const urls = new Set();
  document.querySelectorAll('.page, [data-r]').forEach(el => { const m = getComputedStyle(el).backgroundImage.match(/url\("?([^")]+)"?\)/); if (m) urls.add(m[1]); });
  await Promise.all([...urls].map(u => new Promise(r => { const im = new Image(); im.onload = () => im.decode().then(r, r); im.onerror = r; im.src = u; })));
});
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1500);
const left = await page.evaluate(() => { const g = s => s && s.includes('gradient'); let c = 0; document.querySelectorAll('*').forEach(el => { const cs = getComputedStyle(el); if (cs.display === 'none') return; if (g(cs.backgroundImage) && !cs.backgroundImage.includes('url(')) c++; ['::before', '::after'].forEach(p => { const ps = getComputedStyle(el, p); if (ps.display !== 'none' && ps.content !== 'none' && g(ps.backgroundImage)) c++; }); }); return c; });
console.log('degradês restantes', left);
await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log('pdf ok →', out);
