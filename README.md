# Taller Norte — demo de portafolio (marca ficticia)

Sitio estático de una sola página para presentar a barberías como ejemplo de trabajo.
**Taller Norte no existe**: nombre, servicios, precios, horario y ubicación son ficticios y así se indica en el propio sitio.
No hay reservaciones, pagos, cuentas ni backend. Costo de operación: $0 MXN.

## Estructura

```
public/                ← LO ÚNICO QUE SE PUBLICA
  index.html           contenido y secciones
  styles.css           diseño (colores en :root)
  script.js            menú móvil, simulador de WhatsApp, año del pie
  404.html             página de error propia
  _headers             cabeceras de seguridad y noindex para Cloudflare Pages
  assets/
    hero.svg, style-1..3.svg   ilustraciones originales (sin texto incrustado)
    favicon.svg, apple-touch-icon.png, og-image.png
    fonts/             Oswald y DM Sans autoalojadas + licencias OFL
tests/verificar.js     verificación automática opcional (no se publica)
AUDITORIA.md           informe de auditoría y cambios (no se publica)
```

Los documentos internos están **fuera** de `public/` a propósito: si se suben, cualquiera puede leerlos en `tu-sitio.pages.dev/README.md`.

## Ver en local

```bash
cd public
python3 -m http.server 8000
# abrir http://localhost:8000
```

También funciona con doble clic en `public/index.html`. Las cabeceras de `_headers` solo se aplican en Cloudflare.

## Publicar gratis en Cloudflare Pages

**Opción A: subida directa (sin Git)**
Cloudflare → Workers & Pages → Create → Pages → *Upload assets* → arrastra **la carpeta `public`** (no la raíz del repositorio) → Deploy.
Los nombres de los menús pueden variar.

**Opción B: conectado a GitHub**
Create → Pages → *Connect to Git* → este repositorio → *Build command*: vacío · *Build output directory*: `public`.

### Después de publicar (manual, 2 minutos)
1. En `public/index.html`, cambia `og:image` por la URL absoluta, por ejemplo `https://taller-norte.pages.dev/assets/og-image.png`, y vuelve a publicar. Sin la URL absoluta, WhatsApp y Facebook podrían no mostrar la imagen al compartir el enlace.
2. Comprueba las cabeceras: `curl -I https://TU-SITIO.pages.dev/` debe mostrar `x-robots-tag: noindex, nofollow` y `content-security-policy`.
3. Abre `https://TU-SITIO.pages.dev/no-existe`: debe verse la página 404 propia.
4. Envía el enlace a tu propio WhatsApp y revisa la vista previa.

## Editar contenido

- **Colores y tipografía:** variables en `:root` al inicio de `styles.css`. Las combinaciones actuales cumplen contraste WCAG AA. Si las cambias, vuelve a comprobarlo.
- **Servicios:** cada servicio aparece en **tres** lugares de `index.html`, que deben coincidir exactamente:
  1. el `<h3>` de la lista de servicios,
  2. el atributo `data-service` de su botón "Elegir",
  3. la `<option>` del selector `#sim-servicio`.
- **Mensaje de WhatsApp:** función `buildMessage()` en `script.js`. El texto inicial visible sin JavaScript está en `#sim-preview` dentro de `index.html`.
- **Imágenes:** son SVG sin texto incrustado, para que nada quede recortado ni en otro idioma. Los rótulos van en `<figcaption>`.

## Convertir en sitio de un cliente real

1. Permiso **por escrito** para usar nombre, logo, fotos, precios, horario, dirección y teléfono.
2. Sustituir todo el contenido ficticio y retirar la franja "Demo de portafolio", las notas de "ficticio" y los asteriscos de precio.
3. Cambiar el simulador por un enlace real: `https://wa.me/52NUMERO?text=` + `encodeURIComponent(mensaje)`, solo con el número autorizado del negocio. **No hacerlo en la demo.**
4. Quitar `noindex`, tanto el `<meta name="robots">` como el `X-Robots-Tag` de `_headers`. Añadir URL canónica y, si aplica, datos estructurados `LocalBusiness` con datos reales. Nunca hacerlo con datos ficticios.
5. Si se agrega analítica o formularios: aviso de privacidad, conforme a la LFPDPPP.
6. Probar en teléfonos reales y acordar por escrito la titularidad del dominio y el hosting, el soporte y el alcance de los cambios.

## Verificación automática (opcional)

Requiere Node y Playwright con Chromium. No forma parte del sitio ni se publica.

```bash
cd public && python3 -m http.server 8000 &
node tests/verificar.js http://localhost:8000/
```

Comprueba 47 puntos: carga sin errores bajo la misma CSP de `_headers`, anclas, imágenes, fuentes, ausencia de scroll horizontal (320–1920 px), menú móvil, simulador, movimiento reducido, funcionamiento sin JavaScript y página 404.

## Licencias

- Ilustraciones y código: originales de este proyecto.
- Fuentes Oswald y DM Sans: SIL Open Font License 1.1 (ver `public/assets/fonts/OFL-*.txt`).
