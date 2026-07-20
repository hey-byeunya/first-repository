const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.15;
const AIR_RESISTANCE = 0.985;
const WIND_STRENGTH = 0.8;
const WIND_RADIUS = 250;
const ROTATION_FACTOR = 0.003;
const ROTATION_DAMPING = 0.95;
const TISSUE_W = 60;
const TISSUE_H = 50;
const FLOOR_MARGIN = 20;

const State = { READY: 0, COUNTDOWN: 1, PLAYING: 2, GAME_OVER: 3 };
let state = State.READY;
let countdownEnd = 0;
let score = 0;
let bestScore = parseFloat(localStorage.getItem('tissue-best') || '0');
let newBest = false;
let dpr = 1;
let W = 0;
let H = 0;
let floorY = 0;
let playStartTime = 0;
let playTime = 0;

const tissue = { x: 0, y: 0, vx: 0, vy: 0, angle: 0, angularVel: 0 };
const particles = [];
const wobbleOffsets = Array.from({ length: 8 }, () => Math.random() * Math.PI * 2);

let lastLoopTime = 0;

// --- Hazards ---
const dangerZones = [];
let nextGustTime = 0;
let nextZoneTime = 0;
let warningText = '';
let warningAlpha = 0;
let warningFlash = 0;
const gustVisuals = [];
let screenShake = 0;

function resetHazards() {
  dangerZones.length = 0;
  gustVisuals.length = 0;
  screenShake = 0;
  nextGustTime = 10;
  nextZoneTime = 20;
  warningText = '';
  warningAlpha = 0;
  warningFlash = 0;
}

function showWarning(text) {
  warningText = text;
  warningAlpha = 1;
  warningFlash = 1;
}

function spawnDangerZone() {
  const zoneH = 40 + Math.random() * 30;
  const minY = H * 0.15;
  const maxY = floorY - zoneH - 20;
  const y = minY + Math.random() * (maxY - minY);
  const speed = (0.3 + Math.random() * 0.5) * (Math.random() < 0.5 ? 1 : -1);
  const duration = 6 + Math.random() * 4;
  dangerZones.push({ y, h: zoneH, speed, life: duration, maxLife: duration });
}

function updateHazards(dt) {
  const t = playTime;
  const difficulty = Math.min(t / 60, 1);

  // Gusts
  if (t >= 10 && t >= nextGustTime) {
    const gustStrength = (1 + difficulty * 2) * 0.4;
    const angle = Math.random() * Math.PI * 2;
    const gx = Math.cos(angle);
    const gy = Math.sin(angle);
    tissue.vx += gx * gustStrength;
    tissue.vy += gy * gustStrength * 0.5 + gustStrength * 0.3;
    tissue.angularVel += (Math.random() - 0.5) * 0.05;

    const interval = Math.max(2, 5 - difficulty * 3);
    nextGustTime = t + interval + Math.random() * interval;

    showWarning('돌풍!');
    spawnGustStreaks(gx, gy);
    spawnGustParticles();
    screenShake = 0.4;
  }

  // Update gust streaks
  for (let i = gustVisuals.length - 1; i >= 0; i--) {
    const g = gustVisuals[i];
    g.x += g.vx;
    g.y += g.vy;
    g.life -= dt * 1.5;
    if (g.life <= 0) gustVisuals.splice(i, 1);
  }

  // Screen shake decay
  if (screenShake > 0) screenShake *= 0.9;

  // Danger zones
  if (t >= 20 && t >= nextZoneTime) {
    spawnDangerZone();
    showWarning('위험 구간!');
    const interval = Math.max(3, 8 - difficulty * 4);
    nextZoneTime = t + interval + Math.random() * 3;
  }

  // Update danger zones
  for (let i = dangerZones.length - 1; i >= 0; i--) {
    const z = dangerZones[i];
    z.y += z.speed;
    z.life -= dt;

    if (z.y < H * 0.1) { z.y = H * 0.1; z.speed = Math.abs(z.speed); }
    if (z.y + z.h > floorY - 10) { z.y = floorY - 10 - z.h; z.speed = -Math.abs(z.speed); }

    // Check tissue collision
    if (tissue.y > z.y && tissue.y < z.y + z.h) {
      tissue.vy += 0.3 + difficulty * 0.3;
      tissue.vx += (Math.random() - 0.5) * 0.2;
    }

    if (z.life <= 0) dangerZones.splice(i, 1);
  }

  // Warning fade
  if (warningAlpha > 0) {
    warningAlpha -= dt * 0.8;
    warningFlash -= dt * 3;
  }
}

