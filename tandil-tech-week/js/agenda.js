// ===== AGENDA WITH CALENDAR BUTTONS =====
export async function initAgenda() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.agenda-panel');
  if (!tabs.length) return;

  // Show loading in both panels
  panels.forEach(panel => {
    const tbody = panel.querySelector('tbody');
    if (tbody) tbody.innerHTML = `
      <tr class="skeleton-row">
        <td colspan="6">
          <div class="skeleton" style="height: 60px; width: 100%;"></div>
        </td>
      </tr>
      <tr class="skeleton-row">
        <td colspan="6">
          <div class="skeleton" style="height: 60px; width: 100%;"></div>
        </td>
      </tr>
      <tr class="skeleton-row">
        <td colspan="6">
          <div class="skeleton" style="height: 60px; width: 100%;"></div>
        </td>
      </tr>
    `;
  });

  try {
    const res = await fetch('data/agenda.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    Object.entries(data).forEach(([day, events]) => {
      const tbody = document.getElementById(`agenda-body-${day.split('-')[1]}`);
      if (tbody) tbody.innerHTML = events.map(e => renderAgendaRow(e, day)).join('');
    });
  } catch (e) {
    console.error('Error agenda:', e);
    panels.forEach(panel => {
      const tbody = panel.querySelector('tbody');
      if (tbody) tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: var(--space-8); color: var(--fg-dim);">
            Error al cargar la agenda. <button class="btn btn-outline btn-sm" onclick="location.reload()">Reintentar</button>
          </td>
        </tr>
      `;
    });
  }

  // Tab switching
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    panels.forEach(p => p.hidden = true);
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    if (panel) panel.hidden = false;
  }));

  // Keyboard navigation for tabs
  tabs.forEach((tab, i) => {
    tab.addEventListener('keydown', e => {
      let newIndex = i;
      if (e.key === 'ArrowRight') newIndex = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') newIndex = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') newIndex = 0;
      else if (e.key === 'End') newIndex = tabs.length - 1;
      else return;
      e.preventDefault();
      tabs[newIndex].focus();
      tabs[newIndex].click();
    });
  });
}

function renderAgendaRow(e, day) {
  const icsUrl = `data/calendar/${day}.ics`; // Will fallback to generated ICS
  const eventTitle = e.title;
  const eventTime = e.time;
  const eventLocation = e.location;
  const eventTrack = e.track;

  return `<tr data-time="${e.time}">
    <td class="time" data-label="Hora">${e.time}</td>
    <td class="track" data-label="Track"><span class="track-badge">${e.track}</span></td>
    <td class="title" data-label="Actividad">${e.title}</td>
    <td class="speaker" data-label="Speaker">${e.speaker}</td>
    <td class="location" data-label="Lugar">${e.location}</td>
    <td class="actions-col" data-label="Acción">
      <button class="btn-calendar" aria-label="Añadir ${e.title} al calendario" onclick="addToCalendar('${escapeForAttr(eventTitle)}', '${escapeForAttr(eventTime)}', '${escapeForAttr(eventLocation)}', '${escapeForAttr(eventTrack)}', '${day}')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      </button>
    </td>
  </tr>`;
}

function escapeForAttr(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '"');
}

// Global function for inline onclick
window.addToCalendar = function(title, time, location, track, day) {
  // Parse date from day (14-oct or 15-oct)
  const dateMap = { '14-oct': '20261014', '15-oct': '20261015' };
  const baseDate = dateMap[day] || '20261014';
  const [hh, mm] = time.split(':');
  const start = `${baseDate}T${hh}${mm}00`;
  const endHour = parseInt(hh) + 1;
  const end = `${baseDate}T${endHour.toString().padStart(2, '0')}${mm}00`;

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Tandil Tech Week//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Date.now()}-${title.replace(/\s+/g, '-')}@tandiltechweek.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART;TZID=America/Argentina/Buenos_Aires:${start}
DTEND;TZID=America/Argentina/Buenos_Aires:${end}
SUMMARY:Tandil Tech Week 2026 - ${title}
DESCRIPTION:Track: ${track}\\nLugar: ${location}\\nEvento gratuito en Tandil, Argentina. Más info: https://tandiltechweek.com
LOCATION:${location}, Tandil, Argentina
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tandil-tech-week-${title.toLowerCase().replace(/\s+/g, '-')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};