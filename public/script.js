'use strict';

/* ---------- Menú móvil ---------- */
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#nav-principal');

if (toggle && nav) {
  const setMenu = (open, { returnFocus = false } = {}) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (!open && returnFocus) toggle.focus();
  };
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  toggle.addEventListener('click', () => setMenu(!isOpen()));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isOpen()) setMenu(false, { returnFocus: true });
  });
  // Cerrar al tocar fuera del menú.
  document.addEventListener('click', event => {
    if (isOpen() && !nav.contains(event.target) && !toggle.contains(event.target)) setMenu(false);
  });
  // Cerrar al pasar a escritorio para no dejar aria-expanded="true" desfasado.
  const desktop = window.matchMedia('(min-width: 901px)');
  desktop.addEventListener('change', event => { if (event.matches) setMenu(false); });
}

/* ---------- Simulador de WhatsApp (no envía nada) ---------- */
const form = document.querySelector('#sim-form');

if (form) {
  const service = form.querySelector('#sim-servicio');
  const day = form.querySelector('#sim-dia');
  const preview = document.querySelector('#sim-preview');
  const link = document.querySelector('#sim-link');
  const sent = document.querySelector('#sim-sent');
  const sentText = document.querySelector('#sim-sent-text');
  const sentTime = document.querySelector('#sim-sent-time');
  const result = document.querySelector('#sim-result');
  const live = document.querySelector('#sim-live');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const buildMessage = () => {
    const turno = form.querySelector('input[name="turno"]:checked');
    return `Hola, Taller Norte. Me gustaría agendar: ${service.value}. ` +
      `Día preferido: ${day.value}, ${turno ? turno.value : 'cualquier horario'}. ¿Tienen espacio disponible?`;
  };

  const update = () => {
    const message = buildMessage();
    preview.textContent = message;
    // Número de ejemplo: en la versión comercial se usa el número autorizado del negocio.
    link.textContent = `https://wa.me/52XXXXXXXXXX?text=${encodeURIComponent(message)}`;
  };

  form.addEventListener('change', update);

  form.addEventListener('submit', event => {
    event.preventDefault();
    sentText.textContent = buildMessage();
    sentTime.textContent = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    sent.hidden = false;
    result.hidden = false;
    result.textContent = 'Simulación completada: en el sitio real se abriría WhatsApp con este mensaje. Aquí no se envió nada.';
    // Vaciar y volver a escribir para que el lector de pantalla lo anuncie también en envíos repetidos.
    live.textContent = '';
    setTimeout(() => { live.textContent = result.textContent; }, 100);
    // En móvil el teléfono queda debajo del formulario: mostrar el resultado.
    sent.closest('.phone').scrollIntoView({ block: 'nearest', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });

  // Botones "Elegir" de la lista de servicios: preseleccionan el servicio en el simulador.
  document.querySelectorAll('.service-pick[data-service]').forEach(pick => {
    pick.addEventListener('click', event => {
      event.preventDefault();
      service.value = pick.dataset.service;
      update();
      document.querySelector('#contacto').scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      service.focus({ preventScroll: true });
    });
  });

  update();
}

/* ---------- Año del pie ---------- */
const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());
