// ===== EVENT STATUS - Real-time status badges =====
export function initEventStatus() {
  const grid = document.getElementById('status-grid');
  const heroStatus = document.getElementById('event-status');
  if (!grid && !heroStatus) return;

  const now = new Date();
  const tzOffset = -3 * 60; // GMT-3

  // Event dates in local time (Argentina GMT-3)
  const hackingStart = new Date('2026-10-14T09:00:00-03:00');
  const hackingEnd = new Date('2026-10-14T20:00:00-03:00');
  const startupStart = new Date('2026-10-15T09:30:00-03:00');
  const startupEnd = new Date('2026-10-15T22:00:00-03:00');

  const statuses = [
    {
      id: 'hacking-day',
      title: 'Hacking Day',
      start: hackingStart,
      end: hackingEnd,
      venue: 'UNICEN Campus Universitario',
      mapsUrl: 'https://maps.google.com/?q=UNICEN+Campus+Universitario+Tandil',
      icsUrl: 'data/calendar/hacking-day.ics',
      audience: 'Desarrolladores, estudiantes, apasionados de ciberseguridad'
    },
    {
      id: 'startup-day',
      title: 'Startup Day',
      start: startupStart,
      end: startupEnd,
      venue: 'Distrito Avellaneda',
      mapsUrl: 'https://maps.google.com/?q=Distrito+Avellaneda+Tandil',
      icsUrl: 'data/calendar/startup-day.ics',
      audience: 'Founders, inversores, product managers, público general'
    }
  ];

  const cards = statuses.map(s => createStatusCard(s, now)).join('');
  if (grid) grid.innerHTML = cards;

  // Hero badge - show most relevant status
  const heroBadge = createHeroBadge(statuses, now);
  if (heroStatus) heroStatus.innerHTML = heroBadge;
}

function getStatus(event, now) {
  if (now < event.start) return 'soon';
  if (now >= event.start && now <= event.end) return 'live';
  if (now > event.end) return 'ended';
  return 'soon';
}

function getStatusLabel(status) {
  const labels = {
    live: '🔴 EN VIVO AHORA',
    soon: '⏳ PRÓXIMAMENTE',
    ended: '✅ FINALIZADO',
    closed: '🔒 CERRADO'
  };
  return labels[status] || labels.soon;
}

function getStatusClass(status) {
  return `status-badge ${status}`;
}

function createStatusCard(event, now) {
  const status = getStatus(event, now);
  const label = getStatusLabel(status);
  const isLive = status === 'live';
  const isSoon = status === 'soon';
  const isEnded = status === 'ended';

  let primaryAction = '';
  let secondaryAction = '';

  if (isLive) {
    primaryAction = `<a href="${event.mapsUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">📍 Ir a la sede</a>`;
    secondaryAction = `<button class="btn btn-secondary btn-sm" onclick="downloadICS('${event.icsUrl}', '${event.title}')">📅 Añadir al calendario</button>`;
  } else if (isSoon) {
    primaryAction = `<a href="#registro" class="btn btn-primary btn-sm">Inscribirme</a>`;
    secondaryAction = `<button class="btn btn-secondary btn-sm" onclick="downloadICS('${event.icsUrl}', '${event.title}')">📅 Recordarme</button>`;
  } else {
    primaryAction = `<button class="btn btn-secondary btn-sm" disabled>Finalizado</button>`;
    secondaryAction = `<a href="#jornadas" class="btn btn-outline btn-sm">Ver detalles</a>`;
  }

  return `
    <article class="status-card ${status}" data-event="${event.id}">
      <div class="status-card-header">
        <span class="${getStatusClass(status)}">
          <span class="status-dot" aria-hidden="true"></span>
          ${label}
        </span>
      </div>
      <h3 class="status-card-title">${event.title}</h3>
      <div class="status-card-meta">
        <span>📅 ${formatDateRange(event.start, event.end)}</span>
        <span>📍 ${event.venue}</span>
      </div>
      <div class="status-card-actions">
        ${primaryAction}
        ${secondaryAction}
      </div>
    </article>
  `;
}

function createHeroBadge(statuses, now) {
  // Find most relevant: live > soon > ended
  let relevant = statuses.find(s => getStatus(s, now) === 'live');
  if (!relevant) relevant = statuses.find(s => getStatus(s, now) === 'soon');
  if (!relevant) relevant = statuses[0];

  const status = getStatus(relevant, now);
  const label = getStatusLabel(status);

  let detail = '';
  if (status === 'live') {
    detail = `${relevant.title} en ${relevant.venue}`;
  } else if (status === 'soon') {
    const hours = Math.ceil((relevant.start - now) / 36e5);
    if (hours < 24) detail = `${relevant.title} en ${hours}h · ${relevant.venue}`;
    else detail = `${relevant.title} en ${Math.ceil(hours/24)}d · ${relevant.venue}`;
  } else {
    detail = 'El evento ha finalizado. ¡Gracias por participar!';
  }

  return `
    <span class="${getStatusClass(status)}" style="font-size: var(--fs-sm);">
      <span class="status-dot" aria-hidden="true"></span>
      ${label}
    </span>
    <span class="status-detail" style="color: var(--fg-dim); font-size: var(--fs-sm);">${detail}</span>
  `;
}

function formatDateRange(start, end) {
  const options = { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' };
  return `${start.toLocaleDateString('es-AR', options)} – ${end.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' })}`;
}

// Global for inline onclick
window.downloadICS = function(icsUrl, title) {
  fetch(icsUrl)
    .then(r => r.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.ics`;
      a.click();
      URL.revokeObjectURL(url);
    })
    .catch(() => {
      // Fallback: create ICS on the fly
      const ics = generateICS(title);
      const blob = new Blob([ics], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.ics`;
      a.click();
      URL.revokeObjectURL(url);
    });
};

function generateICS(title) {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Tandil Tech Week//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${stamp}-${title.toLowerCase().replace(/\s+/g, '-')}@tandiltechweek.com
DTSTAMP:${stamp}
SUMMARY:Tandil Tech Week 2026 - ${title}
DESCRIPTION:Evento gratuito en Tandil, Argentina. Más info en https://tandiltechweek.com
END:VEVENT
END:VCALENDAR`;
}