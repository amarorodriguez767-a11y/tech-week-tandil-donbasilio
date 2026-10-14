import { initNav, initHeroTyping } from './nav.js';
import { initEasterEggs } from './easter-eggs.js';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHeroTyping();
  initEasterEggs();
  loadPartials();
});

async function loadPartials() {
  const partials = [
    { id: 'header', url: 'components/nav.html' },
    { id: 'hero', url: 'components/hero.html' },
    { id: 'estado-evento', url: 'components/estado-evento.html' },
    { id: 'jornadas', url: 'components/jornadas.html' },
    { id: 'faq', url: 'components/faq.html' },
    { id: 'agenda', url: 'components/agenda.html' },
    { id: 'speakers', url: 'components/speakers.html' },
    { id: 'organizan', url: 'components/organizan.html' },
    { id: 'acompanan', url: 'components/acompanan.html' },
    { id: 'footer', url: 'components/footer.html' },
    { id: 'modal', url: 'components/modal.html' }
  ];

  await Promise.all(partials.map(p => fetch(p.url).then(r => r.text()).then(html => {
    const el = document.getElementById(p.id);
    if (el) el.innerHTML = html;
  })));

  // Inicializar módulos que dependen de partials cargados
  import('./estado-evento.js').then(m => m.initEventStatus?.());
  import('./jornadas.js').then(m => m.initJornadas?.());
  import('./faq.js').then(m => m.initFAQ?.());
  import('./agenda.js').then(m => m.initAgenda?.());
  import('./speakers.js').then(m => m.initSpeakers?.());
  import('./modal.js').then(m => m.initModal?.());
  import('./countdown.js').then(m => m.initCountdown?.());
  import('./organizan.js').then(m => m.initOrganizan?.());
  import('./acompanan.js').then(m => m.initAcompanan?.());
}