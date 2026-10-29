// Verificación automática de la demo (opcional, solo para desarrollo; no se publica).
// Requiere Node y Playwright con Chromium. Uso:
//   1) cd public && python3 -m http.server 8000
//   2) node tests/verificar.js http://localhost:8000/
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.argv[2] || 'http://localhost:8000/';
const PUBLIC = path.join(__dirname, '..', 'public');
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok, detail }); };

// CSP tomada de public/_headers para probar con la misma política que Cloudflare Pages.
const csp = fs.readFileSync(path.join(PUBLIC, '_headers'), 'utf8').match(/Content-Security-Policy: (.+)/)[1];

async function newPage(browser, opts = {}) {
  const ctx = await browser.newContext(opts);
  await ctx.route('**/*', async route => {
    const url = route.request().url();
    if (!url.startsWith(BASE)) return route.abort(); // nada debe salir a terceros al cargar
    const res = await route.fetch();
    const headers = { ...res.headers() };
    if ((headers['content-type'] || '').includes('text/html')) headers['content-security-policy'] = csp;
    return route.fulfill({ response: res, headers });
  });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('console', m => { if (m.type() === 'error') page.errors.push(m.text()); });
  page.on('pageerror', e => page.errors.push(String(e)));
  page.on('requestfailed', r => page.errors.push('Falló: ' + r.url()));
  return { ctx, page };
}

