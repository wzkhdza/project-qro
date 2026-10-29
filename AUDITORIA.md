# Auditoría técnica y comercial: Taller Norte (demo)

Fecha: 2026-10-29 · Alcance: `index.html`, `styles.css`, `script.js`, `app.js`, 10 SVG, `README.md` y `AUDITORIA.md` del ZIP original.

## Cómo se verificó

| Método | Qué se hizo realmente |
|---|---|
| Lectura de código | Todos los archivos del ZIP, línea por línea. |
| Render en Chromium (Playwright) | Capturas de página completa a 320, 390, 820 y 1366 px, de la versión original y de la nueva. |
| Medición de contraste | Script que calcula la relación WCAG de cada texto visible contra su fondo real. |
| Pruebas funcionales automáticas | `tests/verificar.js`: 47 comprobaciones, todas superadas en la versión nueva. |
| Lighthouse 12.2.1 | Móvil y escritorio, original frente a nueva, sobre un servidor local. |
| CSP | Las pruebas inyectan la política de `_headers` para detectar violaciones antes de publicar. |

**No se verificó:** dispositivos físicos, Safari real (iOS o macOS), Firefox, lectores de pantalla reales ni el despliegue en Cloudflare. Ver "Pendiente de prueba manual".

## Resultados medidos (antes → después)

| Métrica (Lighthouse, servidor local) | Original | Nueva |
|---|---|---|
| Rendimiento móvil | 88 (LCP 3,0 s) | 100 (LCP 1,7 s) |
| Accesibilidad | 95 | 100 |
| Buenas prácticas | 100 | 100 |
| SEO | 100 | 63 **intencional**: `noindex` (ver H-16) |
| Textos que no cumplen contraste AA | 25 | 0 |

## Tabla de auditoría

C = **comprobado** (reproducido con captura, medición o prueba) · P = **posible** (riesgo razonado, no reproducible en este entorno)

