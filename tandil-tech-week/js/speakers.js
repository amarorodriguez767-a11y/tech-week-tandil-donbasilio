export async function initSpeakers() {
  const grid = document.getElementById('speakers-grid');
  if (!grid) return;

  // Show loading skeletons
  showSkeletons(grid, 4);

  try {
    const res = await fetch('data/speakers.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const speakers = await res.json();
    renderSpeakers(grid, speakers);
  } catch (e) {
    console.error('Error speakers:', e);
    showError(grid, 'No se pudieron cargar los speakers. Intenta recargar la página.');
  }
}

function showSkeletons(container, count) {
  container.innerHTML = Array.from({ length: count }, () => `
    <article class="terminal-window speaker-card skeleton" aria-hidden="true">
      <div class="speaker-avatar"></div>
      <div class="speaker-content">
        <h3 class="speaker-name"></h3>
        <p class="speaker-role"></p>
        <p class="speaker-company"></p>
        <p class="speaker-bio"></p>
        <div class="speaker-social"></div>
      </div>
    </article>
  `).join('');
}

function showError(container, message) {
  container.innerHTML = `
    <div class="empty-state" role="alert" style="grid-column: 1 / -1;">
      <span class="icon">🎤</span>
      <h3>Speakers no disponibles</h3>
      <p>${message}</p>
      <button class="btn btn-outline" onclick="location.reload()" style="margin-top: var(--space-4);">Reintentar</button>
    </div>
  `;
}

function renderSpeakers(grid, speakers) {
  grid.innerHTML = speakers.map(s => renderSpeakerCard(s)).join('');
}

function renderSpeakerCard(s) {
  const initials = getInitials(s.name);
  const avatarColor = getColorFromName(s.name);
  const socialLinks = Object.entries(s.social || {}).map(([k, v]) =>
    `<a href="${v}" target="_blank" rel="noopener noreferrer" aria-label="${k}">${icon(k)}</a>`
  ).join('');

  // Check if photo exists (we'll try to load it, fallback to initials)
  const hasPhoto = s.photo && !s.photo.includes('dicebear');

  return `
    <article class="terminal-window speaker-card" role="listitem">
      <div class="speaker-avatar ${hasPhoto ? 'has-photo' : ''}" style="--avatar-color: ${avatarColor};" data-initials="${initials}">
        ${hasPhoto ? `<img src="${s.photo}" alt="" loading="lazy" onerror="this.style.display='none'; this.parentElement.classList.remove('has-photo'); this.parentElement.querySelector('.avatar-fallback').style.display='flex';">` : ''}
        <span class="avatar-fallback" style="color: ${avatarColor};">${initials}</span>
      </div>
      <div class="speaker-content">
        <h3 class="speaker-name">${s.name}</h3>
        <p class="speaker-role">${s.role}</p>
        <p class="speaker-company">${s.company}</p>
        <p class="speaker-bio">${s.bio}</p>
        <div class="speaker-social">${socialLinks}</div>
      </div>
    </article>
  `;
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getColorFromName(name) {
  // Generate consistent color from name
  const colors = [
    '#00ff41', '#00d4aa', '#00a8ff', '#7c4dff', '#ff6b4d',
    '#ffb000', '#00e5a0', '#ff4d6a', '#a855f7', '#22d3ee'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function icon(name) {
  const icons = {
    twitter: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.69L1.214 2.25H8.08l6.661 8.161L22.872 2.25h-4.628Z"/></svg>',
    linkedin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z"/></svg>',
    github: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.579v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>'
  };
  return icons[name] || '';
}