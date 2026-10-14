// ===== JORNADAS COMPARATIVAS =====
export async function initJornadas() {
  const grid = document.getElementById('jornadas-compare');
  if (!grid) return;

  showSkeletons(grid, 2);

  try {
    const res = await fetch('data/jornadas.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const jornadas = await res.json();
    renderJornadas(grid, jornadas);
  } catch (e) {
    console.error('Error cargando jornadas:', e);
    showError(grid, 'No se pudieron cargar las jornadas. Intenta recargar la página.');
  }
}

function showSkeletons(container, count) {
  container.innerHTML = Array.from({ length: count }, () => `
    <article class="jornada-card skeleton" aria-hidden="true">
      <div class="jornada-track-badge"></div>
      <h3 class="jornada-title"></h3>
      <div class="jornada-date"></div>
      <p class="jornada-desc"></p>
      <div class="jornada-audience"><div class="audience-label"></div><div class="audience-list"></div></div>
      <div class="jornada-venue"></div>
      <div class="jornada-actions"><button class="btn"></button></div>
    </article>
  `).join('');
}

function showError(container, message) {
  container.innerHTML = `
    <div class="empty-state" role="alert" style="grid-column: 1 / -1;">
      <span class="icon">📅</span>
      <h3>Jornadas no disponibles</h3>
      <p>${message}</p>
      <button class="btn btn-outline" onclick="location.reload()" style="margin-top: var(--space-4);">Reintentar</button>
    </div>
  `;
}

function renderJornadas(grid, jornadas) {
  const now = new Date();
  grid.innerHTML = jornadas.map(j => renderJornadaCard(j, now)).join('');

  // Add click handlers for buttons
  grid.querySelectorAll('.jornada-card').forEach(card => {
    const primaryBtn = card.querySelector('.btn-primary');
    if (primaryBtn) {
      primaryBtn.addEventListener('click', e => {
        if (primaryBtn.disabled) {
          e.preventDefault();
          return;
        }
        // If it's a map link, let it navigate normally
        if (primaryBtn.tagName === 'A') return;
        // Otherwise scroll to registro
        e.preventDefault();
        document.getElementById('registro')?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  });
}

function renderJornadaCard(j, now) {
  const start = new Date(j.schedule[0]?.time ? `2026-10-${j.id === 'hacking-day' ? '14' : '15'}T${j.schedule[0].time}:00-03:00` : '');
  const end = new Date(j.schedule[j.schedule.length - 1]?.time ? `2026-10-${j.id === 'hacking-day' ? '14' : '15'}T${j.schedule[j.schedule.length - 1].time}:00-03:00` : '');
  const status = getEventStatus(start, end, now);
  const mapsUrl = j.id === 'hacking-day'
    ? 'https://maps.google.com/?q=UNICEN+Campus+Universitario+Tandil'
    : 'https://maps.google.com/?q=Distrito+Avellaneda+Tandil';

  const audience = j.id === 'hacking-day'
    ? ['Desarrolladores', 'Estudiantes', 'Pentesters', 'CTF Players', 'Curiosos de seguridad']
    : ['Founders', 'Inversores', 'Product Managers', 'Estudiantes', 'Público general'];

  const trackNumber = j.id === 'hacking-day' ? 'Track 01' : 'Track 02';
  const trackLabel = j.id === 'hacking-day' ? 'Ciberseguridad' : 'Startups';

  return `
    <article class="jornada-card" data-id="${j.id}" role="listitem" tabindex="0" aria-label="${j.title}: ${j.description.substring(0, 100)}...">
      <span class="jornada-status ${status}" aria-label="Estado: ${getStatusLabel(status)}">
        <span aria-hidden="true">${getStatusIcon(status)}</span>
        ${getStatusLabel(status)}
      </span>

      <span class="jornada-track-badge">${trackNumber} · ${trackLabel}</span>

      <h3 class="jornada-title">${j.title}</h3>
      <time class="jornada-date" datetime="${j.date}">${j.date}</time>

      <p class="jornada-desc">${j.description}</p>

      <div class="jornada-audience">
        <span class="audience-label">Ideal para</span>
        <div class="audience-list">
          ${audience.map(a => `<span class="audience-tag">${a}</span>`).join('')}
        </div>
      </div>

      <div class="jornada-venue">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        <strong>Sede:</strong> ${j.location}
        <a href="${mapsUrl}" target="_blank" rel="noopener" class="venue-map" aria-label="Ver ${j.location} en Google Maps">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          Mapa
        </a>
      </div>

      <div class="jornada-actions">
        ${renderPrimaryAction(j, status, mapsUrl)}
        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('agenda')?.scrollIntoView({behavior:'smooth'})">Ver agenda completa</button>
      </div>
    </article>
  `;
}

function getEventStatus(start, end, now) {
  if (now < start) return 'soon';
  if (now >= start && now <= end) return 'live';
  return 'ended';
}

function getStatusLabel(status) {
  return { live: 'EN VIVO', soon: 'PRÓXIMO', ended: 'FINALIZADO' }[status];
}

function getStatusIcon(status) {
  return { live: '🔴', soon: '⏳', ended: '✅' }[status];
}

function renderPrimaryAction(j, status, mapsUrl) {
  if (status === 'live') {
    return `<a href="${mapsUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">📍 Ir a la sede</a>`;
  }
  if (status === 'soon') {
    return `<a href="#registro" class="btn btn-primary btn-sm">Inscribirme</a>`;
  }
  return `<button class="btn btn-secondary btn-sm" disabled>Finalizado</button>`;
}