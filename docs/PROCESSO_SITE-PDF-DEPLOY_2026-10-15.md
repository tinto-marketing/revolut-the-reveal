# The Reveal · Revolut F1 Team — do artefato ao site e ao PDF

**Processo documentado** · 15/10/2026 · SAPUPPO / REVOLUT
**Site no ar:** https://revolut-the-reveal.netlify.app
**Código:** https://github.com/tinto-marketing/revolut-the-reveal (branch `main`)
**Cópia local com git:** `REVOLUT/03_MOODBOARD/SITE-NETLIFY/`
**PDF:** `REVOLUT/03_MOODBOARD/THE-REVEAL_Moodboard_2026-10-15.pdf` (35 páginas, A4 paisagem)

---

## 1. Visão geral

Existe **uma fonte**: o `index.html` do repositório, com as imagens em `assets/`. Dela saem o site e o PDF.

```
Artefato claude.ai "Revolut The Reveal" (14/10)  ← origem; não é mais atualizado
        │  baixado com os 48 arquivos (HTML + imagens + three.js + planta)
        ▼
Repositório  tinto-marketing/revolut-the-reveal
  index.html ─────────────► Netlify (deploy automático a cada push na main)
  assets/                    https://revolut-the-reveal.netlify.app
  pdf/  ──── capturas do site + diagramação A4 ───► THE-REVEAL_Moodboard_*.pdf
```

**O PDF não é uma impressão da página.** É um documento diagramado à parte, com 35 páginas fixas. Ele lê do site os textos e os dados e tira fotos dos módulos interativos (palco 3D, planta, reunião). Uma mudança no site só chega ao PDF quando o PDF é gerado de novo (seção 5).

O que isso significa na prática:

- **Texto que vem dos dados do site** (espaços, diretrizes, ambientes da planta, renders R02): mudou no site, muda no PDF.
- **Texto escrito só no PDF** (capa, sumário, conceito, palco, quatro momentos, próximos passos): precisa ser mudado nos dois lugares.
- **Imagens do palco 3D e da planta:** são fotos do site. Quando o modelo muda, o PDF precisa de novas capturas.

A tabela da seção 6 diz, para cada página, de onde vem cada coisa.

---

## 2. Do artefato ao site (15/10, ~10h20–10h45)

1. **Origem.** Artefato "Revolut The Reveal" (`claude.ai/artifact/APbextPifRAnL2Fr3VUWjs`), versão de 14/10, com 49 arquivos publicados: o `index.html` (HTML, CSS e JS num arquivo só, 1.874 linhas), 46 imagens, `assets/plan/planta-linhas.png` e `assets/js/vendor/three-r147-bundle.js`.
2. **Download.** Foram baixados todos os arquivos, com a mesma estrutura de pastas.
3. **Ajustes no HTML, sem mudar o conteúdo:**
   - o "esqueleto" que o claude.ai coloca em volta do artefato saiu e o `<head>` foi refeito: `lang="pt-BR"`, título, descrição, `og:image` (render R02 01), favicon;
   - foi incluído `noindex,nofollow` para o site não aparecer em buscadores.
4. **Arquivos novos:**
   - `favicon.svg`: o "R" em âmbar sobre petrol;
   - `robots.txt`: bloqueia todos os buscadores;
   - `netlify.toml`: publica a raiz sem build, com os cabeçalhos `X-Robots-Tag: noindex` e cache longo para `/assets/*`;
   - `README.md`.
5. **Teste local.** O site abriu no Chromium sem erros de console e todas as imagens carregaram.

## 3. GitHub

| Item | Valor |
|---|---|
| Repositório | `tinto-marketing/revolut-the-reveal` |
| Visibilidade | **público** (veja o porquê abaixo) |
| Branch publicada | `main` |
| Primeiro commit | `e8ac0a8` "Moodboard Revolut The Reveal — site estático" |

**Por que público.** O Claude só alcança, na nuvem, os repositórios públicos da conta tinto-marketing, porque o app do Claude no GitHub não está instalado nela. O repositório foi criado privado e depois aberto, com a sua autorização. O GitHub pediu confirmação de identidade (sudo mode), que você fez pelo GitHub Mobile. O conteúdo é o mesmo que o site já mostra.

**Como o código chegou ao GitHub.** Push direto da nuvem é recusado (falta o app do Claude). Por isso o envio foi feito **pelo seu computador**:

1. os 53 arquivos foram gravados em `03_MOODBOARD/SITE-NETLIFY/`;
2. ali foram feitos `git init`, o commit e `remote = https://github.com/tinto-marketing/revolut-the-reveal.git`;
3. o push foi feito pelo **GitKraken**, com o seu login do GitHub nessa máquina.

