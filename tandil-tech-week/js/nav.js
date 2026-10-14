export function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');
  const nav = document.querySelector('.nav');
  if (!toggle || !menu || !nav) return;

  // Toggle menu
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !open);
    menu.classList.toggle('open', !open);
    document.body.style.overflow = open ? '' : 'hidden';
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
    document.body.style.overflow = '';
  }));

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });

  // Scroll effect for nav + sticky CTA
  let lastScroll = 0;
  const stickyCta = document.getElementById('sticky-cta');
  const hero = document.querySelector('.hero');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 20;
    nav.classList.toggle('scrolled', scrolled);

    // Sticky CTA on mobile: show when hero is scrolled past
    if (stickyCta && hero) {
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      const showCta = window.scrollY > heroBottom - 100;
      stickyCta.hidden = !showCta;
      document.body.classList.toggle('has-sticky-cta', showCta && window.innerWidth <= 768);
    }
  }, { passive: true });
}

export function initHeroTyping() {
  // Title lines typing
  const titleLines = document.querySelectorAll('.hero-main-title .title-line[data-text]');
  titleLines.forEach((line, i) => {
    const text = line.getAttribute('data-text');
    line.textContent = '';
    setTimeout(() => {
      line.classList.add('typed');
      typeChar(line, text, 0, 40);
    }, i * 300 + 400);
  });

  // Subtitle typing
  const subtitle = document.querySelector('.hero-subtitle[data-text]');
  if (subtitle) {
    const text = subtitle.getAttribute('data-text');
    subtitle.textContent = '';
    setTimeout(() => {
      subtitle.classList.add('typed');
      typeChar(subtitle, text, 0, 25);
    }, 1000);
  }

  // Initialize counter animations for stats
  initStatCounters();

  // Initialize visual tabs
  initVisualTabs();
}

function typeChar(el, text, i, speed) {
  if (i < text.length) {
    el.textContent += text[i];
    setTimeout(() => typeChar(el, text, i + 1, speed), speed + Math.random() * 30);
  }
}

function initStatCounters() {
  const counters = document.querySelectorAll('.stat-value[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5, rootMargin: '0px 0px -50px 0px' });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'), 10);
  const duration = 1800;
  const startTime = performance.now();
  const isDecimal = target % 1 !== 0;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(progress);
    const current = target * eased;

    if (isDecimal) {
      el.textContent = current.toFixed(1);
    } else {
      el.textContent = Math.floor(current);
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target;
      // Add glow pulse on complete
      el.style.animation = 'counterPulse 0.5s ease-out';
    }
  }

  requestAnimationFrame(update);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function initVisualTabs() {
  const tabs = document.querySelectorAll('.vis-tab');
  const panels = document.querySelectorAll('.vis-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const panel = document.getElementById(`vis-${target}`);
      if (panel) panel.classList.add('active');
    });

    // Keyboard navigation
    tab.addEventListener('keydown', e => {
      let index = Array.from(tabs).indexOf(tab);
      if (e.key === 'ArrowRight') index = (index + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') index = (index - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') index = 0;
      else if (e.key === 'End') index = tabs.length - 1;
      else return;

      e.preventDefault();
      tabs[index].focus();
      tabs[index].click();
    });
  });
}