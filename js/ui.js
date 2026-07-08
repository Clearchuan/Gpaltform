(function () {
  function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const particles = [];
    function resize() {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    }
    resize();
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.4 + 0.6,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        color: Math.random() > 0.5 ? '#45f0ff' : '#ff4fd8'
      });
    }
    function draw() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach(function (p) {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > window.innerWidth) p.dx *= -1;
        if (p.y < 0 || p.y > window.innerHeight) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      window.requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener('resize', resize);
  }

  function applyTheme(settings) {
    const root = document.documentElement;
    root.setAttribute('data-theme', settings.theme || 'neon');
    root.setAttribute('data-mode', settings.mode || 'dark');
  }

  function showToast(message, type) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const node = document.createElement('div');
    node.className = 'toast ' + (type || 'info');
    node.textContent = message;
    node.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:9999;padding:12px 16px;border-radius:999px;background:rgba(8,14,28,.9);border:1px solid rgba(255,255,255,.16);box-shadow:0 12px 30px rgba(0,0,0,.25);';
    document.body.appendChild(node);
    setTimeout(function () { node.remove(); }, 2200);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initParticles();
    const settings = window.gamePlatform && window.gamePlatform.getSettings ? window.gamePlatform.getSettings() : {};
    applyTheme(settings);
  });

  window.uiHelper = { initParticles: initParticles, applyTheme: applyTheme, showToast: showToast };
})();