| # | Problema | Tipo | Gravedad | Solución aplicada | Estado |
|---|---|---|---|---|---|
| H-1 | `README.md` y `AUDITORIA.md` estaban en la raíz del sitio: Cloudflare los publicaría en `/README.md`, y el README menciona por nombre al negocio prospecto. | C | **Alta** | El sitio se movió a `public/` y los documentos quedan fuera. Se eliminó la mención al prospecto. | Corregido |
| H-2 | Texto encimado en el hero (escritorio): el pie "ESTILO CLÁSICO / VISIÓN ACTUAL" cae sobre "CONCEPTO EDITORIAL ORIGINAL", que viene dentro del SVG. El sello "HECHO CON DETALLE" tapa la ilustración y su texto. | C | **Alta** | Las ilustraciones se rehicieron sin texto incrustado. El sello ahora tiene fondo propio y el pie va en una etiqueta HTML. | Corregido |
| H-3 | 25 textos bajo el contraste WCAG AA, entre ellos **los propios avisos de "ficticio"** (3,26–3,38:1) y las etiquetas de sección (3,1–3,7:1). | C | **Alta** | Nueva paleta de tokens: oliva `#5f7132` y `#4d5e26`, gris `#545a4f`. | Corregido (0 fallos) |
| H-4 | Galería: rótulos en inglés dentro de los SVG ("01 / CLASSIC FORM", "THE TOOLS") en un sitio en español. `object-fit: cover` los recorta. | C | Media | Los SVG ya no tienen texto. Los rótulos en español van en `<figcaption>`. | Corregido |
| H-5 | Calidad visual de las ilustraciones: el sillón del hero no se reconoce (parece una figura con "orejas") y el retrato es caricaturesco. Ante una barbería profesional resta credibilidad. | C (captura) / juicio | Media | 4 ilustraciones nuevas: sillón de barbero, navaja y brocha, tijera y peine, poste. Sin rostros ni fotos de terceros. | Corregido |
| H-6 | Archivos sobrantes que se publicarían: `app.js` (código muerto que busca `.menu-toggle`, `#nav` y `#demo-dialog`, que no existen), `hero-chair.svg` (dice "ESTUDIO NORTE", otra marca) y `style-01/02/03.svg`. El README decía 4 SVG y había 10. | C | Media | Eliminados. Se verificó que nada los referencia. | Corregido |
| H-7 | Simulador de WhatsApp: solo mostraba un párrafo de texto. No demostraba lo que se vende (que el cliente llegue con el mensaje ya escrito). | C | Media | Simulador nuevo: servicio, día y horario → vista previa del mensaje en un teléfono simulado + enlace técnico `wa.me` codificado. Sin número, sin datos personales y sin navegar. | Corregido |
| H-8 | Flechas ↗ en las filas de servicios que no eran clicables (señal falsa de interacción). | C | Media | Botón "Elegir" real, que preselecciona el servicio en el simulador. | Corregido |
| H-9 | Fuentes cargadas con `@import` dentro del CSS: cadena HTML → CSS → Google CSS → fuente. Rendimiento móvil 88, LCP 3,0 s. | C | Media | Fuentes autoalojadas (58 KB, licencia OFL incluida) con `preload`. Sin peticiones a terceros. | Corregido |
| H-10 | Sin metadatos Open Graph: el enlace enviado a prospectos por WhatsApp saldría sin imagen ni descripción. | C | Media | OG y Twitter Card + `og-image.png` de 1200×630. | Parcial: falta poner la URL absoluta tras publicar (ver README) |
| H-11 | Un negocio ficticio indexable en Google puede confundirse con uno real o con otro que se llame igual. | P (riesgo) | Media | `noindex` en `<meta>` y en `X-Robots-Tag`. Sin datos estructurados `LocalBusiness`, porque serían datos falsos. | Corregido |
| H-12 | Menú móvil: no se cerraba al tocar fuera; con Esc el foco no volvía al botón; al pasar a escritorio con el menú abierto quedaba `aria-expanded="true"`. | C | Media | Las tres situaciones están cubiertas. Además, el ícono pasa a ✕ y el botón mide 48×48 px. | Corregido |
| H-13 | Textos de 8–9 px en móvil (franja de demo, pies de galería, `hero-foot`). | C | Media | Mínimo 10–11 px. Solo el lema del logotipo queda en 9 px. | Corregido |
| H-14 | "01 / 03 … DESLIZA PARA EXPLORAR" sugiere un carrusel que no existe. | C | Baja | Cambiado por un enlace real "Explorar ↓". | Corregido |
| H-15 | La franja de valores estaba estática y cortada a media palabra en móvil ("EST"). Además estaba marcada como `<section>` con etiqueta, y el lector de pantalla repetía las palabras. | C | Baja | Animación continua que respeta "reducir movimiento" (verificado). Se marcó como decorativa con `aria-hidden`. | Corregido |
| H-16 | Página de ~5.500 px en móvil sin acceso al menú salvo volviendo arriba. | C | Baja | Encabezado fijo con `scroll-padding`. Se verificó que ninguna sección queda tapada. | Corregido |
| H-17 | Botones y enlaces de texto de 36–38 px de alto en móvil (por debajo de la recomendación de 44 px). | C | Baja | Todos ≥ 44 px (verificado). | Corregido |
| H-18 | `aria-label` en el mapa decorativo (un `div` sin rol): los lectores lo ignoran. El enlace a Maps no avisaba que abre otra pestaña. | C | Baja | `role="img"` con descripción, y texto oculto "(se abre en otra pestaña)". | Corregido |
| H-19 | El CSS original estaba minificado en una sola línea: difícil de mantener o adaptar a clientes. | C | Baja | Reescrito por secciones, con tokens de color y comentarios. | Corregido |
| H-20 | `theme-color` oscuro (`#111411`) frente a un encabezado claro. | C | Baja | `#f4f0e6`. | Corregido |
| H-21 | Sin `404.html`: Cloudflare Pages devuelve `index.html` para cualquier ruta inexistente (comportamiento SPA documentado). | P | Baja | `404.html` propia (probada en local). | Corregido (probar en Cloudflare) |
| H-22 | El símbolo ✳ (U+2733) en logotipo, favicon, mapa y franja puede mostrarse como **emoji de color** en iOS/Android. En el favicon dependía de las fuentes del sistema. | P | Media | Sustituido por un ícono SVG propio, idéntico en todos los dispositivos. | Mitigado (no verificable sin iPhone) |
| H-23 | Sin cabeceras de seguridad. | C | Baja | `_headers` con CSP estricta, `nosniff`, `Referrer-Policy` y `Permissions-Policy`. Las pruebas pasan bajo esa CSP. | Corregido (confirmar con `curl -I`) |
| H-24 | Los chips de horario usan `:has()` para el estado activo. En Firefox < 121 y Safari < 15.4 no se rellenan. | P | Baja | Degradación aceptable: el radio sigue visible y funcional. | Aceptado |

