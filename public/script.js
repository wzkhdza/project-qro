'use strict';
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#nav-principal');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    nav.classList.toggle('is-open', open);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    }
  });
}
const demoButton = document.querySelector('#demo-whatsapp');
const feedback = document.querySelector('#demo-feedback');
if (demoButton && feedback) {
  demoButton.addEventListener('click', () => {
    feedback.hidden = false;
    feedback.textContent = 'Vista previa: en la versión comercial, aquí se abriría WhatsApp del negocio con un mensaje de solicitud de cita. Esta demo no contacta a nadie.';
    feedback.scrollIntoView({block:'nearest', behavior:'smooth'});
  });
}
const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());
