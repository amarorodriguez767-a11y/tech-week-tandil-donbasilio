// ===== FAQ ACCORDION =====
export async function initFAQ() {
  const grid = document.getElementById('faq-grid');
  if (!grid) return;

  // Show skeleton
  grid.innerHTML = Array.from({ length: 6 }, () => `
    <details class="faq-item skeleton" aria-hidden="true">
      <summary class="faq-question"><span class="skeleton" style="width: 200px; height: 24px;"></span></summary>
      <div class="faq-answer"><div class="skeleton" style="width: 100%; height: 60px;"></div></div>
    </details>
  `).join('');

  try {
    const res = await fetch('data/faq.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const faqs = await res.json();
    renderFAQ(grid, faqs);
    enhanceFAQAccessibility(grid);
  } catch (e) {
    console.error('Error FAQ:', e);
    grid.innerHTML = `
      <div class="empty-state" role="alert" style="grid-column: 1 / -1;">
        <span class="icon">❓</span>
        <h3>No se pudo cargar la FAQ</h3>
        <p>Intenta recargar la página o <a href="#contacto">contactanos</a>.</p>
      </div>
    `;
  }
}

function renderFAQ(grid, faqs) {
  grid.innerHTML = faqs.map(f => `
    <details class="faq-item" data-category="${f.category}">
      <summary class="faq-question">
        <span class="faq-category">${f.category}</span>
        ${f.question}
        <svg class="faq-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </summary>
      <div class="faq-answer">${f.answer}</div>
    </details>
  `).join('');
}

function enhanceFAQAccessibility(grid) {
  const items = grid.querySelectorAll('.faq-item');

  items.forEach(item => {
    const summary = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    // Keyboard support
    summary.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.toggleAttribute('open');
      }
      // Arrow navigation between FAQ items
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = item.nextElementSibling?.querySelector('.faq-question');
        next?.focus();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = item.previousElementSibling?.querySelector('.faq-question');
        prev?.focus();
      }
      if (e.key === 'Home') {
        e.preventDefault();
        items[0].querySelector('.faq-question').focus();
      }
      if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1].querySelector('.faq-question').focus();
      }
    });

    // Smooth height animation for open/close
    const observer = new MutationObserver(() => {
      if (item.open) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      } else {
        answer.style.maxHeight = '0';
      }
    });
    observer.observe(item, { attributes: true, attributeFilter: ['open'] });

    // Initial state
    answer.style.maxHeight = '0';
    answer.style.overflow = 'hidden';
    answer.style.transition = 'max-height 250ms ease-out, opacity 200ms ease-out';
  });
}