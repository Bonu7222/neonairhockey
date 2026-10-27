const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ui = {
  score1: document.getElementById('score1'),
  score2: document.getElementById('score2'),
  startScreen: document.getElementById('startScreen'),
  gameOverScreen: document.getElementById('gameOverScreen'),
  winnerText: document.getElementById('winnerText'),
  startBtn: document.getElementById('startBtn'),
  restartBtn: document.getElementById('restartBtn')
};

const WIN_SCORE = 7;
let W, H;
let audioCtx = null;
let isPlaying = false;
let shakeTime = 0;

const keys = {
  w: false,
  s: false,
  ArrowUp: false,
  ArrowDown: false
};

const paddleW = 20;
const paddleH = 120;
const paddleSpeed = 8;

const player1 = {
  x: 50,
  y: 0,
  width: paddleW,
  height: paddleH,
  color: '#00ffff',
  score: 0
};

const player2 = {
  x: 0,
  y: 0,
  width: paddleW,
  height: paddleH,
  color: '#ff0055',
  score: 0
};

const puck = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  radius: 12,
  speed: 6,
  color: '#ffffff',
  trail: []
};

let particles = [];

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  
  player1.y = H / 2 - paddleH / 2;
  player2.y = H / 2 - paddleH / 2;
  player2.x = W - 50 - paddleW;
  
  if (!isPlaying) {
    puck.x = W / 2;
    puck.y = H / 2;
  }
}
window.addEventListener('resize', resize);
resize();

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playHitSound(isPaddle, speed) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const now = audioCtx.currentTime;
  
  osc.type = 'square';
  const baseFreq = isPaddle ? 400 : 200;
  const freq = baseFreq + (speed * 15);
  
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.1);
  
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}

function playScoreSound(isPlayer1) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const freqs = isPlayer1 ? [440, 554, 659] : [330, 277, 220];
  
  freqs.forEach((freq, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const startTime = now + index * 0.1;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.5);
  });
}

function createParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 2;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      color: color,
      size: Math.random() * 4 + 1
    });
  }
}

function resetPuck(scoredByPlayer1) {
  puck.x = W / 2;
  puck.y = H / 2;
  puck.vx = 0;
  puck.vy = 0;
  puck.trail = [];
  puck.speed = 6;
  shakeTime = 20;
  
  createParticles(W / 2, H / 2, '#ffffff', 30);
  createParticles(W / 2, H / 2, scoredByPlayer1 ? '#00ffff' : '#ff0055', 20);
  
  setTimeout(() => {
    if (!isPlaying) return;
    const angle = (Math.random() * Math.PI / 2) - Math.PI / 4;
    const dir = scoredByPlayer1 ? 1 : -1;
    puck.vx = Math.cos(angle) * puck.speed * dir;
    puck.vy = Math.sin(angle) * puck.speed;
  }, 800);
}

function startGame() {
  player1.score = 0;
  player2.score = 0;
  ui.score1.textContent = '0';
  ui.score2.textContent = '0';
  
  player1.y = H / 2 - paddleH / 2;
  player2.y = H / 2 - paddleH / 2;
  
  puck.x = W / 2;
  puck.y = H / 2;
  puck.vx = 0;
  puck.vy = 0;
  puck.trail = [];
  puck.speed = 6;
  
  particles = [];
  isPlaying = true;
  
  ui.startScreen.classList.add('hidden');
  ui.gameOverScreen.classList.add('hidden');
  initAudio();
  
  setTimeout(() => {
    if (!isPlaying) return;
    puck.vx = puck.speed;
    puck.vy = puck.speed * 0.5;
  }, 1000);
}

function gameOver(winner) {
  isPlaying = false;
  ui.winnerText.textContent = winner === 1 ? 'PLAYER 1 WINS' : 'PLAYER 2 WINS';
  ui.winnerText.style.color = winner === 1 ? '#00ffff' : '#ff0055';
  ui.winnerText.style.textShadow = winner === 1 ? '0 0 20px #00ffff, 0 0 40px #00ffff' : '0 0 20px #ff0055, 0 0 40px #ff0055';
  ui.gameOverScreen.classList.remove('hidden');
}