**Cuidado com o git nessa pasta.** O Claude não tem permissão de apagar arquivos nas suas pastas. O git apaga os próprios arquivos de trava (`.lock`), então eles ficam para trás. Os que sobraram foram renomeados para `.git/stale-*` e podem ser apagados à mão. Se um comando git disser "File exists" por causa de um `.lock`, apague esse `.lock`.

**Para o Claude enviar direto da nuvem no futuro:** instale o app do Claude em https://github.com/apps/claude/installations/select_target, só para este repositório. Sem isso, o envio continua pelo seu computador.

## 4. Netlify

| Item | Valor |
|---|---|
| Time | Tinto (`vini-p9oulmy`) · login Google `vini@tinto.social` |
| Projeto | `revolut-the-reveal` · id `d4579888-87ea-4735-8cd7-4f107e349360` |
| URL | https://revolut-the-reveal.netlify.app |
| Ligação | Import from Git → GitHub → `tinto-marketing/revolut-the-reveal`, branch `main` |
| Build | nenhum; o `netlify.toml` publica a raiz (`publish = "."`) |
| Senha | não tem; pode ser ligada em Project configuration → Access & security |

**Deploy automático:** cada push na `main` publica em cerca de 30 s. Não há botão a apertar.

**Conferido depois do primeiro deploy:**
- `/`, o three.js, a planta e os renders respondem 200;
- o cabeçalho `x-robots-tag: noindex, nofollow` está presente;
- a página abre sem erros.

## 5. Do site ao PDF

### 5.1 Como foi feito (conversa "REVOLUT | Artifact 2 pdf", 15/10, 10h16–10h51)

**A escolha de formato.** Primeiro houve um brainstorm sobre como contornar a perda da interatividade. Você escolheu a **Ideia 1, "momentos congelados, lado a lado"**, em A4 paisagem, sem linhas órfãs e sem estouro de texto ou imagem.

**Como o PDF foi montado:**

1. **Fonte.** O artefato de 14/10, o mesmo arquivo do site, servido localmente.
2. **Capturas** (`capture.mjs`, Playwright + Chromium com renderização 3D por software). Foram 27 fotos dos módulos interativos, com grão, cursor e menus escondidos:

   | Grupo | Capturas |
   |---|---|
   | Palco | 8 quadros da revelação (Opção 2, vista do público, 0 a 29,9 s) |
   | Palco | Opção 1 × Opção 2 nas vistas aérea, público e diagonal |
   | Palco | 2 vistas do carro: key apagada e acesa |
   | Capas | hero e capítulos |
   | Reunião | 4 painéis (diretrizes 05 a 08) |
   | Planta 3D | 4 momentos da noite |

   O nível de ambiente, cena e key de cada quadro foi gravado em `shots/meta.json` e aparece nas barras do PDF.
3. **Recorte** (`crop.py`): as capturas viram JPEG, e a planta é recortada pela área clara.
4. **Dados.** O bloco `window.REVEAL` do site (espaços, diretrizes, zonas, renders) é copiado para `data.js`.
5. **Diagramação** (`doc.html` + `build.js`):
   - 35 páginas fixas de 297 × 210 mm, com a fonte TeX Gyre Heros (clone livre da Helvetica, incorporada);
   - a planta é redesenhada em SVG a partir das zonas do site;
   - as galerias são justificadas em linhas;
   - o texto passa por um ajuste que prende palavras curtas à seguinte, para evitar linhas órfãs.
6. **Checagem automática.** Antes de imprimir, o `build.js` mede cada página e acusa texto ou imagem estourando, linha órfã e imagem que não carregou. A versão entregue teve **0 ocorrências**.
7. **Impressão** (`render.mjs`): Chromium gera o PDF com fundo. **Correção do "rosa":** os degradês CSS saíam como sombreamento vetorial, que o Firefox, o pdf.js e a prévia do app não desenham (pintam rosa). Por isso, todo degradê vira imagem antes de imprimir: os fundos das 35 páginas, as barras de cor, as legendas do palco e o efeito "na paleta". O texto continua selecionável.

### 5.2 Onde está o código do PDF

O código original ficou na área temporária daquela conversa, que se perde. Ele foi **reconstruído** a partir do histórico da conversa, com todas as correções aplicadas na mesma ordem (as três rodadas de ajuste conferem trecho a trecho com o original). Agora está versionado no repositório, na pasta `pdf/`:

