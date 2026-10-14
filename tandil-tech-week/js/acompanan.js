export async function initAcompanan() {
  const grid = document.getElementById('sponsors-grid');
  if (!grid) return;

  showSkeletons(grid, 4);

  try {
    const res = await fetch('data/sponsors.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const sponsors = await res.json();
    renderSponsors(grid, sponsors);
  } catch (e) {
    console.error('Error sponsors:', e);
    showError(grid, 'No se pudieron cargar los sponsors. Intenta recargar la página.');
  }
}

function showSkeletons(container, count) {
  container.innerHTML = Array.from({ length: count }, () => `
    <a class="sponsor-card skeleton terminal-window" aria-hidden="true" style="min-width: 140px; min-height: 80px;"></a>
  `).join('');
}

function showError(container, message) {
  container.innerHTML = `
    <div class="empty-state" role="alert" style="width: 100%; text-align: center;">
      <span class="icon">🤝</span>
      <h3>Sponsors no disponibles</h3>
      <p>${message}</p>
      <button class="btn btn-outline" onclick="location.reload()" style="margin-top: var(--space-4);">Reintentar</button>
    </div>
  `;
}

function renderSponsors(grid, sponsors) {
  grid.innerHTML = sponsors.map(s => `
    <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="sponsor-card terminal-window" aria-label="${s.name}" style="padding: var(--space-3) var(--space-5);">
      ${s.logo ? `<img src="${s.logo}" alt="${s.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">` : ''}
      <span class="sponsor-fallback" style="display: ${s.logo ? 'none' : 'block'};">${s.name}</span>
    </a>
  `).join('');
}