# PDF do moodboard

Gera `THE-REVEAL_Moodboard_*.pdf` (A4 paisagem, 35 páginas) a partir do site deste repositório.

```bash
bash pdf/build.sh                # captura o palco 3D, a planta e a reunião e gera o PDF (cerca de 15 min)
bash pdf/build.sh --no-capture   # reaproveita as capturas: só texto ou diagramação mudou (cerca de 1 min)
```

Saída: `pdf/out/The-Reveal-Moodboard.pdf` e `pdf/out/report.json`, com estouro, órfãs e imagens faltando. O resultado precisa ter 0 problemas.

Requisitos: Node 18+, Playwright com Chromium, Python 3 com Pillow e numpy.

O processo completo, o mapa de páginas e onde editar cada coisa estão em `docs/PROCESSO_SITE-PDF-DEPLOY_2026-10-15.md`.