function update() {
  if (!isPlaying) return;

  if (keys.w) player1.y -= paddleSpeed;
  if (keys.s) player1.y += paddleSpeed;
  if (keys.ArrowUp) player2.y -= paddleSpeed;
  if (keys.ArrowDown) player2.y += paddleSpeed;

  if (player1.y < 0) player1.y = 0;
  if (player1.y + paddleH > H) player1.y = H - paddleH;
  if (player2.y < 0) player2.y = 0;
  if (player2.y + paddleH > H) player2.y = H - paddleH;

  puck.x += puck.vx;
  puck.y += puck.vy;

  puck.trail.push({ x: puck.x, y: puck.y, life: 1 });
  for (let i = puck.trail.length - 1; i >= 0; i--) {
    puck.trail[i].life -= 0.05;
    if (puck.trail[i].life <= 0) puck.trail.splice(i, 1);
  }

  if (puck.y - puck.radius < 0) {
    puck.y = puck.radius;
    puck.vy *= -1;
    playHitSound(false, Math.abs(puck.vy));
    createParticles(puck.x, puck.y, '#88aaff', 5);
  } else if (puck.y + puck.radius > H) {
    puck.y = H - puck.radius;
    puck.vy *= -1;
    playHitSound(false, Math.abs(puck.vy));
    createParticles(puck.x, puck.y, '#88aaff', 5);
  }

  if (
    puck.x - puck.radius < player1.x + player1.width &&
    puck.x + puck.radius > player1.x &&
    puck.y - puck.radius < player1.y + player1.height &&
    puck.y + puck.radius > player1.y &&
    puck.vx < 0
  ) {
    puck.x = player1.x + player1.width + puck.radius;
    puck.speed = Math.min(puck.speed + 0.3, 15);
    
    const hitPos = (puck.y - (player1.y + paddleH / 2)) / (paddleH / 2);
    const angle = hitPos * (Math.PI / 3);
    
    puck.vx = Math.cos(angle) * puck.speed;
    puck.vy = Math.sin(angle) * puck.speed;
    
    shakeTime = 5;
    playHitSound(true, puck.speed);
    createParticles(puck.x, puck.y, player1.color, 10);
  }

  if (
    puck.x + puck.radius > player2.x &&
    puck.x - puck.radius < player2.x + player2.width &&
    puck.y - puck.radius < player2.y + player2.height &&
    puck.y + puck.radius > player2.y &&
    puck.vx > 0
  ) {
    puck.x = player2.x - puck.radius;
    puck.speed = Math.min(puck.speed + 0.3, 15);
    
    const hitPos = (puck.y - (player2.y + paddleH / 2)) / (paddleH / 2);
    const angle = hitPos * (Math.PI / 3);
    
    puck.vx = -Math.cos(angle) * puck.speed;
    puck.vy = Math.sin(angle) * puck.speed;
    
    shakeTime = 5;
    playHitSound(true, puck.speed);
    createParticles(puck.x, puck.y, player2.color, 10);
  }

  if (puck.x + puck.radius < 0) {
    player2.score++;
    ui.score2.textContent = player2.score;
    playScoreSound(false);
    resetPuck(false);
    
    if (player2.score >= WIN_SCORE) gameOver(2);
  } else if (puck.x - puck.radius > W) {
    player1.score++;
    ui.score1.textContent = player1.score;
    playScoreSound(true);
    resetPuck(true);
    
    if (player1.score >= WIN_SCORE) gameOver(1);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.95;
    p.vy *= 0.95;
    p.life -= 0.02;
    if (p.life <= 0) particles.splice(i, 1);
  }

  if (shakeTime > 0) shakeTime -= 0.5;
}

function draw() {
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  if (shakeTime > 0) {
    ctx.translate((Math.random() - 0.5) * shakeTime, (Math.random() - 0.5) * shakeTime);
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 4;
  ctx.setLineDash([20, 20]);
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(W / 2, H);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = 'rgba(0, 255, 255, 0.05)';
  ctx.fillRect(0, 0, 20, H);
  ctx.fillStyle = 'rgba(255, 0, 85, 0.05)';
  ctx.fillRect(W - 20, 0, 20, H);

  ctx.fillStyle = player1.color;
  ctx.shadowColor = player1.color;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.roundRect(player1.x, player1.y, player1.width, player1.height, 10);
  ctx.fill();

  ctx.fillStyle = player2.color;
  ctx.shadowColor = player2.color;
  ctx.beginPath();
  ctx.roundRect(player2.x, player2.y, player2.width, player2.height, 10);
  ctx.fill();
  ctx.shadowBlur = 0;

  puck.trail.forEach(t => {
    ctx.fillStyle = `rgba(255, 255, 255, ${t.life * 0.5})`;
    ctx.beginPath();
    ctx.arc(t.x, t.y, puck.radius * t.life, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = puck.color;
  ctx.shadowColor = puck.color;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(puck.x, puck.y, puck.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });
  ctx.globalAlpha = 1;

  ctx.restore();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', e => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = true;
    e.preventDefault();
  }
});

window.addEventListener('keyup', e => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false;
    e.preventDefault();
  }
});

ui.startBtn.addEventListener('click', startGame);
ui.restartBtn.addEventListener('click', startGame);

loop();