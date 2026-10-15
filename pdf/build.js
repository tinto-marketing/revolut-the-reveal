/* Monta o PDF paisagem do moodboard The Reveal: páginas fixas A4, estados congelados dos módulos interativos */
(async () => {
const R = window.REVEAL;
const meta = await (await fetch('shots/meta.json')).json();
const srcHTML = await (await fetch('../index.html')).text();
const SRC = new DOMParser().parseFromString(srcHTML, 'text/html');
const srcFix = h => h.replace(/src="assets\//g, 'src="../assets/').replace(/ loading="lazy"/g, '');
const WM = srcHTML.match(/<svg class="wordmark"[\s\S]*?<\/svg>/)[0].replace('class="wordmark"', 'class="wm"');
const A = p => '../assets/' + p;
const SHORT = 'a|e|o|à|é|as|os|ao|de|do|da|em|no|na|um|se|A|E|O|À|É|As|Os|Ao|De|Do|Da|Em|No|Na|Um';
const tx = s => String(s)
  .replace(/(\d) (m²|m|s|min|K|%)(?=[\s,.;:)]|$)/g, '$1 $2')
  .replace(/ (×|→) /g, ' $1 ')
  .replace(new RegExp(`(?<=^|[\\s(\\u00a0])(${SHORT}) `, 'g'), '$1 ')
  .replace(/ (\S+)$/, ' $1');
const pad2 = n => String(n).padStart(2, '0');
const ZI = Object.fromEntries(R.zones.map((z, i) => [z.id, i]));
const Z = Object.fromEntries(R.zones.map(z => [z.id, z]));
const momentOf = t => t < .2 ? 'Chegada' : t < .45 ? 'Aquecimento' : t < .7 ? 'Revelação' : 'Pós-revelação';
const pages = [];
const SEC = { conceito: 'Conceito', revelacao: 'Revelação do carro', espacos: 'Espaços', reuniao: 'Reunião com cliente', r02: 'Ponto de partida · R02', planta: 'Planta', fim: 'Próximos passos' };

function page({ sec = '', id = '', bg = '#000', glow = '89,144,135', body = '', bleed = '', cls = '', foot = true }) {
  pages.push(`<section class="page ${cls}" ${id ? `id="${id}"` : ''} data-sec="${sec}" style="--bg:${bg};--glow:${glow}">
    ${bleed ? `<div class="bleed">${bleed}</div>` : ''}
    <div class="body">${body}</div>
    ${foot ? `<div class="foot"><span><b>The Reveal</b> · Revolut F1 Team · Casa Fasano</span><span>${SEC[sec] || ''}</span><span class="n"></span></div>` : ''}
  </section>`);
}
const head = (eyebrow, title, lead = '', big = true) => `<div class="head ${lead ? '' : 'head--one'}"><div><p class="eyebrow">${eyebrow}</p><h2 class="${big ? 'h1' : 'h2'}">${title}</h2></div>${lead ? `<p class="lead">${tx(lead)}</p>` : ''}</div>`;
const fig = (src, style = '', extra = '', cls = '') => `<figure class="fig ${cls}" style="${style}"><img src="${src}" alt="">${extra}</figure>`;
const pageRef = id => `<a class="ref" data-ref="${id}" href="#${id}"></a>`;

/* ---------- planta em SVG (recortes congelados) ---------- */
const LBL = { terraco: 'Terraço', backdrop: 'Check-in', housemix: 'House técnica', palco: 'Palco · Carro', pista: 'Pista & bistrôs', led: 'Painéis de LED', instalacao: 'Instalação cartões', bancos: 'Lounge', bar: 'Bar', totem: 'Totem', photo: 'VM · Adidas', deckA: 'Deck Bar', deckB: 'Deck Lounge', chapelaria: 'Chapelaria' };
const NUMPOS = { bancos: [1180, 492], instalacao: [1080, 650], led: [790, 420], palco: [700, 515], housemix: [465, 520], backdrop: [438, 700], totem: [918, 775] };
function planSVG({ focus = [], split = false, flow = false, numbers = false, labels = false, svc = false, aspect = null, pad = 70, dimAll = false, sel = null }) {
  let x0 = 40, y0 = 40, x1 = 1600, y1 = 1052;
  if (focus.length && aspect) {
    const rs = focus.map(id => Z[id].rect);
    x0 = Math.min(...rs.map(r => r[0])) - pad; y0 = Math.min(...rs.map(r => r[1])) - pad;
    x1 = Math.max(...rs.map(r => r[0] + r[2])) + pad; y1 = Math.max(...rs.map(r => r[1] + r[3])) + pad;
  }
  if (sel && aspect) { const [x, y, w, h] = Z[sel].rect; x0 = x - 170; y0 = y - 110; x1 = x + w + 170; y1 = y + h + 110; }
  if (aspect) { const w = x1 - x0, h = y1 - y0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2; let W = w, H = h; if (w / h < aspect) W = h * aspect; else H = w / aspect; x0 = cx - W / 2; x1 = cx + W / 2; y0 = cy - H / 2; y1 = cy + H / 2; }
  let s = `<svg class="plansvg" viewBox="${x0} ${y0} ${x1 - x0} ${y1 - y0}" preserveAspectRatio="xMidYMid meet"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#070605"/>
    <image href="${A('plan/planta-linhas.png')}" x="40" y="40" width="1560" height="1012" preserveAspectRatio="none" opacity=".62"/>`;
  if (dimAll) R.zones.forEach(z => { const [x, y, w, h] = z.rect; s += `<rect class="pz--dim" x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>`; });
  if (sel) { const [x, y, w, h] = Z[sel].rect; s += `<rect class="pz" x="${x}" y="${y}" width="${w}" height="${h}" rx="4" style="stroke-width:6"/>`; }
  focus.forEach((id, k) => { const [x, y, w, h] = Z[id].rect; s += `<rect class="pz ${split && k ? 'pz--alt' : ''}" x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>`; });
  if (flow) s += `<path class="pflow" d="${R.flow}"/><circle cx="60" cy="600" r="9" fill="#E3CA9C"/>`;
  if (labels) focus.forEach((id, k) => { const [x, y, w, h] = Z[id].rect; const t = split ? (k ? 'Deck Lounge' : 'Deck Bar') : LBL[id]; const ly = id === 'backdrop' ? y + h + 30 : y + h / 2 + 8; s += `<text class="plbl" x="${x + w / 2}" y="${ly}" text-anchor="middle">${t}</text>`; });
  if (svc) R.labels.forEach(([x, y, t]) => { s += `<text class="plbl" x="${x}" y="${y}" text-anchor="middle" style="font-size:15px;font-weight:400;fill:rgba(220,209,177,.75)">${t}</text>`; });
  if (numbers) R.zones.forEach((z, i) => { const [x, y, w, h] = z.rect; const [cx, cy] = NUMPOS[z.id] || [x + w / 2, y + h / 2]; s += `<g class="pnum"><circle cx="${cx}" cy="${cy}" r="19"/><text x="${cx}" y="${cy + 7}" text-anchor="middle">${i + 1}</text></g>`; });
  return s + '</svg>';
}

/* =========================================================
   CAPA + SUMÁRIO
   ========================================================= */
page({ cls: 'cover', foot: false, bleed: `<img class="bg" src="img/cover-hero.jpg" alt=""><div class="veil"></div>`, body: `
  <div class="in">
    <div style="display:flex;justify-content:space-between;align-items:center">${WM}<span class="cap" style="color:var(--t2)">Moodboard de cenografia e luz · revisão de 15/10/2026</span></div>
    <div>
      <p class="eyebrow" style="font-size:10pt">Revolut F1 Team · Casa Fasano · São Paulo · revisão 15/10</p>
      <h1 class="display">The Reveal</h1>
      <p class="lead" style="max-width:120mm;margin-top:5mm;font-size:14pt">${tx('Cenografia e luz para a noite da revelação. Um amanhecer em São Paulo, do verde ao âmbar.')}</p>
      <div class="foot2" style="margin-top:9mm"><p class="lbl" style="color:var(--t2);max-width:150mm"><b style="color:#fff">Versão em PDF</b> ${tx('Os módulos interativos do site aparecem aqui congelados em momentos-chave, lado a lado, para comparar e aprovar.')}</p><span class="cap">Montagem e lançamento · 2 a 4/11/2026</span></div>
    </div>
  </div>` });

const TOC = [
  ['01', 'Conceito', 'Um novo amanhecer na cidade · quatro atos de luz', 'sec-conceito'],
  ['02', 'Revelação do carro', 'O palco em 30 segundos · Opção 1 × Opção 2 · key light', 'sec-revelacao'],
  ['03', 'Espaços', 'Moodboard por espaço · referências originais e na paleta', 'sec-espacos'],
  ['04', 'Reunião com cliente', 'As 10 diretrizes de 13/10 e a nossa proposta', 'sec-reuniao'],
  ['05', 'Ponto de partida', 'Renders R02 → direção', 'sec-r02'],
  ['06', 'Planta', 'Implantação Casa Fasano · a luz pela noite · ambientes', 'sec-planta'],
  ['07', 'Próximos passos', 'O que precisamos aprovar e confirmar', 'sec-fim']
];
page({ sec: '', body: `
  <div style="display:grid;grid-template-columns:92mm 1fr;gap:14mm;height:100%">
    <div style="display:flex;flex-direction:column;justify-content:space-between">
      <div><p class="eyebrow">The Reveal · Revolut F1 Team</p><h2 class="h1">Sumário</h2></div>
      <div class="rule"><p class="lbl" style="margin-bottom:1.6mm"><b>Como ler este PDF</b></p>
        <p class="sm">${tx('No site, o palco 3D, a planta e as diretrizes respondem ao cursor e à rolagem. Aqui, cada módulo vira uma sequência de momentos fixos: a revelação de 30 s em oito quadros, as duas opções de LED lado a lado e a planta em quatro horários da noite.')}</p></div>
    </div>
    <ol class="toc" style="align-self:center">${TOC.map(([k, t, s, id]) => `<li><a href="#${id}"><span class="k">${k}</span><span class="t">${t}<small>${tx(s)}</small></span><span class="p" data-ref="${id}"></span></a></li>`).join('')}</ol>
  </div>` });

/* =========================================================
   01 CONCEITO
   ========================================================= */
const NIGHT = [['Deep petrol', '#17423C'], ['Dusty teal', '#599087'], ['Faded cream', '#DCD1B1'], ['Golden amber', '#FFB62A'], ['Burnt orange', '#F78400']];
page({ sec: 'conceito', id: 'sec-conceito', bg: '#0A1D1A', bleed: `<img src="img/chapter-conceito.jpg" alt="" style="position:absolute;left:0;top:0;width:100%;height:62%;object-fit:cover;opacity:.95"><div style="position:absolute;left:0;right:0;top:30%;height:33%;background:linear-gradient(180deg,transparent,#0A1D1A)"></div>`, body: `
  <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:8mm">
    <div><p class="eyebrow">01 · Conceito</p><h2 class="display" style="font-size:46pt;letter-spacing:-.04em">Um novo amanhecer<br>na cidade</h2></div>
    <div style="display:grid;grid-template-columns:1.25fr 1fr;gap:12mm;align-items:end">
      <p class="lead" style="font-size:13pt">${tx('A noite é um tributo a São Paulo: a selva de concreto dos arranha-céus, os corredores da Paulista, o sol refletido na água da calçada e no vidro dos prédios. A narrativa é')} <em>${tx('o nascer do sol antes da corrida')}</em>${tx(', a cidade acordando antes do grande evento.')}</p>
      <div style="padding:5mm;border:.25mm solid var(--line);border-radius:2mm;background:rgba(0,0,0,.35)">
        <p class="lbl" style="margin-bottom:3mm"><b>A luz da noite</b> paleta das cores do cartão</p>
        <div class="bar"></div>
        <div class="bar__names">${NIGHT.map(([n, h]) => `<span><b>${n}</b>${h}</span>`).join('')}</div>
      </div>
    </div>
  </div>` });

const ACTS = [
  ['Chegada', 'loop ambiente', 'luz/luz-04.jpg', 'var(--petrol)', '#0A1D1A', '89,144,135', 'LEDs em verde petróleo e teal, luz baixa e silhuetas. O terraço recebe e a recepção em cromo escovado conduz ao check-in.'],
  ['Revelação do carro', '~30 segundos', 'luz/luz-07.jpg', 'linear-gradient(90deg,var(--teal),var(--cream),var(--amber))', '#0B1311', '220,209,177', 'A transformação acontece nos LEDs: blackout, pulso verde, speed lines, beat drop e amanhecer em ~30 s. O carro fica sempre em luz branca neutra.'],
  ['Revelação do cartão', 'instalação', 'expo/expo-02.jpg', 'var(--cream)', '#12110C', '220,209,177', 'O cartão como protagonista: volumes tridimensionais, profundidade infinita, nada de vitrine convencional.'],
  ['Pós-revelação', 'loop ambiente', 'luz/luz-06.jpg', 'linear-gradient(90deg,var(--amber),var(--burnt))', '#170E05', '247,132,0', 'Âmbar dourado e laranja queimado. O LED do palco e os painéis da varanda mostram o mesmo nascer do sol.']
];
page({ sec: 'conceito', bg: '#0A1D1A', body: `
  ${head('Narrativa', 'Quatro atos de luz', 'Os LEDs conduzem a noite: palco, laterais e painéis transparentes da varanda mudam juntos. Cada ato tem a sua cor.', false)}
  <ol style="list-style:none;flex:1;min-height:0;display:grid;grid-template-columns:repeat(4,1fr);gap:4mm;align-items:center">
    ${ACTS.map(([n, s, img, sw, bg, gl, t], i) => `<li style="display:flex;flex-direction:column;gap:2.6mm;padding:3.4mm;border-radius:2mm;background:radial-gradient(90% 60% at 50% 0%, rgba(${gl},.28), transparent 75%), ${bg};border:.25mm solid var(--line);min-height:0">
      <p class="lbl"><b>${pad2(i + 1)} · ${n}</b><span style="color:var(--t3)">${s}</span></p>
      ${fig(A('img/' + img), 'aspect-ratio:4/5;flex:none')}
      <span style="display:block;height:1.2mm;border-radius:1mm;background:${sw};flex:none"></span>
      <p class="sm" style="flex:none">${tx(t)}</p></li>`).join('')}
  </ol>` });

/* =========================================================
   02 REVELAÇÃO
   ========================================================= */
const ST = meta.stage;
const meters = st => `<div class="meters"><div class="meter"><span>Ambiente</span><i style="--v:${st.house};--mc:#F3E6CC"></i></div><div class="meter"><span>Cena</span><i style="--v:${st.scene};--mc:${st.sceneCol}"></i></div><div class="meter"><span>Key carro</span><i style="--v:${st.key};--mc:#fff"></i></div></div>`;
const OPT = { 1: ['Opção 1', 'Como está na planta · laterais recuados'], 2: ['Opção 2', 'Laterais a 45° · encaixados no central'] };
page({ sec: 'revelacao', id: 'sec-revelacao', bg: '#050706', body: `
  ${head('02 · Revelação do carro', 'O palco em 30 segundos', 'Modelo em escala: palco de 12,00 × 5,00 m com 0,70 m de altura (previsão), LED de 4 + 12 + 4 m e carro de 4,58 × 2,00 m a 23,6°, centralizado, sob pé-direito de 3,95 m. Vista aérea das duas configurações dos painéis laterais.')}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:7mm;flex:none">
    ${[1, 2].map(o => `<div style="display:grid;gap:2.4mm">${fig(`img/stage-o${o}-top.jpg`, 'aspect-ratio:16/9', `<span class="pill ${o === 2 ? '' : ''} badge">${OPT[o][0]}</span>`)}<p class="lbl"><b>${OPT[o][0]}</b><span style="color:var(--t2)">${OPT[o][1]}</span></p></div>`).join('')}
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7mm;flex:none">
    <div class="rule"><p class="lbl" style="margin-bottom:1.4mm"><b>Opção 1</b> como está na planta</p><p class="sm">${tx('Três painéis paralelos. Os laterais de 4,00 m ficam recuados 1,00 m, encostados nas quinas do central. A cidade é lida de frente, como uma tela única.')}</p></div>
    <div class="rule"><p class="lbl" style="margin-bottom:1.4mm"><b>Opção 2</b> laterais a 45°</p><p class="sm">${tx('Os painéis 1 e 3 giram 45° a partir das quinas do painel 2 e se encaixam nele. Avançam cerca de 2,83 m para os lados do palco, sem ocupar o palco. A imagem abraça o carro e a cidade abre em perspectiva.')}</p></div>
    <div class="rule"><p class="lbl" style="margin-bottom:1.4mm"><b>Premissas</b> a confirmar</p><p class="sm">${tx('Palco e carro centralizados, palco a 0,70 m (previsão) e LED a 3,50 m. Medida real do carro e sistema de retirada do tecido a confirmar. O DJ sai do palco.')}</p></div>
  </div>` });

page({ sec: 'revelacao', bg: '#050706', body: `
  ${head('02 · Revelação do carro · comparação', 'Opção 1 × Opção 2, das mesmas câmeras', '', false)}
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:44mm 1fr 1fr;grid-template-rows:auto 1fr 1fr;gap:3mm 6mm">
    <span></span>${[1, 2].map(o => `<p class="lbl"><b>${OPT[o][0]}</b><span style="color:var(--t2)">${OPT[o][1]}</span></p>`).join('')}
    <div class="rule" style="align-self:start"><p class="lbl"><b>Vista do público</b></p><p class="sm" style="margin-top:1mm">${tx('Estado âmbar, 29,9 s, com cotas. Na Opção 2 os laterais avançam e fecham a moldura do carro.')}</p></div>
    ${[1, 2].map(o => fig(`img/stage-o${o}-front.jpg`, 'aspect-ratio:16/9;align-self:start')).join('')}
    <div class="rule" style="align-self:start"><p class="lbl"><b>Vista diagonal</b></p><p class="sm" style="margin-top:1mm">${tx('Speed lines, 12 s. Os feixes e a imagem do LED em perspectiva, sem cotas.')}</p></div>
    ${[1, 2].map(o => fig(`img/stage-o${o}-diag.jpg`, 'aspect-ratio:16/9;align-self:start')).join('')}
  </div>` });

const CUEDESC = {
  'tl-00': 'Antes da revelação. Verde petróleo e teal, ambiente a 70%, carro coberto pela penumbra.',
  'tl-01': 'Cena desce para 0. Luz ambiente cai para 15%, nunca apaga.',
  'tl-02': 'LED e washes pulsam em petróleo e teal, com o motor no som.',
  'tl-03': 'Conteúdo do LED corre pelos 3 painéis. Moving heads varrem a sala.',
  'tl-04': 'Strobe branco sincronizado ao drop (timecode). O tecido sai do carro (sistema a definir).',
  'tl-05': 'Wash sobe do piso. O LED vira o nascer do sol sobre a cidade.',
  'tl-06': 'Elipsoidais 5600K com recorte acendem só no carro.',
  'tl-07': 'Ambiente volta a 60%. Salão, deck e varanda entram juntos.'
};
const frame = k => { const st = ST[k]; const cue = st.cue === 'Chegada · antes da revelação' ? 'Chegada' : st.cue; return fig(`img/stage-${k}.jpg`, 'aspect-ratio:16/9;min-height:0', `<div class="ov"><div><p class="ov__t">${st.s.toFixed(1).replace('.', ',')}<small>/ 30 s</small></p><p class="ov__cue">${cue}</p><p class="ov__d">${tx(CUEDESC[k])}</p></div>${meters(st)}</div>`); };
[['tl-00', 'tl-01', 'tl-02', 'tl-03'], ['tl-04', 'tl-05', 'tl-06', 'tl-07']].forEach((ks, pi) => page({ sec: 'revelacao', bg: '#050706', body: `
  ${head(`02 · Revelação do carro · Opção 2, vista do público · ${pi + 1}/2`, pi ? 'Do beat drop ao estado âmbar' : 'Do estado de chegada às speed lines', '', false)}
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:5mm 7mm;justify-items:center">${ks.map(frame).join('').replace(/aspect-ratio:16\/9;min-height:0/g, 'aspect-ratio:16/9;height:100%;max-width:100%')}</div>` }));

const G4 = R.guides[3];
page({ sec: 'revelacao', bg: '#0B0806', glow: '255,182,42', body: `
  ${head('02 · Revelação do carro · key light', 'O carro sempre em luz branca neutra', 'A cena colorida banha o fundo, o piso e o público, nunca a pintura do carro. Câmera junto ao carro, Opção 2.')}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:7mm;flex:none">
    <div style="display:grid;gap:2.4mm">${fig('img/stage-car-dark.jpg', 'aspect-ratio:16/9', '<span class="pill badge">12,0 s · Speed lines</span>')}<p class="sm"><b style="color:#fff">${tx('Key light desligada.')}</b> ${tx('O carro fica em silhueta; a cor da cena não toca a pintura.')}</p></div>
    <div style="display:grid;gap:2.4mm">${fig('img/stage-car-key.jpg', 'aspect-ratio:16/9', '<span class="pill pill--on badge">29,9 s · Estado âmbar</span>')}<p class="sm"><b style="color:#fff">${tx('Key light acesa.')}</b> ${tx('Branco neutro só no carro, com o âmbar em volta.')}</p></div>
  </div>
  <div style="display:grid;grid-template-columns:62mm 1fr 1fr;gap:7mm;align-items:start;flex:none" class="rule">
    ${fig(A('img/renders-r02/r02_0003.jpg'), 'aspect-ratio:16/9', '<span class="pill badge">R02 · o que se evita</span>')}
    <div><p class="lbl" style="margin-bottom:1.4mm"><b>No R02</b></p><p class="sm">${tx('O carro banhado pela luz âmbar do ambiente: a cor da pintura muda.')}</p></div>
    <div><p class="lbl" style="margin-bottom:1.4mm"><b>Nossa proposta</b></p><p class="sm">${tx(G4.ans)}</p></div>
  </div>` });

/* =========================================================
   03 ESPAÇOS
   ========================================================= */
const SP = R.spaces;
page({ sec: 'espacos', id: 'sec-espacos', bg: '#0B100E', glow: '220,209,177', bleed: `<img src="img/chapter-conceito.jpg" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scaleX(-1);filter:sepia(.5) saturate(1.4) hue-rotate(-12deg);opacity:.9"><div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.85),rgba(0,0,0,.2) 70%)"></div>`, body: `
  <div style="flex:1;display:grid;grid-template-columns:1fr 104mm;gap:14mm;align-items:end">
    <div><p class="eyebrow">03 · Espaços</p><h2 class="display" style="font-size:52pt;letter-spacing:-.04em">Moodboard<br>por espaço</h2>
      <p class="lead" style="margin-top:6mm;max-width:120mm">${tx('Sete espaços, na ordem do fluxo do convidado. Cada referência leva um número; a legenda fica ao lado das imagens.')}</p></div>
    <ol class="toc">${SP.map((s, i) => `<li><a href="#space-${s.id}"><span class="k">${pad2(i + 1)}</span><span class="t" style="font-size:11.5pt">${s.name}<small>${s.imgs.length} ${s.imgs.length > 1 ? 'referências' : 'referência'} · pico na noite: ${momentOf(s.t)}</small></span><span class="p" data-ref="space-${s.id}"></span></a></li>`).join('')}</ol>
  </div>` });

const spaceSide = (sp, i, imgs, part = '') => `
  <span class="eyebrow" style="margin:0"><i>Espaço ${i + 1} de ${SP.length}</i>${part}</span>
  <h3 class="h2">${sp.name}</h3>
  <p class="sm" style="font-size:8.4pt">${tx(sp.text)}</p>
  <div><div class="bar" style="height:1.4mm;border-radius:1mm"><i style="position:absolute;top:50%;left:${sp.t * 100}%;width:3mm;height:3mm;border-radius:50%;background:#fff;transform:translate(-50%,-50%);box-shadow:0 0 0 .6mm #000,0 0 2mm rgba(${sp.glow},1)"></i></div><p class="cap" style="margin-top:1.6mm">Pico na noite: ${momentOf(sp.t)}</p></div>
  <div class="tags">${sp.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>`;
const capList = (imgs, start = 0) => `<ol class="caplist">${imgs.map((im, k) => `<li><span class="num">${start + k + 1}</span><span>${tx(im[1])}</span></li>`).join('')}</ol>`;
const jg = (sp, imgs, start = 0) => `<div class="jg" data-items='${JSON.stringify(imgs.map((im, k) => ({ src: A(`img/${sp.id}/${im[0]}`), n: start + k + 1 })))}'></div>`;
function spacePage(sp, i, imgs, start, part, id) {
  page({ sec: 'espacos', id, bg: sp.bg, glow: sp.glow, body: `
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:78mm 1fr;gap:8mm">
      <div style="display:flex;flex-direction:column;gap:3mm;min-height:0">${spaceSide(sp, i, imgs, part)}<div class="rule" style="margin-top:auto">${capList(imgs, start)}</div></div>
      <div style="display:flex;min-height:0">${jg(sp, imgs, start)}</div>
    </div>` });
}
SP.forEach((sp, i) => {
  if (sp.id === 'photo-op' || sp.id === 'mobiliario') return;
  if (sp.imgs.length > 8) { const h = Math.ceil(sp.imgs.length / 2); spacePage(sp, i, sp.imgs.slice(0, h), 0, ' · 1/2', 'space-' + sp.id); spacePage(sp, i, sp.imgs.slice(h), h, ' · 2/2'); }
  else spacePage(sp, i, sp.imgs, 0, '', 'space-' + sp.id);
});
// Photo Op + Mobiliário: dois espaços curtos na mesma página
{
  const pair = SP.filter(s => s.id === 'photo-op' || s.id === 'mobiliario');
  page({ sec: 'espacos', id: 'space-photo-op', bg: '#170D05', glow: '247,132,0', body: `
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:10mm">
      ${pair.map(sp => { const i = SP.indexOf(sp); return `<div ${sp.id === 'mobiliario' ? 'id="space-mobiliario"' : ''} style="display:grid;grid-template-columns:58mm 1fr;gap:5mm;min-height:0">
        <div style="display:flex;flex-direction:column;gap:3mm;min-height:0">${spaceSide(sp, i, sp.imgs)}<div class="rule" style="margin-top:auto">${capList(sp.imgs)}</div></div>
        <div style="display:flex;min-height:0">${jg(sp, sp.imgs)}</div></div>`; }).join('<span style="position:absolute;left:50%;top:0;bottom:0;border-left:.25mm solid var(--line)"></span>')}
    </div>` });
}
// Original × na paleta (o botão de tratamento das imagens, congelado)
const GR = [['luz', 'luz-04.jpg', 'Luz · Fórmula 1 / 01'], ['espaco', 'espaco-03.jpg', 'Entrada & Espaço / 01'], ['dj', 'dj-04.jpg', 'DJ & Palco / 04'], ['bar', 'bar-04.jpg', 'Bar / 01']];
page({ sec: 'espacos', bg: '#0B100E', glow: '220,209,177', body: `
  ${head('03 · Espaços · tratamento das imagens', 'Original × na paleta', 'No site, um botão passa todas as referências para a paleta do cartão. Aqui, quatro delas nos dois estados.', false)}
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:30mm repeat(4,1fr);grid-template-rows:auto 1fr 1fr;gap:3mm 5mm">
    <span></span>${GR.map(g => `<p class="cap" style="color:var(--t2)">${g[2]}</p>`).join('')}
    <div class="rule" style="align-self:start"><p class="lbl"><b>Original</b></p><p class="cap" style="margin-top:1mm">${tx('Como na pasta de referências')}</p></div>
    ${GR.map(g => fig(A(`img/${g[0]}/${g[1]}`), 'min-height:0')).join('')}
    <div class="rule" style="align-self:start"><p class="lbl"><b>Na paleta</b></p><p class="cap" style="margin-top:1mm">${tx('Do petróleo ao laranja queimado')}</p></div>
    ${GR.map(g => fig(A(`img/${g[0]}/${g[1]}`), 'min-height:0', '', 'graded')).join('')}
  </div>` });

// Pranchas novas da revisão 15/10 (o conteúdo vem do site: #board-*)
const BOARD = (id, glow, bg) => {
  const el = SRC.getElementById(id), side = el.querySelector('.board__side'), main = el.querySelector('.board__main');
  const title = side.querySelector('h3').textContent, lead = side.querySelector('.body').textContent;
  const tags = [...side.querySelectorAll('.space__tags li')].map(li => `<span class="tag">${li.textContent}</span>`).join('');
  page({ sec: 'espacos', id: 'pdf-' + id, bg, glow, body: `
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:78mm 1fr;gap:9mm">
      <div style="display:flex;flex-direction:column;gap:3mm"><p class="eyebrow"><i>Prancha nova</i> · revisão 15/10</p><h2 class="h1" style="font-size:24pt">${title}</h2><p class="txt">${tx(lead)}</p><div class="tags">${tags}</div></div>
      <div class="board" style="min-height:0">${srcFix(main.innerHTML)}</div>
    </div>` });
};
BOARD('board-externa', '89,144,135', '#0A1D1A');
BOARD('board-led-varanda', '220,209,177', '#0B1311');
BOARD('board-mobiliario', '255,182,42', '#1A1208');

/* =========================================================
   04 REUNIÃO
   ========================================================= */
const GG = R.guides;
const groups = [...new Set(GG.map(g => g.group))];
page({ sec: 'reuniao', id: 'sec-reuniao', bg: '#0A1D1A', body: `
  ${head('04 · Reunião com cliente · 13/10', 'O que o cliente pediu<br>e como respondemos', 'Dez diretrizes de cenografia e luz, em três grupos. As respostas são uma proposta inicial, a validar com os fornecedores.')}
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(3,1fr);gap:8mm;align-content:end">
    ${groups.map(gr => `<div class="rule"><p class="lbl" style="margin-bottom:3mm"><b>${gr}</b></p><ol class="caplist" style="gap:2.6mm">${GG.map((g, i) => g.group === gr ? `<li><span class="num">${i + 1}</span><span style="font-size:9pt">${tx(g.ask)}</span></li>` : '').join('')}</ol></div>`).join('')}
  </div>` });

const LINKID = { planta: 'sec-planta', revelacao: 'sec-revelacao', entrada: 'sec-espacos', 'space-bar': 'space-bar', 'space-expo': 'space-expo', 'space-espaco': 'space-espaco', 'space-photo-op': 'space-photo-op', 'space-mobiliario': 'space-mobiliario' };
const LINKTXT = { planta: 'Planta', revelacao: 'Palco 3D', entrada: 'Espaços', 'space-bar': 'Referências de bar', 'space-expo': 'Referências de expo', 'space-espaco': 'Referências de entrada', 'space-photo-op': 'Photo Op', 'space-mobiliario': 'Mobiliário' };
function media(g) {
  const m = g.media;
  if (m.type === 'img') return fig(A(m.src.replace('assets/', '')), 'flex:1;min-height:0');
  if (m.type === 'fins') return fig('img/meet-08.jpg', 'flex:1;min-height:0');
  if (m.type === 'plan') return `<figure class="fig" style="flex:1;min-height:0">${planSVG({ focus: m.zones, split: m.split, flow: m.flow, labels: true, aspect: 1.36, pad: m.flow ? 120 : 90 })}</figure>`;
  if (m.type === 'dawn') return `<figure class="fig" style="flex:1;min-height:0"><div class="dawnbox"><div class="bar bar--dawn">${[0, 20, 45, 70].map(p => `<span class="dawn__m" style="left:${p}%"></span>`).join('')}</div><div class="dawn__ticks">${[['Chegada', 0, 'verde petróleo'], ['Aquecimento', 20, 'teal → creme'], ['Revelação', 45, 'creme → âmbar'], ['Pós-revelação', 70, 'âmbar e laranja']].map(([n, p, d]) => `<span style="left:${p}%"><b>${n}</b>${d}</span>`).join('')}</div></div></figure>`;
}
const MCAP = g => g.media.type === 'dawn' ? 'Do verde ao âmbar: 4 estados ao longo da noite' : g.media.type === 'fins' ? 'Protótipo do backdrop: lâminas que acendem com quem passa' : g.media.cap;
for (let p = 0; p < GG.length; p += 2) {
  page({ sec: 'reuniao', bg: GG[p].bg, glow: GG[p].glow, body: `
    <p class="eyebrow" style="flex:none">04 · Reunião com cliente · diretrizes ${pad2(p + 1)} e ${pad2(p + 2)} de ${GG.length}</p>
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:minmax(0,1fr);gap:9mm">
      ${[GG[p], GG[p + 1]].map((g, k) => `<div class="guide" style="--glow:${g.glow}">
        ${media(g)}<p class="cap" style="margin-top:-.6mm">${tx(MCAP(g))}</p>
        <p class="guide__n">${pad2(p + k + 1)} · ${g.group}</p>
        <p class="guide__ask">${tx(g.ask)}</p>
        <p class="guide__ans"><b>Nossa proposta</b>${tx(g.ans.replace(/\s*Mova o cursor sobre o painel\./, ''))}</p>
        <p class="cap">Ver também: ${LINKTXT[g.link[0]]}, página <a data-ref="${LINKID[g.link[0]]}" href="#${LINKID[g.link[0]]}" class="tnum"></a></p>
      </div>`).join('')}
    </div>` });
}

/* =========================================================
   05 R02
   ========================================================= */
const RR = R.renders;
const r02row = ([f, title, now, next, link], i, iw) => `<article class="r02" style="grid-template-columns:${iw}mm 1fr">
  ${fig(A('img/renders-r02/' + f), 'aspect-ratio:16/9')}
  <div><span class="cap">R02 · ${pad2(i + 1)} / ${pad2(RR.length)}</span><h3 class="h2" style="margin-top:1mm">${title}</h3>
    <div class="diff"><p><b>No R02</b>${tx(now)}</p><p class="to"><b>Direção</b>${tx(next)}</p></div>
    <p class="cap" style="margin-top:2.6mm">Ver: ${LINKTXT[link] || 'Planta'}, página <a data-ref="${LINKID[link]}" href="#${LINKID[link]}" class="tnum"></a></p></div>
</article>`;
const STEPS = `<ol class="steps" style="list-style:none">
  <li class="step on"><span class="cap">Agora</span><b>Aprovação do moodboard</b><span>Luz, palco e referências por espaço</span></li>
  <li class="step"><span class="cap">Depois</span><b>Planta revisada</b><span>${tx('Entrada sem pórtico, palco e carro centralizados, DJ 3 × 6 m, varanda')}</span></li>
  <li class="step"><span class="cap">Depois</span><b>Renders R03</b><span>${tx('Entrada, palco, VM, bar, lounge e vista geral na nova planta')}</span></li>
  <li class="step"><span class="cap">Depois</span><b>Projeto de luz e cue list</b><span>${tx('Revelação de 30 s em timecode')}</span></li></ol>`;
for (let p = 0; p < RR.length; p += 2) {
  const rows = RR.slice(p, p + 2);
  const first = p === 0, last = p + 2 >= RR.length;
  page({ sec: 'r02', id: first ? 'sec-r02' : '', bg: '#0B0B0A', glow: '220,209,177', body: `
    ${first ? head('05 · Ponto de partida', 'Renders R02 → direção', 'Os renders de 23/09 geraram os pedidos de alteração. Para cada vista, o que muda. Depois da aprovação, planta e renders (R03) são refeitos nesta direção.') : `<p class="eyebrow" style="flex:none">05 · Ponto de partida · renders R02 → direção</p>`}
    <div style="flex:1;min-height:0;display:flex;flex-direction:column;justify-content:${last ? 'flex-start' : 'space-around'};gap:7mm">
      ${rows.map((r, k) => r02row(r, p + k, first ? 114 : last ? 150 : 138)).join('<hr style="border:0;border-top:.25mm solid var(--line)">')}
      ${last ? `<div class="rule" style="margin-top:auto"><p class="lbl" style="margin-bottom:3mm"><b>Daqui em diante</b><span style="color:var(--t2)">a sequência depois da aprovação</span></p>${STEPS}</div>` : ''}
    </div>` });
}

/* =========================================================
   06 PLANTA
   ========================================================= */
page({ sec: 'planta', id: 'sec-planta', bg: '#120C06', glow: '255,182,42', body: `
  ${head('06 · Implantação Casa Fasano', 'Planta e ambientes', 'Ante-projeto do Studio Sarrafo (1:150, 13/10), sujeito a revisão depois desta aprovação. Ambientes numerados e o fluxo do convidado, do terraço ao deck.')}
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 74mm;gap:8mm">
    <figure class="fig" style="aspect-ratio:1560/1012;align-self:start;max-height:100%">${planSVG({ dimAll: true, flow: true, numbers: true, svc: true })}</figure>
    <div style="display:flex;flex-direction:column;gap:3mm;min-height:0">
      <ol class="legend">${R.zones.map((z, i) => `<li><span class="num">${i + 1}</span><span>${z.name}<span>${tx(z.dims)}</span></span></li>`).join('')}</ol>
      <p class="cap rule" style="margin-top:auto"><span style="display:inline-block;width:9mm;border-top:.6mm dotted var(--surface-a);vertical-align:middle;margin-right:2mm"></span>${tx('Fluxo do convidado: terraço, recepção e check-in, salão, e daí bar, VM e varanda. Planta v01, a revisar na v02.')}</p>
    </div>
  </div>` });

const MOM = [
  ['chegada', 'Chegada', 'Verde petróleo e teal em todos os ambientes, varanda incluída. Ambiente quente a 70%, LEDs em teal e carro no escuro.'],
  ['aquecimento', 'Aquecimento', 'A onda de cor começa no terraço e avança pelo salão até a varanda, do teal ao creme.'],
  ['revelacao', 'Revelação', 'Ambiente cai para 45%. Os 30 s da revelação passam pelo LED do palco e pelos painéis transparentes da varanda.'],
  ['pos', 'Pós-revelação', 'Âmbar e laranja queimado no salão e na varanda, integrados pelos LEDs. Nascer do sol no palco e key light branca no carro.']
];
page({ sec: 'planta', bg: '#120C06', glow: '255,182,42', body: `
  ${head('06 · Planta · a luz pela noite', 'Quatro momentos, a mesma planta', '', false)}
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:5mm 7mm">
    ${MOM.map(([k, n, d], i) => fig(`img/plan-${k}.jpg`, 'min-height:0', `<div style="position:absolute;left:3mm;top:2.6mm;right:3mm;display:grid;grid-template-columns:auto 1fr;gap:3mm;align-items:start"><span class="pill ${i === 3 ? 'pill--on' : ''}">${pad2(i + 1)} · ${n}</span><p class="sm" style="font-size:7.3pt;max-width:70mm">${tx(d)}</p></div>`, 'fig--contain')).join('')}
  </div>` });

const ZP = [R.zones.slice(0, 7), R.zones.slice(7)];
ZP.forEach((zs, pi) => page({ sec: 'planta', bg: '#120C06', glow: '255,182,42', body: `
  ${head(`06 · Planta · ambientes ${pi + 1}/2`, pi ? 'Lounge, bar, VM e varanda' : 'Da entrada ao palco', '', false)}
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:1fr 1fr;gap:4mm">
    ${zs.map(z => { const i = ZI[z.id]; return `<article class="zc">
      <div class="zc__loc">${planSVG({ sel: z.id, aspect: 62 / 24, focus: [], pad: 0 })}</div>
      <div class="zc__head"><span class="num">${i + 1}</span><div><p class="zc__t">${z.name}</p><p class="zc__d">${tx(z.dims)}</p></div></div>
      <p class="zc__x">${tx(z.text)}</p>
      <div class="tags" style="margin-top:auto">${z.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div></article>`; }).join('')}
  </div>` }));

{
  const pn = SRC.querySelector('.plan-next');
  const items = [...pn.querySelectorAll('.board__list li')].map(li => { const st = li.querySelector('.status'); const t = li.querySelector('span').cloneNode(true); t.querySelector('.status')?.remove(); return { k: li.querySelector('b').textContent, t: t.textContent.trim(), st: st.textContent, ok: st.classList.contains('status--ok') }; });
  const half = Math.ceil(items.length / 2);
  const col = list => `<ul class="board__list board__list--st">${list.map(it => `<li><b>${it.k}</b><span>${tx(it.t)}</span><i class="status ${it.ok ? 'status--ok' : 'status--wait'}">${it.st}</i></li>`).join('')}</ul>`;
  page({ sec: 'planta', id: 'sec-planta-v02', bg: '#120C06', glow: '255,182,42', body: `
    ${head('06 · Planta revisada', 'O que muda na v02', 'A planta destas páginas é a v01. Estes pontos entram na versão revisada do Studio Sarrafo; o que não está decidido aparece como tal.')}
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:10mm">${col(items.slice(0, half))}${col(items.slice(half))}</div>` });
}

/* =========================================================
   07 PRÓXIMOS PASSOS
   ========================================================= */
page({ sec: 'fim', id: 'sec-fim', bg: '#0A1D1A', body: `
  ${head('07 · Próximos passos', 'O que precisamos aprovar e confirmar', 'Com estas respostas, a planta v02 do Studio Sarrafo e os renders R03 seguem nesta direção.')}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10mm;flex:none">
    <div class="rule"><p class="lbl" style="margin-bottom:3mm"><b>Aprovar</b></p><ol class="caplist" style="gap:2.6mm">
      ${['O moodboard revisado: luz, palco e referências por espaço.', 'A configuração do LED: Opção 1 (laterais recuados) ou Opção 2 (laterais a 45°).', 'A setorização da varanda: duas zonas ou área reduzida.', 'Letras espelhadas como branding e o banco Paulistano no terraço.'].map((t, i) => `<li><span class="num">${i + 1}</span><span style="font-size:8.6pt">${tx(t)}</span></li>`).join('')}</ol></div>
    <div class="rule"><p class="lbl" style="margin-bottom:3mm"><b>Confirmar</b></p><ol class="caplist" style="gap:2.6mm">
      ${['Altura do palco (prevista 0,70 m) e medida real do carro.', 'Sistema de retirada do tecido na revelação.', 'Posição do DJ (3 × 6 m) e da house técnica (5 ou 6 m).', 'Dimensões dos LEDs da varanda e área mínima de 200 m².', 'Saída de serviço de 1,58 m e área de fumantes.'].map((t, i) => `<li><span class="num">${i + 4}</span><span style="font-size:8.6pt">${tx(t)}</span></li>`).join('')}</ol></div>
  </div>
  <div style="flex:none">${STEPS}</div>
  <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;gap:10mm" class="rule">
    <div>${WM.replace('class="wm"', 'class="wm" style="height:9mm"')}<p class="cap" style="margin-top:3mm;max-width:150mm">${tx('The Reveal · Revolut F1 Team · Casa Fasano, São Paulo · moodboard de cenografia e luz, out/2026. Planta: Studio Sarrafo (ante-projeto) · Paleta: BR_ARF1_Activation_Creative · Referências: REF Moodboard.')}</p></div>
    <div style="text-align:right"><p class="cap">Versão interativa (palco 3D e planta)</p><a class="cap" href="https://revolut-the-reveal.netlify.app" style="color:var(--cream)">revolut-the-reveal.netlify.app</a></div>
  </div>` });

/* ---------- montagem ---------- */
const doc = document.getElementById('doc');
doc.innerHTML = pages.join('');
await document.fonts.ready;
await Promise.all([...document.images].map(im => im.decode().catch(() => {})));

// grades justificadas (sem corte, sem estouro)
const natural = src => new Promise(r => { const im = new Image(); im.onload = () => r(im.naturalWidth / im.naturalHeight); im.onerror = () => r(1); im.src = src; });
for (const box of document.querySelectorAll('.jg')) {
  const items = JSON.parse(box.dataset.items);
  for (const it of items) it.ar = await natural(it.src);
  const W = box.clientWidth, H = box.clientHeight, gap = 8;
  let best = null;
  for (let rows = 1; rows <= items.length; rows++) {
    const total = items.reduce((a, b) => a + b.ar, 0), target = total / rows; const parts = []; let cur = [], acc = 0;
    items.forEach((it, i) => { cur.push(it); acc += it.ar; const left = items.length - i - 1, need = rows - parts.length - 1; if (need > 0 && (acc + (items[i + 1] ? items[i + 1].ar / 2 : 0) >= target || left === need)) { parts.push(cur); cur = []; acc = 0; } });
    if (cur.length) parts.push(cur);
    if (parts.length !== rows) continue;
    const hs = parts.map(p => (W - gap * (p.length - 1)) / p.reduce((a, b) => a + b.ar, 0));
    const sumH = hs.reduce((a, b) => a + b, 0), s = Math.min(1, (H - gap * (rows - 1)) / sumH);
    const area = parts.reduce((a, p, r) => a + p.reduce((q, it) => q + (hs[r] * s) ** 2 * it.ar, 0), 0);
    if (!best || area > best.area) best = { parts, hs, s, area };
  }
  const { parts, hs, s } = best; let y = 0;
  const blockH = hs.reduce((a, b) => a + b * s, 0) + gap * (parts.length - 1);
  y = Math.max(0, (H - blockH) / 2);
  parts.forEach((p, r) => {
    const h = hs[r] * s, rowW = p.reduce((a, it) => a + h * it.ar, 0) + gap * (p.length - 1); let x = Math.max(0, (W - rowW) / 2);
    p.forEach(it => { const w = h * it.ar; box.insertAdjacentHTML('beforeend', `<figure class="fig" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><img src="${it.src}" alt=""><span class="num">${it.n}</span></figure>`); x += w + gap; });
    y += h + gap;
  });
}
await Promise.all([...document.images].map(im => im.decode().catch(() => {})));

// numeração e referências
const all = [...document.querySelectorAll('.page')];
all.forEach((pg, i) => { const n = pg.querySelector('.foot .n'); if (n) n.textContent = `${pad2(i + 1)} / ${pad2(all.length)}`; });
document.querySelectorAll('[data-ref]').forEach(el => { const t = document.getElementById(el.dataset.ref); const pg = t && (t.classList.contains('page') ? t : t.closest('.page')); el.textContent = pg ? pad2(all.indexOf(pg) + 1) : '—'; });

/* ---------- checagem: estouro, corte e linhas órfãs ---------- */
function check() {
  const issues = [];
  const clipOf = el => { let p = el.parentElement; while (p && !p.classList.contains('page')) { const o = getComputedStyle(p); if (o.overflow !== 'visible' || p.classList.contains('body')) return p; p = p.parentElement; } return p; };
  all.forEach((pg, pi) => {
    pg.querySelectorAll('.body *, .foot').forEach(el => {
      if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') return;
      const r = el.getBoundingClientRect(); if (r.width < .5 && r.height < .5) return;
      const c = clipOf(el); const b = c.getBoundingClientRect();
      if (r.left < b.left - 1 || r.right > b.right + 1 || r.top < b.top - 1 || r.bottom > b.bottom + 1)
        issues.push({ page: pi + 1, type: 'overflow', el: el.tagName + '.' + el.className, text: (el.textContent || '').trim().slice(0, 50), by: [Math.round(Math.min(r.left - b.left, 0)), Math.round(Math.max(r.right - b.right, 0)), Math.round(Math.min(r.top - b.top, 0)), Math.round(Math.max(r.bottom - b.bottom, 0))] });
      if (el.scrollHeight > el.clientHeight + 1 && getComputedStyle(el).overflow !== 'visible' && el.clientHeight > 0) issues.push({ page: pi + 1, type: 'clipped', el: el.tagName + '.' + el.className, by: el.scrollHeight - el.clientHeight });
    });
    // linhas órfãs: última linha com uma palavra só
    pg.querySelectorAll('p, h1, h2, h3, li > span, .t, small').forEach(el => {
      if (el.querySelector('p, li, div')) return;
      const words = []; const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (walk.nextNode()) { const nd = walk.currentNode; const re = /\S+/g; let m; while ((m = re.exec(nd.data))) { const rg = document.createRange(); rg.setStart(nd, m.index); rg.setEnd(nd, m.index + m[0].length); const rc = rg.getClientRects(); if (rc.length) words.push({ w: m[0], top: rc[rc.length - 1].top, first: rc[0].top }); } }
      if (words.length < 2) return;
      const lines = []; words.forEach(w => { const L = lines.find(l => Math.abs(l.top - w.first) < 3); if (L) L.n++; else lines.push({ top: w.first, n: 1 }); });
      if (lines.length > 1 && lines[lines.length - 1].n === 1) issues.push({ page: pi + 1, type: 'orphan', text: el.textContent.trim().slice(-60) });
    });
    pg.querySelectorAll('img').forEach(im => { if (!im.complete || !im.naturalWidth) issues.push({ page: pi + 1, type: 'img', src: im.src }); });
  });
  return issues;
}
window.__report = { pages: all.length, issues: check() };
})().catch(e => { window.__report = { error: String(e && e.stack || e) }; });
