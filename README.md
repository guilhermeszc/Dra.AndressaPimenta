# Dra. Andressa Pimenta — Harmonização Facial

Landing page de alto padrão (direção "Editorial Noir") para a clínica da Dra. Andressa Pimenta — Harmonização Facial, Salvador – BA.

Site estático: **HTML + CSS + JavaScript puro**. Sem build. As animações usam GSAP + ScrollTrigger + Lenis via CDN (opcionais e com fallback).

## Estrutura

```
index.html            # página única
css/style.css         # estilos (tokens, componentes, seções, responsivo)
js/main.js            # interações e animações (JS puro)
assets/img/           # imagens otimizadas em WebP (hero, sobre, resultados)
assets/img/logo/      # logo oficial em PNG transparente
assets/icons/         # favicon e apple-touch-icon
imagens/              # fotos de origem (fonte; o site usa as versões em assets/)
```

## Deploy na Vercel

Projeto estático de configuração zero: basta importar o repositório na Vercel.
- Framework Preset: **Other**
- Build Command: *(vazio)*
- Output Directory: `./` (raiz)

## O que substituir antes de publicar

- `[NUMERO_COM_DDI]` — número do WhatsApp com DDI (ex.: `5571999999999`), em todos os links e no JSON-LD.
- `[ENDERECO]` e `[HORARIO]` — na seção Contato e no JSON-LD; e o endereço no `src` do mapa.
- `[URL_DO_SITE]` e `[URL_POLITICA_DE_PRIVACIDADE]`.
- Procedimentos marcados com `[A confirmar]`.
- Depoimentos `[DEPOIMENTO REAL]` e os nomes das pacientes.
- `assets/img/og-image.jpg` (1200×630) para compartilhamento em redes.

## Conformidade

Página sem promessa de resultados, com aviso de que os procedimentos exigem avaliação individual prévia, registro profissional **CRBM/BA-15967** no rodapé e aviso de cookies.
