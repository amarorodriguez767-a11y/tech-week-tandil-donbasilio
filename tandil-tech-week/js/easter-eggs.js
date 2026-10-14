export function initEasterEggs() {
  // Konami code → Matrix rain
  const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];
  let konamiIndex = 0;
  document.addEventListener('keydown', e => {
    if (e.code === konami[konamiIndex]) { konamiIndex++; if (konamiIndex === konami.length) { triggerMatrixRain(); konamiIndex = 0; } }
    else { konamiIndex = 0; }
  });
  // Console message
  console.log('%c👋 Hola hacker!', 'color: #00ff41; font-size: 24px; font-family: monospace;');
  console.log('%c¿Buscando bugs? Este es un feature, no un bug.', 'color: #8ab88a; font-family: monospace;');
  console.log('%cTandil Tech Week 2026 · tandiltechweek.com', 'color: #4a6b4a; font-family: monospace;');
}

function triggerMatrixRain() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;opacity:0.15';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01';
  const fontSize = 16;
  let columns, drops;
  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; columns = Math.floor(canvas.width / fontSize); drops = Array(columns).fill(1); }
  resize(); window.addEventListener('resize', resize);
  function draw() {
    ctx.fillStyle = 'rgba(10,15,10,0.05)'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#00ff41'; ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  const interval = setInterval(draw, 50);
  setTimeout(() => { clearInterval(interval); canvas.remove(); }, 10000);
}

// Ctrl+Shift+S → sudo make me a sandwich
document.addEventListener('keydown', e => {
  if (e.key === 's' && e.ctrlKey && e.shiftKey) {
    e.preventDefault();
    const msg = document.createElement('div');
    msg.textContent = '> sudo make me a sandwich\nOkay. 🥪';
    msg.style.cssText = 'position:fixed;bottom:20px;left:20px;background:var(--bg-elevated);border:1px solid var(--accent);padding:var(--space-3);border-radius:var(--radius);color:var(--accent);font-family:var(--font-mono);z-index:10000;box-shadow:0 0 20px var(--glow-strong)';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 4000);
  }
});