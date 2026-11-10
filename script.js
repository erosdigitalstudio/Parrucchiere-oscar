'use strict';

/* ------------------------------------------------------------------
   CONFIGURAZIONE CONTATTI
   Compila solo i campi che vuoi mostrare: quelli vuoti vengono nascosti.
   - whatsapp: solo cifre con prefisso internazionale, es. "39..."
   - mappaUrl: link a Google Maps o a un'altra mappa
   ------------------------------------------------------------------ */
const CONFIG = {
  telefono: '',
  whatsapp: '',
  email: '',
  indirizzo: '',
  mappaUrl: '',
  orari: '',
  instagram: '',
  facebook: ''
};

const GALLERY_MAX = 9; // cerca assets/gallery-1.jpg ... gallery-9.jpg

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

/* Gallery e lightbox */
const grid = $('#galleryGrid');
const lb = $('#lightbox');
const lbImg = $('#lbImg');
let photos = [];
let current = 0;

const showPhoto = i => {
  current = (i + photos.length) % photos.length;
  lbImg.src = photos[current];
  lbImg.alt = `Gallery, immagine ${current + 1} di ${photos.length}`;
};

(async () => {
  const checks = await Promise.all(
    Array.from({ length: GALLERY_MAX }, (_, i) => `assets/gallery-${i + 1}.jpg`)
      .map(async src => (await probe(src)) ? src : null)
  );
  photos = checks.filter(Boolean);
  if (!photos.length) { $('#galleryEmpty').hidden = false; return; }
  photos.forEach((src, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tile';
    b.style.backgroundImage = `url("${src}")`;
    b.setAttribute('aria-label', `Apri l'immagine ${i + 1}`);
    b.addEventListener('click', () => {
      showPhoto(i);
      if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    });
    grid.appendChild(b);
  });
})();

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

/* Prenotazioni */
const form = $('#bookingForm');
const status = $('#formStatus');
const dateField = $('#dateField');
dateField.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

form.addEventListener('submit', e => {
  e.preventDefault();
  let ok = true;
  $$('input, select, textarea', form).forEach(f => {
    const bad = !f.checkValidity();
    f.setAttribute('aria-invalid', String(bad));
    if (bad) ok = false;
  });
  if (!ok) { status.textContent = 'Controlla i campi evidenziati e riprova.'; return; }

  const d = Object.fromEntries(new FormData(form));
  const giorno = new Date(d.data + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  const msg = `Buongiorno, vorrei prenotare un appuntamento.\nNome: ${d.nome}\nServizio: ${d.servizio}\nGiorno preferito: ${giorno}\nFascia oraria: ${d.fascia}` + (d.note ? `\nNote: ${d.note}` : '');

  if (CONFIG.whatsapp) {
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    status.textContent = 'Si apre WhatsApp con la richiesta pronta da inviare.';
  } else if (CONFIG.email) {
    window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent('Richiesta di appuntamento')}&body=${encodeURIComponent(msg)}`;
    status.textContent = 'Si apre il tuo programma di posta con la richiesta pronta da inviare.';
  } else {
    status.textContent = 'La prenotazione online non è ancora attiva. Contatta direttamente il salone.';
  }
});
$$('input, select, textarea', form).forEach(f =>
  f.addEventListener('input', () => f.removeAttribute('aria-invalid')));

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
