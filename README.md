# Revolut F1 Team · The Reveal — moodboard

Site estático do moodboard do evento The Reveal (Casa Fasano, São Paulo).

- `index.html` — página única (HTML, CSS e JS inline)
- `assets/` — imagens, planta e bundle do three.js (r147)
- `netlify.toml` — deploy na Netlify direto da raiz, sem build

- `pdf/` — gera o PDF do moodboard a partir deste site (`bash pdf/build.sh`)
- `docs/` — processo documentado: artefato → site → GitHub → Netlify → PDF, e o mapa página do PDF → onde editar

Não indexado por buscadores (meta robots + `X-Robots-Tag` + robots.txt). `pdf/` e `docs/` não são publicados no site.

Deploy: cada push na `main` publica em https://revolut-the-reveal.netlify.app.