function spawnGustStreaks(gx, gy) {
  const count = 15 + Math.floor(Math.random() * 10);
  for (let i = 0; i < count; i++) {
    const startX = gx > 0 ? -20 : W + 20;
    const startY = Math.random() * H;
    const speed = 8 + Math.random() * 12;
    gustVisuals.push({
      x: startX + (Math.random() - 0.5) * W * 0.3,
      y: startY,
      vx: gx * speed,
      vy: (gy * 0.3 + (Math.random() - 0.5) * 0.5) * speed * 0.4,
      len: 30 + Math.random() * 60,
      life: 0.6 + Math.random() * 0.5,
      width: 0.5 + Math.random() * 1.5,
    });
  }
}

function drawGustVisuals() {
  for (const g of gustVisuals) {
    const alpha = Math.min(g.life, 0.4) * 0.6;
    const speed = Math.sqrt(g.vx * g.vx + g.vy * g.vy);
    const nx = speed > 0 ? g.vx / speed : 1;
    const ny = speed > 0 ? g.vy / speed : 0;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x - nx * g.len, g.y - ny * g.len);
    ctx.strokeStyle = `rgba(140, 170, 200, ${alpha})`;
    ctx.lineWidth = g.width;
    ctx.stroke();
  }
}

function spawnGustParticles() {
  const side = Math.random() < 0.5 ? 0 : W;
  const dir = side === 0 ? 1 : -1;
  for (let i = 0; i < 12; i++) {
    particles.push({
      x: side,
      y: H * 0.2 + Math.random() * H * 0.6,
      vx: dir * (4 + Math.random() * 4),
      vy: (Math.random() - 0.3) * 2,
      life: 1,
      decay: 0.015 + Math.random() * 0.01,
      size: 2 + Math.random() * 2,
    });
  }
}

function drawDangerZones() {
  for (const z of dangerZones) {
    const fadeIn = Math.min(1, (z.maxLife - z.life) * 3);
    const fadeOut = Math.min(1, z.life * 2);
    const alpha = Math.min(fadeIn, fadeOut) * 0.12;

    ctx.fillStyle = `rgba(220, 60, 60, ${alpha})`;
    ctx.fillRect(0, z.y, W, z.h);

    ctx.strokeStyle = `rgba(220, 60, 60, ${alpha * 2})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(0, z.y);
    ctx.lineTo(W, z.y);
    ctx.moveTo(0, z.y + z.h);
    ctx.lineTo(W, z.y + z.h);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = `rgba(220, 60, 60, ${alpha * 3})`;
    ctx.font = '400 11px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('DANGER', W - 10, z.y + 14);
  }
}

function drawWarning() {
  if (warningAlpha <= 0) return;

  const flash = Math.max(0, warningFlash);
  const scale = 1 + flash * 0.15;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.translate(W / 2, H * 0.15);
  ctx.scale(scale, scale);
  ctx.fillStyle = `rgba(220, 60, 60, ${warningAlpha * 0.9})`;
  ctx.font = '500 18px -apple-system, sans-serif';
  ctx.fillText(warningText, 0, 0);
  ctx.restore();
  ctx.textBaseline = 'alphabetic';
}

function getGravityMultiplier() {
  if (playTime < 30) return 1;
  return 1 + Math.min((playTime - 30) / 60, 0.8);
}

// --- Rising floor ---
const FLOOR_RISE_START = 15;
const FLOOR_RISE_SPEED = 3;
const FLOOR_MIN_SPACE = 150;
let baseFloorY = 0;

function getRisingFloorY() {
  if (playTime < FLOOR_RISE_START) return baseFloorY;
  const elapsed = playTime - FLOOR_RISE_START;
  const rise = elapsed * FLOOR_RISE_SPEED;
  return Math.max(FLOOR_MIN_SPACE, baseFloorY - rise);
}

// --- Wall turbulence ---
const WALL_ZONE = 80;

function applyWallTurbulence() {
  const leftDist = tissue.x;
  const rightDist = W - tissue.x;
  const topDist = tissue.y;
  const nearWall = Math.min(leftDist, rightDist, topDist);

  if (nearWall < WALL_ZONE) {
    const intensity = (1 - nearWall / WALL_ZONE) * 0.15;
    tissue.vy += intensity;
    tissue.vx += (Math.random() - 0.5) * intensity * 2;

    if (topDist < WALL_ZONE) {
      tissue.vy += intensity * 0.5;
    }
  }
}

// --- Proximity warning ---
function drawProximityWarning() {
  const distToFloor = floorY - (tissue.y + TISSUE_H / 2);
  const totalSpace = floorY - TISSUE_H;
  const ratio = 1 - Math.max(0, Math.min(1, distToFloor / (totalSpace * 0.35)));

  if (ratio <= 0) return;

  const gradient = ctx.createLinearGradient(0, floorY - 120, 0, floorY);
  gradient.addColorStop(0, `rgba(220, 50, 50, 0)`);
  gradient.addColorStop(1, `rgba(220, 50, 50, ${ratio * 0.15})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, floorY - 120, W, 120);
}