## Lo que se conservó

Identidad Taller Norte, paleta verde/lima, tipografías, estructura de 5 secciones, precios de ejemplo, horario y zona referencial, enlace a Google Maps y todos los avisos de que es ficticio (reforzados). No se añadieron fotos, reseñas, testimonios, cifras ni logotipos de terceros.

## Verificado automáticamente (`tests/verificar.js`, 47/47)

- Carga sin errores de consola ni recursos fallidos, bajo la CSP real de `_headers`. Ninguna petición a terceros al cargar.
- Todas las anclas e imágenes existen y cargan. Todas las imágenes tienen `alt`. Hay un solo `h1` y la jerarquía de títulos es correcta.
- Sin scroll horizontal a 320, 360, 390, 768, 920, 1024, 1366 y 1920 px. El menú de escritorio cabe en una línea a 920 y 1024 px.
- Menú móvil: abrir, cerrar al tocar fuera, Esc con retorno de foco, cada enlace cierra el menú y la sección queda visible bajo el encabezado fijo, y se restablece al pasar a escritorio.
- Simulador: mensaje inicial; actualización con servicio, día y horario; enlace `wa.me` que se decodifica exactamente al mensaje (acentos, `¿`, `+`); burbuja y aviso tras simular; región `aria-live`; sin burbujas duplicadas; sin navegación, ventanas emergentes ni peticiones externas; "Elegir" preselecciona y enfoca.
- Con "reducir movimiento" no hay animación. Sin JavaScript, el contenido y el mensaje de ejemplo siguen visibles. La 404 carga.

## Pendiente de prueba manual

1. **iPhone (Safari) y Android (Chrome) físicos**: encabezado fijo, selectores nativos, que no haya zoom al tocar los campos, orientación horizontal.
2. **Lector de pantalla real** (VoiceOver o TalkBack): orden de lectura, menú y anuncio del resultado del simulador. Solo se probó la estructura ARIA de forma automática.
3. **Cloudflare Pages**: que `_headers` se aplique (`curl -I`), la 404 en una ruta inexistente y Lighthouse sobre la URL pública.
4. **Vista previa al compartir**: después de poner `og:image` absoluta, enviar el enlace por WhatsApp.
5. **Firefox y Safari de escritorio**: revisión visual rápida.
6. **Opinión de un barbero real** sobre el tono y las ilustraciones antes de usar la demo en ventas.

## Recomendaciones comerciales

- Al presentarla, decir "demo de concepto". No afirmar que fue probada en todos los dispositivos ni que recibe citas.
- Considerar añadir en el pie el crédito de la agencia (por ejemplo, "Diseño: [nombre de la agencia]") una vez que esté definido.
- Antes de convertirla para un cliente, seguir la lista "Convertir en sitio de un cliente real" del README.
