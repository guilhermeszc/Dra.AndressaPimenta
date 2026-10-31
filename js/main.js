/* ==========================================================================
   Dra. Andressa Pimenta — main.js  (Editorial Noir)
   JS puro. GSAP + ScrollTrigger + Lenis só para animação e 100% opcionais:
   sem eles, ou com prefers-reduced-motion, o conteúdo fica visível e usável.
   --------------------------------------------------------------------------
   00 Ambiente · 01 Smooth scroll/âncoras · 02 Preloader · 03 Grão/Glow
   04 Hero · 05 Header/Menu · 06 Reveals · 07 Manifesto · 08 Sobre (pin)
   09 Marquee · 10 Procedimentos (horizontal) · 11 Beleza (máscara)
   12 Jornada · 13 Clínica (parallax) · 14 Resultados · 15 Lightbox
   16 Depoimentos · 17 FAQ · 19 Flutuantes/Cookies · 20 Init
   ========================================================================== */
(() => {
  'use strict';

  /* -------- 00 AMBIENTE -------- */
  const root = document.documentElement;
  const qs = (s, c = document) => c.querySelector(s);
  const qsa = (s, c = document) => Array.from(c.querySelectorAll(s));
  const mq = {
    reduced: matchMedia('(prefers-reduced-motion: reduce)'),
    fine: matchMedia('(hover: hover) and (pointer: fine)'),
    desk: matchMedia('(min-width: 1024px)'),
  };
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const MOTION = hasGSAP && !mq.reduced.matches;
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  if (MOTION) root.classList.add('has-motion');

  const EASE = (x) => { // cubic-bezier(.16,1,.3,1) via Newton-Raphson
    const x1 = .16, y1 = 1, x2 = .3, y2 = 1;
    const A = (a, b) => 1 - 3 * b + 3 * a, B = (a, b) => 3 * b - 6 * a, C = (a) => 3 * a;
    const f = (t, a, b) => ((A(a, b) * t + B(a, b)) * t + C(a)) * t;
    const df = (t, a, b) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a);
    if (x <= 0) return 0; if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) { const s = df(t, x1, x2); if (Math.abs(s) < 1e-6) break; t -= (f(t, x1, x2) - x) / s; }
    return f(t, y1, y2);
  };
  const debounce = (fn, w = 150) => { let id; return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), w); }; };
  const refresh = debounce(() => hasGSAP && ScrollTrigger.refresh(), 160);
  const store = {
    get(s, k) { try { return window[s].getItem(k); } catch (e) { return null; } },
    set(s, k, v) { try { window[s].setItem(k, v); } catch (e) {} },
  };

  const state = { menu: false };
  let lenis = null, closeMenu = () => {}, syncFloating = () => {};

  /* -------- 01 SMOOTH SCROLL + ÂNCORAS -------- */
  function initScroll() {
    if (MOTION && typeof window.Lenis !== 'undefined') {
      lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }
  const lock = () => lenis ? lenis.stop() : root.classList.add('is-locked');
  const unlock = () => lenis ? lenis.start() : root.classList.remove('is-locked');

  function initAnchors() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]'); if (!a) return;
      const h = a.getAttribute('href'); if (h.length < 2) return;
      const t = document.getElementById(h.slice(1)); if (!t) return;
      e.preventDefault();
      const go = () => {
        if (lenis) lenis.scrollTo(t, { duration: 1.5, easing: EASE, offset: -10 });
        else t.scrollIntoView({ behavior: mq.reduced.matches ? 'auto' : 'smooth' });
        if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
        t.focus({ preventScroll: true });
        history.replaceState(null, '', h);
      };
      if (state.menu) { closeMenu(false); setTimeout(go, 500); } else go();
    });
  }


  /* -------- 04 HERO -------- */
  function setupHero() {
    if (!MOTION) return () => {};
    const hero = qs('.hero');
    const lines = qsa('.line__in', hero), fades = qsa('[data-hero-fade]', hero);
    const img = qs('[data-hero-img]', hero);
    gsap.set(lines, { yPercent: 115 });
    gsap.set(fades, { opacity: 0, y: 24 });
    gsap.set(img, { scale: 1.15 });

    // parallax: foto desce devagar ao sair do hero
    gsap.to(img, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });

    return () => {
      gsap.timeline({ defaults: { ease: EASE } })
        .to(img, { scale: 1, duration: 2.4 }, 0)
        .to(lines, { yPercent: 0, duration: 1.3, stagger: .12 }, .1)
        .to(fades, { opacity: 1, y: 0, duration: 1.1, stagger: .1 }, .5);
    };
  }

  /* -------- 05 HEADER + MENU -------- */
  function initHeader() {
    const h = qs('[data-header]'); if (!h) return;
    let last = scrollY, tick = false;
    const upd = () => {
      const y = scrollY;
      h.classList.toggle('is-scrolled', y > 20);
      if (!state.menu) {
        if (y > last + 4 && y > innerHeight * .4) h.classList.add('is-hidden');
        else if (y < last - 4 || y < 80) h.classList.remove('is-hidden');
      }
      if (Math.abs(y - last) > 4) last = y;
      tick = false;
    };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  function initMenu() {
    const burger = qs('[data-burger]'), menu = qs('[data-menu]'), h = qs('[data-header]');
    const behind = [qs('main'), qs('.footer')].filter(Boolean);
    if (!burger || !menu) return;
    const inert = (v) => behind.forEach((el) => { el.inert = v; });
    const open = () => {
      state.menu = true; menu.classList.add('is-open'); h.classList.remove('is-hidden');
      burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Fechar menu');
      inert(true); lock(); syncFloating();
      setTimeout(() => { const f = qs('.menu__link', menu); if (f) f.focus({ preventScroll: true }); }, 500);
    };
    closeMenu = (ret = true) => {
      if (!state.menu) return;
      state.menu = false; menu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menu');
      inert(false); unlock(); syncFloating();
      if (ret) burger.focus({ preventScroll: true });
    };
    burger.addEventListener('click', () => state.menu ? closeMenu() : open());
    document.addEventListener('keydown', (e) => {
      if (!state.menu) return;
      if (e.key === 'Escape') return closeMenu();
      if (e.key !== 'Tab') return;
      const f = [burger, ...qsa('a[href],button', menu)];
      const first = f[0], lastf = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastf.focus(); }
      else if (!e.shiftKey && document.activeElement === lastf) { e.preventDefault(); first.focus(); }
    });
    qsa('a:not([href^="#"])', menu).forEach((a) => a.addEventListener('click', () => closeMenu(false)));
    mq.desk.addEventListener('change', (e) => { if (e.matches) closeMenu(false); });
  }

  /* -------- 06 REVEALS + split -------- */
  function split(el) {
    if (el.dataset.split) return qsa('.w__i', el);
    const walk = (node) => Array.from(node.childNodes).forEach((ch) => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) return frag.appendChild(document.createTextNode(' '));
          const o = document.createElement('span'), i = document.createElement('span');
          o.className = 'w'; i.className = 'w__i'; i.textContent = p; o.appendChild(i); frag.appendChild(o);
        });
        node.replaceChild(frag, ch);
      } else if (ch.nodeType === 1) walk(ch);
    });
    walk(el); el.dataset.split = '1';
    return qsa('.w__i', el);
  }

  function initReveals() {
    if (!MOTION) return;
    const items = qsa('[data-reveal]');
    items.forEach((el) => {
      const kind = el.getAttribute('data-reveal');
      if (kind === 'clip') {
        gsap.fromTo(el, { clipPath: 'inset(14% 0 0 0)', y: 30 }, {
          clipPath: 'inset(0% 0 0 0)', y: 0, duration: 1.3, ease: EASE,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      } else {
        gsap.fromTo(el, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0, duration: 1.1, ease: EASE, clearProps: 'opacity,transform',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      }
    });
  }

  /* -------- 07 MANIFESTO (scrub palavra a palavra) -------- */
  function initManifesto() {
    const el = qs('[data-scrub]'); if (!el) return;
    const words = split(el);
    if (!MOTION) return;
    qsa('.w', el).forEach((w) => { w.style.overflow = 'visible'; });
    gsap.fromTo(words, { opacity: .15 }, {
      opacity: 1, ease: 'none', stagger: .12,
      scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 55%', scrub: .6 },
    });
  }

  /* -------- Carrossel reutilizável (setas + swipe + arraste + barra) -------- */
  function carousel({ track, bar, prev, next, item }) {
    if (!track) return;
    const items = qsa(item, track); if (!items.length) return;
    const beh = () => mq.reduced.matches ? 'auto' : 'smooth';
    const step = () => items[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || parseFloat(getComputedStyle(track).gap) || 0);
    const upd = () => {
      const max = track.scrollWidth - track.clientWidth;
      const r = max > 0 ? track.scrollLeft / max : 1;
      const vis = Math.min(1, track.clientWidth / track.scrollWidth);
      if (bar) bar.style.transform = `scaleX(${vis + (1 - vis) * r})`;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
    };
    let raf; track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(upd); }, { passive: true });
    addEventListener('resize', debounce(upd, 100)); upd();
    if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: beh() }));
    if (next) next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: beh() }));

    // arraste com mouse
    qsa('img', track).forEach((i) => i.draggable = false);
    let down = false, drag = false, sx = 0, sl = 0, rel;
    track.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || e.button) return; down = true; drag = false; sx = e.clientX; sl = track.scrollLeft; });
    addEventListener('pointermove', (e) => {
      if (!down) return; const dx = e.clientX - sx;
      if (!drag && Math.abs(dx) > 6) { drag = true; clearTimeout(rel); track.classList.add('is-drag'); }
      if (drag) track.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', () => {
      if (!down) return; down = false; if (!drag) return;
      const s = step(), max = track.scrollWidth - track.clientWidth;
      track.scrollTo({ left: Math.min(max, Math.round(track.scrollLeft / s) * s), behavior: beh() });
      rel = setTimeout(() => track.classList.remove('is-drag'), 650);
    });
  }

  /* -------- 11 BELEZA SEM PADRÕES (máscara circular) -------- */
  function initBeliefs() {
    const sec = qs('.beliefs'); if (!sec || !MOTION) return;
    gsap.fromTo(sec, { clipPath: 'circle(18% at 50% 50%)' }, {
      clipPath: 'circle(75% at 50% 50%)', ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 30%', scrub: .5, invalidateOnRefresh: true },
    });
    // garante cobertura total ao fixar em tela
    ScrollTrigger.create({ trigger: sec, start: 'top 30%', onEnter: () => gsap.to(sec, { clipPath: 'circle(150% at 50% 50%)', duration: 1, ease: EASE }), once: true });
  }

  /* -------- 12 JORNADA -------- */
  function initTimeline() {
    const tl = qs('[data-timeline]'); if (!tl) return;
    const steps = qsa('[data-step]', tl), bar = qs('[data-timeline-bar]', tl);
    if (!MOTION) { steps.forEach((s) => s.classList.add('is-active')); return; }
    gsap.fromTo(bar, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 60%', end: 'bottom 60%', scrub: .5 } });
    steps.forEach((s) => ScrollTrigger.create({ trigger: s, start: 'top 60%', onEnter: () => s.classList.add('is-active'), onLeaveBack: () => s.classList.remove('is-active') }));
  }

  /* -------- 13 CLÍNICA (parallax) -------- */
  function initParallax() {
    if (!MOTION) return;
    qsa('[data-parallax]').forEach((el) => {
      const sp = parseFloat(el.dataset.parallax) || .06;
      gsap.fromTo(el, { yPercent: -sp * 100 }, { yPercent: sp * 100, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    qsa('[data-parallax-img]').forEach((img) => {
      gsap.set(img, { scale: 1.12 });
      gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* -------- 14 RESULTADOS (arraste + barra) -------- */
  function initGallery() {
    carousel({
      track: qs('[data-g-track]'),
      bar: qs('[data-g-bar]'),
      prev: qs('[data-g-prev]'),
      next: qs('[data-g-next]'),
      item: '.gslide',
    });
  }

  /* -------- 15 LIGHTBOX -------- */
  function initLightbox() {
    const d = qs('[data-lightbox]'); if (!d || typeof d.showModal !== 'function') return;
    const img = qs('[data-lb-img]', d), cap = qs('[data-lb-cap]', d), cnt = qs('[data-lb-count]', d);
    const btns = qsa('[data-lb]');
    const items = btns.map((b) => {
      const t = qs('img', b), c = b.closest('.gslide').querySelector('.gslide__cap');
      return { src: t.dataset.full || t.currentSrc || t.src, alt: t.alt, cap: c ? Array.from(c.childNodes).map((n) => n.textContent.trim()).filter(Boolean).join(' · ') : '' };
    });
    let i = 0, lastFocus = null;
    const pad = (n) => String(n).padStart(2, '0');
    const render = (n, anim) => {
      i = (n + items.length) % items.length; const it = items[i];
      const apply = () => { img.onload = () => img.classList.remove('is-swap'); img.src = it.src; img.alt = it.alt; cap.textContent = it.cap; cnt.textContent = `${pad(i + 1)} / ${pad(items.length)}`; if (img.complete) img.classList.remove('is-swap'); };
      if (anim && !mq.reduced.matches) { img.classList.add('is-swap'); setTimeout(apply, 260); } else apply();
    };
    const open = (n) => { lastFocus = document.activeElement; render(n, false); d.showModal(); lock(); requestAnimationFrame(() => d.classList.add('is-open')); };
    const close = () => { d.classList.remove('is-open'); setTimeout(() => d.close(), mq.reduced.matches ? 0 : 450); };
    d.addEventListener('close', () => { d.classList.remove('is-open'); unlock(); if (lastFocus) lastFocus.focus({ preventScroll: true }); });
    d.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    d.addEventListener('click', (e) => { if (e.target === d) close(); });
    d.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') render(i + 1, true); if (e.key === 'ArrowLeft') render(i - 1, true); });
    btns.forEach((b, n) => b.addEventListener('click', () => open(n)));
    qs('[data-lb-close]', d).addEventListener('click', close);
    qs('[data-lb-prev]', d).addEventListener('click', () => render(i - 1, true));
    qs('[data-lb-next]', d).addEventListener('click', () => render(i + 1, true));
  }

  /* -------- 16 DEPOIMENTOS -------- */
  function initQuotes() {
    const wrap = qs('[data-quotes]'); if (!wrap) return;
    const quotes = qsa('[data-quote]', wrap), dots = qsa('[data-quotes-dots] button');
    const sec = wrap.closest('section'); if (quotes.length < 2) return;
    let cur = 0, timer, inView = false, paused = false;
    const auto = !mq.reduced.matches;
    const show = (n) => {
      cur = (n + quotes.length) % quotes.length;
      quotes.forEach((q, k) => { q.classList.toggle('is-active', k === cur); q.setAttribute('aria-hidden', String(k !== cur)); });
      dots.forEach((dt, k) => dt.setAttribute('aria-current', String(k === cur)));
    };
    const stop = () => clearTimeout(timer);
    const sched = () => { stop(); if (auto && inView && !paused && !document.hidden) timer = setTimeout(() => { show(cur + 1); sched(); }, 6500); };
    dots.forEach((dt, k) => dt.addEventListener('click', () => { show(k); sched(); }));
    sec.addEventListener('mouseenter', () => { paused = true; stop(); });
    sec.addEventListener('mouseleave', () => { paused = false; sched(); });
    sec.addEventListener('focusin', () => { paused = true; stop(); });
    sec.addEventListener('focusout', () => { paused = false; sched(); });
    document.addEventListener('visibilitychange', sched);
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { inView = e.isIntersecting; sched(); }, { threshold: .3 }).observe(sec);
  }

  /* -------- 17 FAQ -------- */
  function initAccordions() {
    qsa('[data-accordion]').forEach((group) => {
      const triggers = qsa('[data-acc]', group);
      triggers.forEach((btn) => btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') !== 'true';
        triggers.forEach((t) => { if (t !== btn) { t.setAttribute('aria-expanded', 'false'); document.getElementById(t.getAttribute('aria-controls')).classList.remove('is-open'); } });
        btn.setAttribute('aria-expanded', String(open));
        document.getElementById(btn.getAttribute('aria-controls')).classList.toggle('is-open', open);
      }));
      group.addEventListener('transitionend', (e) => { if (e.propertyName === 'grid-template-rows') refresh(); });
    });
  }

  /* -------- 19 FLUTUANTES + COOKIES -------- */
  function initFloating() {
    const bar = qs('[data-mobile-cta]'), wa = qs('[data-wa-float]'), cookie = qs('[data-cookie]');
    const hero = qs('.hero'), ends = [qs('[data-final-cta]'), qs('.footer')].filter(Boolean);
    let past = false; const visEnds = new Set();
    syncFloating = () => {
      const show = past && visEnds.size === 0 && !state.menu;
      if (bar) { bar.classList.toggle('is-visible', show); bar.setAttribute('aria-hidden', String(!show)); const a = qs('a', bar); if (a) a.tabIndex = show ? 0 : -1; }
      if (wa) { wa.classList.toggle('is-visible', show); wa.setAttribute('aria-hidden', String(!show)); wa.tabIndex = show ? 0 : -1; }
      if (cookie) cookie.classList.toggle('is-raised', show);
    };
    if (!('IntersectionObserver' in window) || !hero) { past = true; syncFloating(); return; }
    new IntersectionObserver(([e]) => { past = !e.isIntersecting && e.boundingClientRect.top < 0; syncFloating(); }).observe(hero);
    const eo = new IntersectionObserver((es) => { es.forEach((e) => e.isIntersecting ? visEnds.add(e.target) : visEnds.delete(e.target)); syncFloating(); }, { threshold: .12 });
    ends.forEach((el) => eo.observe(el));
    syncFloating();
  }

  function initCookie() {
    const el = qs('[data-cookie]'); if (!el) return;
    if (store.get('localStorage', 'ap-cookie') === '1') { el.remove(); return; }
    el.hidden = false;
    setTimeout(() => el.classList.add('is-visible'), MOTION ? 3000 : 400);
    qs('[data-cookie-ok]', el).addEventListener('click', () => { store.set('localStorage', 'ap-cookie', '1'); el.classList.remove('is-visible'); setTimeout(() => el.remove(), 700); });
  }

  /* -------- 20 INIT -------- */
  function init() {
    if (hasGSAP) ScrollTrigger.config({ ignoreMobileResize: true });
    initScroll(); initAnchors(); initHeader(); initMenu();
    initGallery(); initLightbox(); initQuotes(); initAccordions();
    initFloating(); initCookie();
    qsa('[data-year]').forEach((el) => el.textContent = new Date().getFullYear());

    const playHero = setupHero();
    initReveals(); initManifesto();
    initBeliefs(); initTimeline(); initParallax();

    // sem preloader: anima o hero assim que a página carrega
    playHero();

    if (hasGSAP) {
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
      addEventListener('load', refresh);
    }
    mq.desk.addEventListener('change', refresh);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
