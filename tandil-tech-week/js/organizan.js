export async function initOrganizan() {
  const grid = document.getElementById('organizan-grid');
  if (!grid) return;

  showSkeletons(grid, 4);

  try {
    const res = await fetch('data/organizers.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const organizers = await res.json();
    renderOrganizers(grid, organizers);
  } catch (e) {
    console.error('Error organizers:', e);
    showError(grid, 'No se pudieron cargar los organizadores. Intenta recargar la página.');
  }
}

function showSkeletons(container, count) {
  container.innerHTML = Array.from({ length: count }, () => `
    <article class="terminal-window organizer-card skeleton" aria-hidden="true">
      <div class="organizer-header">
        <div class="organizer-logo"></div>
        <div class="organizer-meta">
          <h3 class="organizer-name"></h3>
          <span class="organizer-type"></span>
        </div>
      </div>
      <p class="organizer-desc"></p>
      <div class="organizer-footer">
        <a class="organizer-link"></a>
      </div>
    </article>
  `).join('');
}

function showError(container, message) {
  container.innerHTML = `
    <div class="empty-state" role="alert" style="grid-column: 1 / -1;">
      <span class="icon">🏢</span>
      <h3>Organizadores no disponibles</h3>
      <p>${message}</p>
      <button class="btn btn-outline" onclick="location.reload()" style="margin-top: var(--space-4);">Reintentar</button>
    </div>
  `;
}

function renderOrganizers(grid, organizers) {
  grid.innerHTML = organizers.map(o => renderOrganizerCard(o)).join('');
}

function renderOrganizerCard(o) {
  return `
    <article class="terminal-window organizer-card" role="listitem">
      <div class="organizer-header">
        <div class="organizer-logo ${o.logo ? 'has-logo' : ''}" data-initial="${o.name[0].toUpperCase()}">
          ${o.logo ? `<img src="${o.logo}" alt="" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
          <span class="logo-fallback" style="display: ${o.logo ? 'none' : 'flex'};">${o.name[0].toUpperCase()}</span>
        </div>
        <div class="organizer-meta">
          <h3 class="organizer-name">${o.name}</h3>
          <span class="organizer-type">${o.type}</span>
        </div>
      </div>
      <p class="organizer-desc">${o.description}</p>
      <div class="organizer-footer">
        <a href="${o.url}" target="_blank" rel="noopener noreferrer" class="organizer-link">
          Visitar sitio
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
      </div>
    </article>
  `;
}