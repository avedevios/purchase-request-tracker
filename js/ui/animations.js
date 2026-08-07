import { showToast } from './toast.js';

export function triggerFireworks() {
  const canvas = document.getElementById('fireworksCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#22c55e', '#10b981', '#fbbf24', '#6366f1', '#ec4899', '#3b82f6', '#f59e0b', '#a855f7'];
  
  const origins = [
    { x: canvas.width * 0.25, y: canvas.height * 0.45 },
    { x: canvas.width * 0.75, y: canvas.height * 0.45 },
    { x: canvas.width * 0.5, y: canvas.height * 0.3 }
  ];

  origins.forEach(origin => {
    for (let i = 0; i < 65; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 3;
      particles.push({
        x: origin.x,
        y: origin.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        size: Math.random() * 4.5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.02 + 0.012
      });
    }
  });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    particles.forEach(p => {
      if (p.alpha > 0) {
        active = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.16;
        p.alpha -= p.decay;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    if (active) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  requestAnimationFrame(animate);
  showToast('🎉 Issue marked as FIXED!', '🎆');
}

export function triggerSadAnimation() {
  const canvas = document.getElementById('fireworksCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#64748b', '#475569', '#334155', '#1e293b', '#0f172a', '#94a3b8', '#cbd5e1'];

  for (let i = 0; i < 110; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height * 0.5,
      vx: (Math.random() - 0.5) * 1.8,
      vy: Math.random() * 7 + 4,
      length: Math.random() * 16 + 8,
      width: Math.random() * 2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.7 + 0.3,
      decay: Math.random() * 0.007 + 0.006
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach(p => {
      if (p.alpha > 0 && p.y < canvas.height + 30) {
        active = true;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.width;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * 2, p.y + p.length);
        ctx.stroke();
      }
    });

    if (active) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  requestAnimationFrame(animate);
  showToast('🥀 Issue marked as DEPRECATED', '🌧️');
}
