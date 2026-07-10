// ---------- ambient floating hearts in the background ----------

function spawnAmbientHearts() {
  const bg = document.getElementById('heartsBg');
  const symbols = ['💗', '💕', '💖', '❤️'];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const h = document.createElement('div');
    h.className = 'floating-heart';
    h.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    const size = 14 + Math.random() * 22;
    const duration = 9 + Math.random() * 10;

    h.style.left = Math.random() * 100 + 'vw';
    h.style.fontSize = size + 'px';
    h.style.setProperty('--drift', Math.random() * 60 - 30 + 'px');
    h.style.animationDuration = duration + 's';
    h.style.animationDelay = Math.random() * duration + 's';

    bg.appendChild(h);
  }
}

// ---------- envelope opening sequence ----------

const envelopeBtn = document.getElementById('envelopeBtn');
const card = document.getElementById('card');

envelopeBtn.addEventListener('click', () => {
  if (envelopeBtn.classList.contains('shaking') || envelopeBtn.classList.contains('opening')) return;

  envelopeBtn.classList.add('shaking');

  setTimeout(() => {
    envelopeBtn.classList.remove('shaking');
    envelopeBtn.classList.add('opening');

    setTimeout(() => {
      envelopeBtn.classList.add('hidden-away');
      card.hidden = false;
    }, 950);
  }, 1200);
});

// ---------- the broken heart that refuses to be caught ----------

const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const hint = document.getElementById('hint');
const siSwarm = document.getElementById('siSwarm');

const taunts = [
  '¡Casi! 😏',
  'Ese corazón roto no se deja atrapar tan fácil...',
  'Mientras más lo intentas, más corazones llenos aparecen 💗',
  '¿Ya viste cuántos "sí" hay ahora?',
  'El corazón roto está evitando lo inevitable',
  'En este universo el "no" no es una opción',
  'Ríndete y elige uno de los corazones llenos 💖',
  'Ya casi no hay espacio para el roto...',
];

let attempts = 0;
let totalSiHearts = 0;
let celebrated = false;
const MAX_SI_HEARTS = 700; // performance guard, never reached by hand-clicking

function relocateNoButton() {
  if (!noBtn.classList.contains('roaming')) {
    const r = noBtn.getBoundingClientRect();
    noBtn.style.position = 'fixed';
    noBtn.style.left = r.left + 'px';
    noBtn.style.top = r.top + 'px';
    noBtn.classList.add('roaming');
    void noBtn.offsetWidth; // force reflow so the jump doesn't animate
  }

  const pad = 16;
  const w = noBtn.offsetWidth;
  const h = noBtn.offsetHeight;
  const maxX = Math.max(pad, window.innerWidth - w - pad);
  const maxY = Math.max(pad, window.innerHeight - h - pad);

  noBtn.style.left = pad + Math.random() * (maxX - pad) + 'px';
  noBtn.style.top = pad + Math.random() * (maxY - pad) + 'px';
}

function spawnSiHeart() {
  const heart = document.createElement('button');
  heart.type = 'button';
  heart.className = 'si-heart';
  heart.setAttribute('aria-label', 'Sí');
  heart.textContent = Math.random() < 0.5 ? '💖' : '💗';

  const size = 30 + Math.random() * 28;
  const w = size, h = size;
  const x = Math.random() * Math.max(0, window.innerWidth - w);
  const y = Math.random() * Math.max(0, window.innerHeight - h);

  heart.style.fontSize = size + 'px';
  heart.style.left = x + 'px';
  heart.style.top = y + 'px';
  heart.style.setProperty('--r', Math.random() * 40 - 20 + 'deg');
  heart.style.animationDelay = '0s, ' + Math.random() * 2 + 's';
  heart.style.animationDuration = '0.35s, ' + (2.4 + Math.random() * 1.6) + 's';

  siSwarm.appendChild(heart);
}

noBtn.addEventListener('click', () => {
  if (celebrated) return;

  attempts += 1;
  hint.textContent = taunts[Math.min(attempts - 1, taunts.length - 1)];
  relocateNoButton();

  const batch = Math.min(4 * Math.pow(2, attempts - 1), MAX_SI_HEARTS - totalSiHearts);
  for (let i = 0; i < batch; i++) spawnSiHeart();
  totalSiHearts += batch;
});

// ---------- saying yes (from the card or from the multiplying swarm) ----------

const celebrateScreen = document.getElementById('celebrateScreen');

function celebrate() {
  if (celebrated) return;
  celebrated = true;

  card.hidden = true;
  siSwarm.innerHTML = '';
  celebrateScreen.hidden = false;

  burstConfetti();
}

yesBtn.addEventListener('click', celebrate);
siSwarm.addEventListener('click', (e) => {
  if (e.target.closest('.si-heart')) celebrate();
});

// ---------- confetti hearts burst ----------

function burstConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#FF5C8A', '#E63971', '#FFD166', '#FFB6D9', '#FF8FAE'];
  const particles = Array.from({ length: 80 }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 120,
    y: canvas.height * 0.4,
    vx: (Math.random() - 0.5) * 11,
    vy: -Math.random() * 11 - 4,
    size: 7 + Math.random() * 9,
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.3,
    color: colors[Math.floor(Math.random() * colors.length)],
    life: 0,
  }));

  function drawHeart(size) {
    const s = size;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(0, -s * 0.3, -s, -s * 0.3, -s, s * 0.1);
    ctx.bezierCurveTo(-s, s * 0.6, 0, s * 0.9, 0, s * 1.2);
    ctx.bezierCurveTo(0, s * 0.9, s, s * 0.6, s, s * 0.1);
    ctx.bezierCurveTo(s, -s * 0.3, 0, -s * 0.3, 0, s * 0.3);
    ctx.closePath();
  }

  let frame = 0;
  function tick() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.vy += 0.28;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life++;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, 1 - p.life / 90);
      ctx.fillStyle = p.color;
      drawHeart(p.size);
      ctx.fill();
      ctx.restore();
    });

    if (frame < 100) {
      requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  tick();
}

window.addEventListener('resize', () => {
  const canvas = document.getElementById('confettiCanvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

spawnAmbientHearts();
