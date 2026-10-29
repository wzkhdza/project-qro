'use strict';
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir menú');
}));
const dialog = document.querySelector('#demo-dialog');
document.querySelector('#demo-whatsapp').addEventListener('click', () => {
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else document.querySelector('#demo-status').textContent = 'Demostración: aquí se conectaría el WhatsApp autorizado del negocio. No se envían mensajes.';
});
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
document.querySelector('#dialog-ok').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