(async () => {
  const browser = await chromium.launch();

  // 1. Carga, recursos y anclas (escritorio)
  {
    const { ctx, page } = await newPage(browser, { viewport: { width: 1366, height: 800 } });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    check('Sin errores de consola, CSP ni recursos fallidos (escritorio)', page.errors.length === 0, page.errors.join(' | '));
    const broken = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')]
      .map(a => a.getAttribute('href')).filter(h => h.length > 1 && !document.querySelector(h)));
    check('Todas las anclas internas existen', broken.length === 0, broken.join(', '));
    const imgs = await page.evaluate(async () => {
      const list = [...document.images];
      list.forEach(i => { i.loading = 'eager'; });
      await Promise.all(list.map(i => i.decode().catch(() => null)));
      return list.map(i => ({ src: i.getAttribute('src'), ok: i.naturalWidth > 0, alt: i.hasAttribute('alt') && i.alt.trim() !== '' }));
    });
    check('Todas las imágenes cargan', imgs.every(i => i.ok), imgs.filter(i => !i.ok).map(i => i.src).join(', '));
    check('Todas las imágenes tienen alt', imgs.every(i => i.alt));
    const fonts = await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family); });
    check('Fuentes autoalojadas cargadas (Oswald y DM Sans)', fonts.some(f => f.includes('Oswald')) && fonts.some(f => f.includes('DM Sans')), fonts.join(', '));
    const headings = await page.evaluate(() => ({ h1: document.querySelectorAll('h1').length, order: [...document.querySelectorAll('h1,h2,h3')].map(h => h.tagName).join('') }));
    check('Un solo h1 y jerarquía sin saltos', headings.h1 === 1 && !/H1H3/.test(headings.order), headings.order);
    const localRefs = await page.evaluate(() => [...document.querySelectorAll('[src],[href]')]
      .map(e => e.getAttribute('src') || e.getAttribute('href'))
      .filter(u => u && !u.startsWith('#') && !u.startsWith('http') && !u.startsWith('mailto')));
    const missing = localRefs.filter(r => !fs.existsSync(path.join(PUBLIC, r)));
    check('Archivos locales referenciados existen en public/', missing.length === 0, missing.join(', '));
    const extLinks = await page.evaluate(() => [...document.querySelectorAll('a[target=_blank]')].filter(a => !/noopener/.test(a.rel)).length);
    check('Enlaces externos con rel="noopener"', extLinks === 0);
    const waLinks = await page.evaluate(() => [...document.querySelectorAll('a[href*="wa.me"],a[href*="whatsapp"]')].length);
    check('No hay enlaces reales a WhatsApp', waLinks === 0);
    await ctx.close();
  }

  // 2. Sin desbordamiento horizontal
  for (const w of [320, 360, 390, 768, 920, 1024, 1366, 1920]) {
    const { ctx, page } = await newPage(browser, { viewport: { width: w, height: 800 } });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    check(`Sin scroll horizontal a ${w}px`, sw <= w, `scrollWidth=${sw}`);
    if (w >= 901 && w <= 1100) {
      const h = await page.evaluate(() => document.querySelector('.header-inner').getBoundingClientRect().height);
      check(`Menú de escritorio en una línea a ${w}px`, h <= 90, `alto=${h}`);
    }
    await ctx.close();
  }

  // 3. Menú móvil
  {
    const { ctx, page } = await newPage(browser, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    const toggle = page.locator('.nav-toggle');
    const nav = page.locator('#nav-principal');
    const box = await toggle.boundingBox();
    check('Botón de menú ≥ 44×44 px', box.width >= 44 && box.height >= 44, `${box.width}×${box.height}`);
    check('Menú cerrado al inicio', !(await nav.isVisible()) && (await toggle.getAttribute('aria-expanded')) === 'false');
    await toggle.click();
    check('Abre con clic y aria-expanded=true', (await nav.isVisible()) && (await toggle.getAttribute('aria-expanded')) === 'true');
    await page.mouse.click(200, 800);
    check('Cierra al tocar fuera', !(await nav.isVisible()) && (await toggle.getAttribute('aria-expanded')) === 'false');
    await toggle.click();
    await page.keyboard.press('Escape');
    const focused = await page.evaluate(() => document.activeElement.classList.contains('nav-toggle'));
    check('Esc cierra y devuelve el foco al botón', !(await nav.isVisible()) && focused);
    for (const id of ['filosofia', 'servicios', 'galeria', 'visitanos', 'contacto']) {
      await toggle.click();
      await nav.locator(`a[href="#${id}"]`).click();
      await page.waitForTimeout(1200);
      const top = await page.evaluate(i => document.getElementById(i).getBoundingClientRect().top, id);
      const headerBottom = await page.evaluate(() => document.querySelector('.site-header').getBoundingClientRect().bottom);
      check(`Enlace #${id}: cierra menú y la sección no queda bajo el encabezado`, !(await nav.isVisible()) && top >= headerBottom - 2 && top < 200, `top=${Math.round(top)} header=${Math.round(headerBottom)}`);
    }
    await toggle.click();
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(100);
    check('Al pasar a escritorio se restablece aria-expanded', (await toggle.getAttribute('aria-expanded')) === 'false');
    await page.setViewportSize({ width: 390, height: 844 });
    const small = await page.evaluate(() => [...document.querySelectorAll('main a, main button, main select, main label.chip, header a, header button, footer a')]
      .filter(e => e.offsetParent !== null && !e.closest('p, dd'))
      .map(e => { const r = e.getBoundingClientRect(); return { t: (e.textContent || e.id).trim().slice(0, 25), h: Math.round(r.height) }; })
      .filter(x => x.h < 44));
    check('Objetivos táctiles de botones y controles ≥ 44 px de alto (móvil)', small.length === 0, JSON.stringify(small));
    check('Sin errores de consola (móvil)', page.errors.length === 0, page.errors.join(' | '));
    await ctx.close();
  }

  // 4. Simulador de WhatsApp
  {
    const { ctx, page } = await newPage(browser, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const outbound = [];
    page.on('request', r => { if (!r.url().startsWith(BASE)) outbound.push(r.url()); });
    let popups = 0; ctx.on('page', () => { popups++; });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    const startUrl = page.url();
    const preview = page.locator('#sim-preview');
    check('Mensaje inicial correcto', (await preview.innerText()).includes('Corte clásico') && (await preview.innerText()).includes('sábado, por la tarde'));
    await page.selectOption('#sim-servicio', 'Arreglo de barba');
    await page.selectOption('#sim-dia', 'miércoles');
    await page.locator('label.chip', { hasText: 'Mañana' }).click();
    const text = await preview.innerText();
    check('La vista previa se actualiza con servicio, día y horario', text === 'Hola, Taller Norte. Me gustaría agendar: Arreglo de barba. Día preferido: miércoles, por la mañana. ¿Tienen espacio disponible?', text);
    const link = await page.locator('#sim-link').textContent();
    const decoded = decodeURIComponent(link.split('?text=')[1] || '');
    check('Enlace técnico codificado correctamente (acentos, ¿, +)', link.startsWith('https://wa.me/52XXXXXXXXXX?text=') && decoded === text, link.slice(0, 80));
    await page.locator('#sim-form button[type=submit]').click();
    await page.waitForTimeout(400);
    check('Al simular aparece la burbuja con el mensaje', (await page.locator('#sim-sent').isVisible()) && (await page.locator('#sim-sent-text').innerText()) === text);
    check('Aviso visible de que no se envió nada', (await page.locator('#sim-result').innerText()).includes('no se envió nada'));
    check('Región aria-live anuncia el resultado', (await page.locator('#sim-live').textContent()).includes('no se envió nada'));
    const phoneTop = await page.evaluate(() => document.querySelector('.phone').getBoundingClientRect());
    check('En móvil, el teléfono queda a la vista tras simular', phoneTop.top < 844 && phoneTop.bottom > 0, `top=${Math.round(phoneTop.top)}`);
    await page.locator('#sim-form button[type=submit]').click();
    check('Repetir la simulación no duplica burbujas', (await page.locator('.bubble').count()) === 1);
    check('No navega, no abre ventanas ni hace peticiones externas', page.url() === startUrl && popups === 0 && outbound.length === 0, outbound.join(', '));
    // Botón "Elegir" en servicios
    await page.locator('.service-pick[data-service="Corte + barba"]').click();
    await page.waitForTimeout(1000);
    const sel = await page.evaluate(() => ({ v: document.querySelector('#sim-servicio').value, f: document.activeElement.id }));
    check('"Elegir" preselecciona el servicio y enfoca el selector', sel.v === 'Corte + barba' && sel.f === 'sim-servicio', JSON.stringify(sel));
    check('Vista previa refleja el servicio elegido', (await preview.innerText()).includes('Corte + barba'));
    check('Sin errores de consola (simulador)', page.errors.length === 0, page.errors.join(' | '));
    await ctx.close();
  }

  // 5. Movimiento reducido
  {
    const { ctx, page } = await newPage(browser, { viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    const anim = await page.evaluate(() => getComputedStyle(document.querySelector('.ticker-track')).animationName);
    check('Con movimiento reducido, la franja no se anima', anim === 'none', anim);
    await ctx.close();
  }

  // 6. Sin JavaScript
  {
    const { ctx, page } = await newPage(browser, { viewport: { width: 1366, height: 800 }, javaScriptEnabled: false });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    const ok = await page.evaluate(() => !!document.querySelector('#servicios h2') && document.querySelector('#sim-preview').textContent.includes('Hola, Taller Norte'));
    check('Sin JavaScript el contenido y el mensaje de ejemplo siguen visibles', ok);
    await ctx.close();
  }

  // 7. Página 404
  {
    const { ctx, page } = await newPage(browser, { viewport: { width: 390, height: 844 } });
    await page.goto(BASE + '404.html', { waitUntil: 'networkidle' });
    check('404.html carga sin errores', (await page.locator('h1').textContent()).includes('encontrada') && page.errors.length === 0, page.errors.join(' | '));
    await ctx.close();
  }

  await browser.close();
  const failed = results.filter(r => !r.ok);
  for (const r of results) console.log(`${r.ok ? 'OK   ' : 'FALLA'} ${r.name}${r.detail && !r.ok ? ' — ' + r.detail : ''}`);
  console.log(`\n${results.length - failed.length}/${results.length} comprobaciones superadas.`);
  process.exit(failed.length ? 1 : 0);
})();