| Arquivo | Função |
|---|---|
| `pdf/build.sh` | Roda tudo: servidor local, dados, capturas, recorte e PDF |
| `pdf/extract-data.mjs` | Copia o bloco `window.REVEAL` do `index.html` para `pdf/data.js` |
| `pdf/capture.mjs` | Captura os módulos interativos (`stage`, `covers`, `meet`, `plan`) |
| `pdf/crop.py` | Converte e recorta as capturas → `pdf/img/` |
| `pdf/doc.html` | Estilos das páginas (A4, tipografia, componentes) |
| `pdf/build.js` | Monta as 35 páginas e faz a checagem de diagramação |
| `pdf/render.mjs` | Transforma os degradês em imagem e imprime o PDF |
| `pdf/fonts/` | TeX Gyre Heros regular e bold, com a licença |

**Gerar de novo:**
```bash
bash pdf/build.sh                # captura tudo (cerca de 15 min, por causa do 3D) e gera o PDF
bash pdf/build.sh --no-capture   # só texto e diagramação mudaram: reaproveita as capturas (cerca de 1 min)
```
Precisa de Node 18+, Playwright com Chromium e Python 3 com Pillow e numpy. O PDF sai em `pdf/out/The-Reveal-Moodboard.pdf`. O relatório de diagramação sai em `pdf/out/report.json`. `shots/`, `img/`, `ras/`, `out/` e `data.js` são gerados e ficam fora do git.

**Validação da reconstrução (15/10, 12h):** o PDF foi gerado do zero com o kit e comparado com o entregue:
- 35 de 35 páginas com **texto idêntico**;
- 0 problemas de diagramação;
- diferença visual média de 0 a 2% por página, só nos quadros animados do palco e da planta, que variam alguns milissegundos entre capturas.

Ajuste feito na reconstrução: o tempo-limite das capturas da reunião subiu de 8 s para 60–90 s. As lâminas animadas, desenhadas por software, demoram a estabilizar.

---

## 6. Mapa: página do PDF → site → onde editar

Legenda da coluna "Fonte":
- **dados**: vem de `window.REVEAL` no `index.html`. Editar ali muda o site e o PDF.
- **PDF**: texto escrito só no `pdf/build.js`. Se o assunto também aparece no site, editar os dois.
- **captura**: foto do site. Muda quando o site muda e o PDF é gerado com captura.
- **asset**: imagem de `assets/img/…`.

| Pág. | Conteúdo | No site (âncora) | Fonte e onde editar |
|---|---|---|---|
| 1 | Capa | `#entrada` (hero) | captura `cover-hero` · texto: PDF |
| 2 | Sumário | menu do topo | PDF (`TOC` no `build.js`) |
| 3 | 01 Conceito · "Um novo amanhecer" · luz da noite | `#conceito` | captura `chapter-conceito` · texto: PDF (no site, HTML de `#conceito`) |
| 4 | Narrativa · quatro atos de luz — **retirada em 15/10 (rev2)** | — | — |
| 5 | 02 Revelação · O palco em 30 s · Opção 1 e 2 (vista aérea) | `#revelacao` | captura `stage-o1/o2-top` · texto: PDF + site |
| 6 | Opção 1 × Opção 2 (público e diagonal) | `#revelacao` (abas e câmeras) | captura `stage-o*-front/diag` · texto: PDF |
| 7–8 | Revelação em 8 quadros (0 a 29,9 s) | `#revelacao` (linha do tempo) | captura `stage-tl-00…07` · cues: PDF (`CUEDESC`) + cues do site |
| 9 | Key light no carro | `#revelacao` (câmera do carro) | captura `stage-car-*` · resposta: dados (diretriz 04) |
| 10 | 03 Espaços · índice | `#espacos` | captura `chapter-espacos` · lista: dados (`REVEAL.spaces`) |
| 11 | Entrada & Espaço | `#espacos` → espaço `espaco` | dados (`spaces[0]`) · asset `img/espaco/` |
| 12–13 | Luz · Fórmula 1 (1/2 e 2/2) — **retirada em 15/10 (rev2)** | — | — |
| 14 | DJ & Palco | espaço `dj` | dados (`spaces[2]`) · asset `img/dj/` |
| 15 | Expo · Cartões | espaço `expo` | dados (`spaces[3]`) · asset `img/expo/` |
| 16 | Bar | espaço `bar` | dados (`spaces[4]`) · asset `img/bar/` |
| 17 | Photo Op + Mobiliário | espaços `photo-op` e `mobiliario` | dados (`spaces[5]`, `spaces[6]`) · asset |
| 18 | Original × na paleta | botão "Na paleta" | PDF (`GR`) · asset |
| 19 | 04 Reunião · as 10 diretrizes | `#reuniao` | dados (`REVEAL.guides`) |
| 20 | Diretrizes 01 e 02 | `#reuniao` itens 1–2 | dados (`guides[0..1]`) |
| 21 | Diretrizes 03 e 04 | itens 3–4 | dados (`guides[2..3]`) |
| 22 | Diretrizes 05 e 06 (varanda, fluxo pelo terraço) | itens 5–6 | dados (`guides[4..5]`) · captura `meet-05/06` |
| 23 | Diretrizes 07 e 08 (deck em 2 ambientes, backdrop) | itens 7–8 | dados (`guides[6..7]`) · captura `meet-07/08` |
| 24 | Diretrizes 09 e 10 (cartões, cenografia externa/pórtico) | itens 9–10 | dados (`guides[8..9]`) |
| 25–30 | 05 R02 → direção (11 renders, 2 por página; a 30 tem 1 e as etapas) | `#r02` | dados (`REVEAL.renders`) · asset `renders-r02/` · etapas: PDF (`STEPS`) |
| 31 | 06 Planta e ambientes (planta numerada, fluxo) | `#planta` | dados (`REVEAL.zones`, `REVEAL.flow`) · desenho base `assets/plan/planta-linhas.png` |
| 32 | A luz pela noite: 4 momentos | `#planta` (controle de horário) | captura `plan-*` · textos: PDF (`MOM`) |
| 33 | Ambientes 1/2 (zonas 1–7) | `#planta` → card de ambiente | dados (`zones[0..6]`) |
| 34 | Ambientes 2/2 (zonas 8–14) | idem | dados (`zones[7..13]`) |
| 35 | 07 Próximos passos | rodapé / `#r02` (etapas) | PDF (listas "Aprovar" e "Confirmar") |

