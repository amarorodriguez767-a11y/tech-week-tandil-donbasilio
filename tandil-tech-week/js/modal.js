let lastFocused = null;
let focusTrapHandler = null;

export function initModal() {
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');
  if (!overlay || !closeBtn) return;

  window.addEventListener('open-modal', e => openModal(e.detail));
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !overlay.hidden) closeModal(); });
}

function openModal({ type, id }) {
  const overlay = document.getElementById('modal-overlay');
  const body = document.getElementById('modal-body');
  const title = document.getElementById('modal-title');
  if (!overlay || !body || !title) return;

  lastFocused = document.activeElement;

  // Show loading
  body.innerHTML = `
    <div class="empty-state" style="padding: var(--space-8);">
      <div class="skeleton" style="width: 100px; height: 100px; border-radius: 50%; margin: 0 auto var(--space-4);"></div>
      <div class="skeleton" style="width: 60%; height: 2rem; margin: 0 auto var(--space-2);"></div>
      <div class="skeleton" style="width: 40%; height: 1.5rem; margin: 0 auto;"></div>
    </div>
  `;

  if (type === 'jornada') {
    renderJornadaModal(id, body, title);
  }

  overlay.hidden = false;
  document.body.style.overflow = 'hidden';

  // Focus management
  requestAnimationFrame(() => {
    const focusable = overlay.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusable?.focus();
    trapFocus(overlay);
  });
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.hidden = true;
  document.body.style.overflow = '';
  if (focusTrapHandler) {
    overlay.removeEventListener('keydown', focusTrapHandler);
    focusTrapHandler = null;
  }
  lastFocused?.focus();
}

function trapFocus(el) {
  const focusables = el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  focusTrapHandler = function handler(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  el.addEventListener('keydown', focusTrapHandler);
}

async function renderJornadaModal(id, body, titleEl) {
  try {
    const res = await fetch('data/jornadas.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const jornadas = await res.json();
    const j = jornadas.find(x => x.id === id);
    if (!j) throw new Error('Jornada no encontrada');

    titleEl.textContent = j.title;
    body.innerHTML = `
      <div class="modal-jornada">
        <div class="jornada-detail-header">
          <h3 class="jornada-detail-title">${j.title}</h3>
          <div class="jornada-meta">
            <span>📅 ${j.date}</span>
            <span>📍 ${j.location}</span>
            <span>🏷️ ${j.track}</span>
          </div>
        </div>
        <div class="detail-section">
          <h4>Descripción</h4>
          <p style="color: var(--fg-dim); line-height: 1.7;">${j.description}</p>
        </div>
        <div class="detail-section">
          <h4>Qué incluye</h4>
          <div class="detail-list">
            ${j.details.map(d => `<div class="detail-item"><span class="detail-bullet" style="color:var(--accent);">▸</span><span>${d}</span></div>`).join('')}
          </div>
        </div>
        <div class="detail-section">
          <h4>Cronograma</h4>
          <div class="detail-list">
            ${j.schedule.map(s => `
              <div class="detail-item">
                <span class="detail-time">${s.time}</span>
                <div class="detail-content"><strong>${s.event}</strong></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    // Re-trap focus after content loads
    const overlay = document.getElementById('modal-overlay');
    if (overlay) trapFocus(overlay);
  } catch (e) {
    console.error('Error modal jornada:', e);
    body.innerHTML = `
      <div class="modal-error" role="alert">
        <span class="icon">⚠</span>
        <h3>Error al cargar detalle</h3>
        <p>No se pudo cargar la información de la jornada.</p>
        <button class="btn btn-outline" onclick="window.dispatchEvent(new CustomEvent('open-modal', { detail: { type: 'jornada', id: '${id}' } }))">Reintentar</button>
      </div>
    `;
    const overlay = document.getElementById('modal-overlay');
    if (overlay) trapFocus(overlay);
  }
}