// --- Rising floor visual ---
function drawRisingFloorZone() {
  if (playTime < FLOOR_RISE_START) return;

  const riseAmount = baseFloorY - floorY;
  if (riseAmount <= 0) return;

  const gradient = ctx.createLinearGradient(0, floorY, 0, baseFloorY);
  gradient.addColorStop(0, 'rgba(200, 60, 60, 0.06)');
  gradient.addColorStop(1, 'rgba(200, 60, 60, 0.02)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, floorY, W, baseFloorY - floorY);

  for (let y = floorY + 20; y < baseFloorY; y += 20) {
    ctx.strokeStyle = 'rgba(200, 60, 60, 0.06)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

function resize() {
  dpr = window.devicePixelRatio || 1;
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  floorY = H - FLOOR_MARGIN;
}
window.addEventListener('resize', resize);
resize();

function resetTissue() {
  tissue.x = W / 2;
  tissue.y = H * 0.35;
  tissue.vx = 0;
  tissue.vy = 0;
  tissue.angle = 0;
  tissue.angularVel = 0;
}

function startGame() {
  state = State.COUNTDOWN;
  countdownEnd = Date.now() + 3000;
  score = 0;
  newBest = false;
  resetTissue();
  particles.length = 0;
  resetHazards();
  baseFloorY = H - FLOOR_MARGIN;
  floorY = baseFloorY;
}

let retryBtn = { x: 0, y: 0, w: 0, h: 0 };

function isInsideRetryBtn(px, py) {
  return px >= retryBtn.x && px <= retryBtn.x + retryBtn.w &&
         py >= retryBtn.y && py <= retryBtn.y + retryBtn.h;
}

function handleInput(x, y) {
  if (state === State.READY) { startGame(); return; }
  if (state === State.GAME_OVER) {
    if (isInsideRetryBtn(x, y)) startGame();
    return;
  }
  if (state !== State.PLAYING) return;

  const dx = tissue.x - x;
  const dy = tissue.y - y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;

  const strength = Math.max(0, 1 - dist / WIND_RADIUS) * WIND_STRENGTH;
  const nx = dx / dist;
  const ny = dy / dist;

  tissue.vx += nx * strength * 12;
  tissue.vy += ny * strength * 12;
  tissue.angularVel += nx * strength * ROTATION_FACTOR * 40;

  spawnWindParticles(x, y, nx, ny);
}

canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  handleInput(e.clientX, e.clientY);
});
canvas.addEventListener('pointermove', (e) => {
  if (e.buttons === 0 || state !== State.PLAYING) return;
  e.preventDefault();
  handleInput(e.clientX, e.clientY);
});

function spawnWindParticles(x, y, nx, ny) {
  for (let i = 0; i < 6; i++) {
    const spread = (Math.random() - 0.5) * 1.5;
    particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      vx: (nx + spread * (-ny)) * (3 + Math.random() * 3),
      vy: (ny + spread * nx) * (3 + Math.random() * 3),
      life: 1,
      decay: 0.02 + Math.random() * 0.02,
      size: 2 + Math.random() * 3,
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    p.vx *= 0.96; p.vy *= 0.96;
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180, 200, 220, ${p.life * 0.5})`;
    ctx.fill();
  }
}

function updatePhysics(dt) {
  const steps = Math.round(dt * 60);
  for (let i = 0; i < steps; i++) {
    tissue.vy += GRAVITY * getGravityMultiplier();
    tissue.vx *= AIR_RESISTANCE;
    tissue.vy *= AIR_RESISTANCE;
    tissue.x += tissue.vx;
    tissue.y += tissue.vy;
    tissue.angularVel *= ROTATION_DAMPING;
    tissue.angle += tissue.angularVel;
  }

  if (tissue.x < TISSUE_W / 2) { tissue.x = TISSUE_W / 2; tissue.vx *= -0.3; }
  if (tissue.x > W - TISSUE_W / 2) { tissue.x = W - TISSUE_W / 2; tissue.vx *= -0.3; }
  if (tissue.y < TISSUE_H / 2) { tissue.y = TISSUE_H / 2; tissue.vy *= -0.3; }

  floorY = getRisingFloorY();
  applyWallTurbulence();

  if (tissue.y + TISSUE_H / 2 >= floorY) {
    endGame();
  }
}

function endGame() {
  state = State.GAME_OVER;
  score = parseFloat(playTime.toFixed(1));
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('tissue-best', bestScore.toString());
    newBest = true;
  }
}

function drawTissue(t) {
  ctx.save();
  ctx.translate(tissue.x, tissue.y);
  ctx.rotate(tissue.angle);

  const hw = TISSUE_W / 2;
  const hh = TISSUE_H / 2;
  const wobbleAmp = 3;
  const corners = [
    { x: -hw, y: -hh }, { x: hw, y: -hh },
    { x: hw, y: hh }, { x: -hw, y: hh },
  ];

  const edgePoints = [];
  for (let side = 0; side < 4; side++) {
    const from = corners[side];
    const to = corners[(side + 1) % 4];
    edgePoints.push(from);
    edgePoints.push({
      x: (from.x + to.x) / 2 + Math.sin(t * 3 + wobbleOffsets[side]) * wobbleAmp,
      y: (from.y + to.y) / 2 + Math.cos(t * 3 + wobbleOffsets[side + 4]) * wobbleAmp,
    });
  }

  ctx.beginPath();
  ctx.moveTo(edgePoints[0].x, edgePoints[0].y);
  for (let i = 0; i < edgePoints.length; i++) {
    const curr = edgePoints[i];
    const next = edgePoints[(i + 1) % edgePoints.length];
    ctx.quadraticCurveTo(curr.x, curr.y, (curr.x + next.x) / 2, (curr.y + next.y) / 2);
  }
  ctx.closePath();

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#d0d0d0';
  ctx.lineWidth = 1.5;
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#e8e8e8';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-hw * 0.3, -hh * 0.5);
  ctx.quadraticCurveTo(0, hh * 0.1, hw * 0.3, -hh * 0.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-hw * 0.1, hh * 0.1);
  ctx.quadraticCurveTo(hw * 0.1, hh * 0.4, hw * 0.4, hh * 0.15);
  ctx.stroke();

  ctx.restore();
}

function drawShadow() {
  const shadowY = floorY + 5;
  const heightRatio = Math.max(0, 1 - (floorY - tissue.y) / (floorY - TISSUE_H));
  const shadowW = TISSUE_W * 0.6 * (0.3 + heightRatio * 0.7);
  const shadowH = 4 * (0.3 + heightRatio * 0.7);
  ctx.beginPath();
  ctx.ellipse(tissue.x, shadowY, shadowW, shadowH, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(0, 0, 0, ${heightRatio * 0.15})`;
  ctx.fill();
}

function drawFloor() {
  ctx.beginPath();
  ctx.moveTo(0, floorY);
  ctx.lineTo(W, floorY);
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function getPhaseLabel() {
  if (playTime < 10) return null;
  if (playTime < 15) return { text: '돌풍 주의', color: '#c08030' };
  if (playTime < 20) return { text: '바닥 상승 중', color: '#cc6633' };
  if (playTime < 30) return { text: '위험 구간', color: '#cc4444' };
  return { text: '극한 구간', color: '#aa2222' };
}

function drawHUD() {
  ctx.fillStyle = '#333';
  ctx.font = '500 16px -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${playTime.toFixed(1)}s`, 20, 40);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#aaa';
  ctx.font = '400 13px -apple-system, sans-serif';
  ctx.fillText(`BEST ${bestScore.toFixed(1)}s`, W - 20, 40);

  const phase = getPhaseLabel();
  if (phase) {
    ctx.textAlign = 'center';
    ctx.fillStyle = phase.color;
    ctx.font = '500 13px -apple-system, sans-serif';
    ctx.fillText(phase.text, W / 2, 40);
  }
}

function drawReadyGuide(t) {
  const cx = W / 2;
  const tissueY = H * 0.42;
  const fingerY = tissueY + 90;
  const bounce = Math.sin(t * 2.5) * 6;

  drawFloor();

  ctx.save();
  ctx.translate(cx, tissueY);
  const hw = TISSUE_W / 2;
  const hh = TISSUE_H / 2;
  ctx.beginPath();
  const corners = [
    { x: -hw, y: -hh }, { x: hw, y: -hh },
    { x: hw, y: hh }, { x: -hw, y: hh },
  ];
  const ep = [];
  for (let s = 0; s < 4; s++) {
    const from = corners[s];
    const to = corners[(s + 1) % 4];
    ep.push(from);
    ep.push({
      x: (from.x + to.x) / 2 + Math.sin(t * 3 + wobbleOffsets[s]) * 3,
      y: (from.y + to.y) / 2 + Math.cos(t * 3 + wobbleOffsets[s + 4]) * 3,
    });
  }
  ctx.moveTo(ep[0].x, ep[0].y);
  for (let i = 0; i < ep.length; i++) {
    const curr = ep[i];
    const next = ep[(i + 1) % ep.length];
    ctx.quadraticCurveTo(curr.x, curr.y, (curr.x + next.x) / 2, (curr.y + next.y) / 2);
  }
  ctx.closePath();
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#d0d0d0';
  ctx.lineWidth = 1.5;
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  const arrowX = cx;
  const arrowBottom = tissueY - hh - 8;
  const arrowTop = arrowBottom - 30 + bounce;
  ctx.beginPath();
  ctx.moveTo(arrowX, arrowBottom);
  ctx.lineTo(arrowX, arrowTop);
  ctx.strokeStyle = '#bbb';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(arrowX - 5, arrowTop + 8);
  ctx.lineTo(arrowX, arrowTop);
  ctx.lineTo(arrowX + 5, arrowTop + 8);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, fingerY + bounce, 14, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, fingerY + bounce, 6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.fill();

  ctx.fillStyle = '#aaa';
  ctx.font = '400 12px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('tap here', cx, fingerY + bounce + 30);
}

function drawReady() {
  const t = Date.now() / 1000;

  ctx.fillStyle = '#222';
  ctx.font = '500 28px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Tissue Flying', W / 2, H * 0.12);

  ctx.fillStyle = '#999';
  ctx.font = '400 14px -apple-system, sans-serif';
  ctx.fillText('티슈 아래를 터치해서 바람을 일으키세요', W / 2, H * 0.12 + 32);

  drawReadyGuide(t);

  ctx.fillStyle = '#bbb';
  ctx.font = '400 14px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Tap anywhere to start', W / 2, H * 0.82);
  if (bestScore > 0) {
    ctx.fillStyle = '#ccc';
    ctx.font = '400 13px -apple-system, sans-serif';
    ctx.fillText(`Best: ${bestScore.toFixed(1)}s`, W / 2, H * 0.82 + 25);
  }
}

