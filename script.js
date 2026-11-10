'use strict';

/* ------------------------------------------------------------------
   CONFIGURAZIONE CONTATTI
   Compila solo i campi che vuoi mostrare: quelli vuoti vengono nascosti.
   - whatsapp: solo cifre con prefisso internazionale, es. "39..."
   - mappaUrl: link a Google Maps o a un'altra mappa
   ------------------------------------------------------------------ */
const CONFIG = {
  telefono: '+39 045 8102216',
  whatsapp: '',
  email: '',
  indirizzo: 'Via Arnolfo di Cambio 14, 37138 Verona VR',
  mappaUrl: 'https://www.google.com/maps/search/?api=1&query=Via%20Arnolfo%20di%20Cambio%2014%2C%2037138%20Verona',
  orari: '',
  instagram: '',
  facebook: ''
};

/* Fotografie dimostrative di repertorio Unsplash: sostituire con lavori reali approvati dal salone. */
const GALLERY = [
  {src:'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80',label:'Ispirazione salone e styling'},
  {src:'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80',label:'Ispirazione capelli e colore'},
  {src:'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1000&q=80',label:'Ispirazione taglio e piega'},
  {src:'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=1000&q=80',label:'Ispirazione hairstyling'},
  {src:'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1000&q=80',label:'Ispirazione capelli lunghi'},
  {src:'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80',label:'Ispirazione beauty e capelli'}
];
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.documentElement.classList.add('js');

/* Carica un'immagine solo se esiste */
const probe = src => new Promise(resolve => {
  const img = new Image();
  img.onload = () => resolve(true);
  img.onerror = () => resolve(false);
  img.src = src;
});

/* Header, menu mobile */
const header = $('.site-header');
const toggle = $('.nav-toggle');
const nav = $('#menu');

const setMenu = open => {
  document.body.classList.toggle('nav-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  document.body.style.overflow = open ? 'hidden' : '';
};
toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('nav-open')));
$$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
window.addEventListener('resize', () => { if (window.innerWidth > 900) setMenu(false); });

const onScroll = () => header.classList.toggle('solid', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* Voce di menu attiva */
if ('IntersectionObserver' in window) {
  const links = new Map($$('.nav a').map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const l = links.get(en.target.id);
        if (l) l.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));
}

/* Animazioni allo scroll */
const revealEls = $$('[data-reveal]');
if (reduced || !('IntersectionObserver' in window)) {
  revealEls.forEach(el => el.classList.add('in'));
} else {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  revealEls.forEach(el => io.observe(el));
}

/* Immagini principali (hero e salone) */
$$('[data-img]').forEach(async el => {
  const src = el.dataset.img;
  if (await probe(src)) el.style.backgroundImage = `url("${src}")`;
});

/* Galleria dimostrativa e lightbox accessibile */
const grid = $('#galleryGrid');
const lb = $('#lightbox');
const lbImg = $('#lbImg');
let photos = [];
let current = 0;
const showPhoto = i => {
  if (!photos.length) return;
  current = (i + photos.length) % photos.length;
  lbImg.src = photos[current].src;
  lbImg.alt = photos[current].label + ' — immagine dimostrativa';
};
GALLERY.forEach(photo => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'tile';
  b.setAttribute('aria-label', 'Ingrandisci: ' + photo.label + ' (foto dimostrativa)');
  const img = document.createElement('img');
  img.src = photo.src;
  img.alt = photo.label;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.addEventListener('error', () => {
    b.remove();
    photos = photos.filter(p => p !== photo);
    if (!photos.length) $('#galleryEmpty').hidden = false;
  }, {once:true});
  b.appendChild(img);
  b.addEventListener('click', () => {
    const i = photos.indexOf(photo);
    if (i < 0) return;
    showPhoto(i);
    if (typeof lb.showModal === 'function') lb.showModal();
    else lb.setAttribute('open', '');
  });
  grid.appendChild(b);
  photos.push(photo);
});
lb.addEventListener('click', e => {
  const act = e.target.dataset && e.target.dataset.lb;
  if (act === 'close' || e.target === lb) lb.close();
  if (act === 'prev') showPhoto(current - 1);
  if (act === 'next') showPhoto(current + 1);
});
lb.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') showPhoto(current - 1);
  if (e.key === 'ArrowRight') showPhoto(current + 1);
});
/* Contatti */
(() => {
  const list = $('#contactList');
  const items = [];
  const add = (label, html) => items.push(`<li><strong>${label}</strong>${html}</li>`);
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const url = s => /^https?:\/\//i.test(s) ? s : '';

  if (CONFIG.indirizzo) {
    const map = url(CONFIG.mappaUrl);
    add('Dove siamo', map
      ? `<a href="${esc(map)}" target="_blank" rel="noopener">${esc(CONFIG.indirizzo)}</a>`
      : esc(CONFIG.indirizzo));
  }
  if (CONFIG.orari) add('Orari', esc(CONFIG.orari).replace(/\n/g, '<br>'));
  if (CONFIG.telefono) add('Telefono', `<a href="tel:${esc(CONFIG.telefono.replace(/[^\d+]/g, ''))}">${esc(CONFIG.telefono)}</a>`);
  if (CONFIG.whatsapp) add('WhatsApp', `<a href="https://wa.me/${esc(CONFIG.whatsapp)}" target="_blank" rel="noopener">Scrivici su WhatsApp</a>`);
  if (CONFIG.email) add('Email', `<a href="mailto:${esc(CONFIG.email)}">${esc(CONFIG.email)}</a>`);
  if (url(CONFIG.instagram)) add('Instagram', `<a href="${esc(CONFIG.instagram)}" target="_blank" rel="noopener">Seguici su Instagram</a>`);
  if (url(CONFIG.facebook)) add('Facebook', `<a href="${esc(CONFIG.facebook)}" target="_blank" rel="noopener">Seguici su Facebook</a>`);

  if (items.length) list.innerHTML = items.join(''); else $('#contactEmpty').hidden = false;
})();

$('#year').textContent = new Date().getFullYear();
