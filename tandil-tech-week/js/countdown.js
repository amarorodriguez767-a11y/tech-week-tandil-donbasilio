export function initCountdown() {
  const target = new Date('2026-09-17T19:00:00-03:00').getTime();
  const els = {
    d: document.getElementById('cd-days'),
    h: document.getElementById('cd-hours'),
    m: document.getElementById('cd-mins'),
    s: document.getElementById('cd-secs')
  };

  if (!els.d || !els.h || !els.m || !els.s) return;

  function update() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      Object.values(els).forEach(e => { e.textContent = '00'; e.style.color = 'var(--accent)'; });
      const note = document.querySelector('.countdown-note');
      if (note) note.textContent = '¡Las inscripciones ya están abiertas!';
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    els.d.textContent = String(d).padStart(2, '0');
    els.h.textContent = String(h).padStart(2, '0');
    els.m.textContent = String(m).padStart(2, '0');
    els.s.textContent = String(s).padStart(2, '0');
  }

  update();
  const interval = setInterval(update, 1000);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => clearInterval(interval), { once: true });
}