function drawCountdown() {
  const remaining = Math.ceil(Math.max(0, countdownEnd - Date.now()) / 1000);
  ctx.fillStyle = '#222';
  ctx.font = '600 64px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(remaining.toString(), W / 2, H * 0.4);
  ctx.textBaseline = 'alphabetic';
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(250, 250, 250, 0.85)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#222';
  ctx.font = '500 28px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', W / 2, H * 0.32);
  ctx.fillStyle = '#333';
  ctx.font = '500 48px -apple-system, sans-serif';
  ctx.fillText(`${score.toFixed(1)}s`, W / 2, H * 0.42);
  if (newBest) {
    ctx.fillStyle = '#e8a040';
    ctx.font = '500 16px -apple-system, sans-serif';
    ctx.fillText('New Best!', W / 2, H * 0.42 + 35);
  }
  const bestText = `Best: ${bestScore.toFixed(1)}s`;
  ctx.font = '500 14px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  const bestMetrics = ctx.measureText(bestText);
  const bx = W / 2;
  const by = H * 0.55;
  const bPadX = 16;
  const bPadY = 10;
  const bw = bestMetrics.width + bPadX * 2;
  const bh = 18 + bPadY * 2;
  const br = 8;
  ctx.beginPath();
  ctx.roundRect(bx - bw / 2, by - bh / 2, bw, bh, br);
  ctx.fillStyle = '#444';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillText(bestText, bx, by + 5);
  const btnText = 'Click to retry';
  ctx.font = '400 13px -apple-system, sans-serif';
  const btnMetrics = ctx.measureText(btnText);
  const btnPadX = 14;
  const btnPadY = 7;
  const btnW = btnMetrics.width + btnPadX * 2;
  const btnH = 16 + btnPadY * 2;
  const btnX = W / 2 - btnW / 2;
  const btnY = H * 0.65 - btnH / 2;
  retryBtn = { x: btnX, y: btnY, w: btnW, h: btnH };
  ctx.beginPath();
  ctx.roundRect(btnX, btnY, btnW, btnH, 6);
  ctx.fillStyle = '#222';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(btnText, W / 2, H * 0.65 + 5);
}