**Zonas da planta, pela numeração do PDF (págs. 31, 33 e 34):**
1. Terraço
2. Backdrop interativo
3. Housemix
4. Painéis de LED
5. Palco · Carro
6. Pista & bistrôs
7. Instalação dos cartões
8. Lounge · bancos
9. Bar · salão
10. Totem cartão
11. Photo Opp + VM
12. Deck Bar
13. Deck Lounge
14. Chapelaria

## 7. Como mandar alterações pelo PDF

Cite **página + o que muda**, como na revisão de 15/10 ("PÁG. 11 — Entrada: retirar a referência ao pórtico"). Para cada pedido:

1. A tabela acima diz se é **dados**, **PDF**, **captura** ou **asset**.
2. A mudança é feita no `index.html` (site), no `pdf/build.js` (texto só do PDF), ou nos dois.
3. Imagem nova entra em `03_MOODBOARD/IMGS/<espaço>/` (original) e em `assets/img/<espaço>/` (cópia otimizada), com uma linha no `03_MOODBOARD/README.md`.
4. Commit e push: o site atualiza sozinho.
5. O PDF é gerado de novo (com captura, se o palco ou a planta mudaram) e salvo com a data no nome: `THE-REVEAL_Moodboard_AAAA-MM-DD.pdf`.
6. Uma linha no `00_DOCS/CHANGELOG.md`.

**Coisas que dependem de material seu:** renders novos, a planta v02, fotos de mobiliário, os comentários da Holly. Elas ficam marcadas como pendentes até você mandar o arquivo.

## 8. Pontos de atenção

- **O link do PDF ainda aponta para o artefato** (`claude.ai/artifact/APbext…`, pág. 35), não para o site. Vale trocar para `revolut-the-reveal.netlify.app` na próxima geração.
- **O artefato e o `MOODBOARD-SITE/` local ficaram para trás.** A versão de trabalho agora é o repositório (`SITE-NETLIFY/` ou GitHub). O `MOODBOARD-SITE/index.html` local é uma versão anterior e menor (27 KB contra 157 KB). Não editar ali.
- **O PDF e o site podem divergir** nos textos marcados "PDF" na tabela. Toda revisão precisa conferir as duas colunas.
- **Repositório público:** qualquer pessoa com o endereço vê o código. Os buscadores estão bloqueados no site, mas não no GitHub. Se o cliente pedir sigilo, instale o app do Claude, volte o repositório para privado e ponha senha no site.
- **Renderização 3D por software:** as capturas do palco levam cerca de 25 s cada. A geração completa leva cerca de 15 min.

## 9. Próximo passo

A **revisão de 15/10** ("THE REVEAL — Revisão da apresentação", 35 itens por página) foi recebida e ainda não foi aplicada. Ela será aplicada seguindo a seção 7. O que depender de material que ainda não existe vai para uma lista de pendências, separada por página.


> **15/10 (rev2):** saíram a pág. 4 (Narrativa) e as págs. 12–13 (Luz · Fórmula 1); o PDF passou a ter 36 páginas. Imagens ainda não enviadas aparecem como espaço de foto em cor sólida: no `REVEAL.spaces`, uma entrada `[null, 'legenda']` vira placeholder no site e no PDF. Para trocar, basta pôr o arquivo em `assets/img/<espaço>/` e o nome no lugar do `null`.
