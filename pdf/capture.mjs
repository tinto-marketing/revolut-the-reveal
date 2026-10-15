// Captura estados congelados dos módulos interativos do moodboard
import { chromium } from 'playwright';
import fs from 'fs';

const OUT = new URL('./shots/', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });
const only = process.argv[2] || 'all';
const meta = fs.existsSync(OUT + 'meta.json') ? JSON.parse(fs.readFileSync(OUT + 'meta.json')) : {};

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
page.on('pageerror', e => console.log('PAGEERR', e.message));
await page.goto('http://localhost:8765/index.html', { waitUntil: 'networkidle' });
await page.addStyleTag({ content: `.grain,.cursor-light,.topbar,.toast,.stage3d__hint,.plan__hint,.plan__tip{display:none!important}
  .reveal{transform:none!important;opacity:1!important}` });
const wait = ms => page.waitForTimeout(ms);
const shot = async (sel, name) => { const el = await page.$(sel); try { await el.screenshot({ path: OUT + name + '.png', timeout: 60000 }); } catch (e) { const b = await el.boundingBox(); await page.screenshot({ path: OUT + name + '.png', clip: { x: b.x, y: Math.max(0,b.y), width: b.width, height: Math.min(b.height, 900) }, timeout: 90000 }); } console.log('ok', name); };

/* ---------- capas: lâminas do hero e capítulos ---------- */
if (only === 'all' || only === 'covers') {
  await page.addStyleTag({ content: `.hero__content,.hero__foot,.chapter__inner{visibility:hidden!important}` });
  await page.evaluate(() => scrollTo(0, 0)); await wait(3500);
  await shot('#entrada', 'cover-hero');
  for (const id of ['conceito', 'espacos']) {
    await page.evaluate(id => document.querySelector(`#${id} .chapter`).scrollIntoView({ block: 'center' }), id); await wait(3000);
    await shot(`#${id} .chapter`, `chapter-${id}`);
  }
  await page.addStyleTag({ content: `.hero__content,.hero__foot,.chapter__inner{visibility:visible!important}` });
}

/* ---------- palco 3D ---------- */
if (only === 'all' || only === 'stage') {
  await page.addStyleTag({ content: `.stage3d__hud,.meters,.stage3d__cams{opacity:0!important}` });
  await page.evaluate(() => document.querySelector('.stage3d__view').scrollIntoView({ block: 'center' }));
  await wait(1500);
  const set = async ({ opt, cam, s, dims }) => {
    await page.click(`.stage3d__tabs .tab[data-opt="${opt}"]`, { force: true });
    await page.click(`.cam[data-cam="${cam}"]`, { force: true });
    const on = await page.$eval('[data-dims]', b => b.classList.contains('is-on'));
    if (on !== dims) await page.click('[data-dims]', { force: true });
    await page.$eval('.stage__range', (r, s) => { r.value = s; r.dispatchEvent(new Event('input')); }, s);
    await wait(2600);
    return page.evaluate(() => ({
      cue: document.querySelector('.stage__cue').textContent,
      clock: document.querySelector('.stage__clock').textContent,
      house: +getComputedStyle(document.querySelector('[data-m=house]')).getPropertyValue('--v'),
      scene: +getComputedStyle(document.querySelector('[data-m=scene]')).getPropertyValue('--v'),
      sceneCol: getComputedStyle(document.querySelector('[data-m=scene]')).getPropertyValue('--mc').trim(),
      key: +getComputedStyle(document.querySelector('[data-m=key]')).getPropertyValue('--v')
    }));
  };
  meta.stage = {};
  const frames = [
    ['tl-00', { opt: '2', cam: 'front', s: 0, dims: false }],
    ['tl-01', { opt: '2', cam: 'front', s: 1.8, dims: false }],
    ['tl-02', { opt: '2', cam: 'front', s: 5.27, dims: false }],
    ['tl-03', { opt: '2', cam: 'front', s: 12, dims: false }],
    ['tl-04', { opt: '2', cam: 'front', s: 15.1, dims: false }],
    ['tl-05', { opt: '2', cam: 'front', s: 20.5, dims: false }],
    ['tl-06', { opt: '2', cam: 'front', s: 25.5, dims: false }],
    ['tl-07', { opt: '2', cam: 'front', s: 29.9, dims: false }],
    ['o1-top', { opt: '1', cam: 'top', s: 29.9, dims: true }],
    ['o2-top', { opt: '2', cam: 'top', s: 29.9, dims: true }],
    ['o1-front', { opt: '1', cam: 'front', s: 29.9, dims: true }],
    ['o2-front', { opt: '2', cam: 'front', s: 29.9, dims: true }],
    ['o1-diag', { opt: '1', cam: 'diag', s: 12, dims: false }],
    ['o2-diag', { opt: '2', cam: 'diag', s: 12, dims: false }],
    ['car-dark', { opt: '2', cam: 'car', s: 12, dims: false }],
    ['car-key', { opt: '2', cam: 'car', s: 29.9, dims: false }]
  ];
  for (const [name, st] of frames) { meta.stage[name] = Object.assign({}, st, await set(st)); await shot('.stage3d__view', 'stage-' + name); }
}

/* ---------- reunião: painéis de planta e lâminas ---------- */
if (only === 'all' || only === 'meet') {
  await page.setViewportSize({ width: 1600, height: 700 });
  await page.addStyleTag({ content: `.meet__meta,.meet__progress,.mm__cap{display:none!important}` });
  for (const i of [4, 5, 6, 7]) {
    await page.evaluate(i => { document.querySelectorAll('.meet__item')[i].scrollIntoView({ block: 'center' }); dispatchEvent(new Event('scroll')); }, i);
    await wait(2600);
    await shot('.meet__frame', `meet-${String(i + 1).padStart(2, '0')}`);
  }
  await page.setViewportSize({ width: 1600, height: 900 });
}

/* ---------- planta 3D em 4 momentos ---------- */
if (only === 'all' || only === 'plan') {
  await page.addStyleTag({ content: `.zone-card{display:none!important} .zone.is-sel rect{fill:transparent!important;stroke:transparent!important}` });
  await page.evaluate(() => document.querySelector('.plan__viewport').scrollIntoView({ block: 'center' }));
  await page.click('[data-view="2d"]', { force: true }); await page.click('[data-view="3d"]', { force: true });
  for (const [name, T] of [['chegada', 0.04], ['aquecimento', 0.33], ['revelacao', 0.58], ['pos', 0.9]]) {
    await page.$eval('.plan__range', (r, T) => { r.value = T; r.dispatchEvent(new Event('input')); }, T);
    await wait(2200);
    await shot('.plan__viewport', 'plan-' + name);
  }
}
fs.writeFileSync(OUT + 'meta.json', JSON.stringify(meta, null, 1));
await browser.close();