function loop() {
  const now = Date.now();
  const dt = lastLoopTime ? Math.min((now - lastLoopTime) / 1000, 0.5) : 0.016;
  lastLoopTime = now;
  const t = now / 1000;

  ctx.clearRect(0, 0, W, H);

  if (state === State.READY) {
    drawReady();
    return;
  }

  if (state === State.COUNTDOWN) {
    if (Date.now() >= countdownEnd) {
      state = State.PLAYING;
      playStartTime = Date.now();
      playTime = 0;
      lastLoopTime = Date.now();
    }
    drawFloor();
    drawShadow();
    drawTissue(t);
    if (state === State.COUNTDOWN) drawCountdown();
    return;
  }

  if (state === State.PLAYING) {
    playTime = (Date.now() - playStartTime) / 1000;
    updatePhysics(dt);
    updateHazards(dt);
    updateParticles();

    if (screenShake > 0.01) {
      ctx.save();
      const sx = (Math.random() - 0.5) * screenShake * 12;
      const sy = (Math.random() - 0.5) * screenShake * 12;
      ctx.translate(sx, sy);
    }

    drawRisingFloorZone();
    drawFloor();
    drawDangerZones();
    drawGustVisuals();
    drawParticles();
    drawShadow();
    drawTissue(t);
    drawProximityWarning();
    drawHUD();
    drawWarning();

    if (screenShake > 0.01) ctx.restore();
    return;
  }

  if (state === State.GAME_OVER) {
    updateParticles();
    drawFloor();
    drawParticles();
    drawShadow();
    drawTissue(t);
    drawGameOver();
  }
}

resetTissue();
setInterval(loop, 16);
