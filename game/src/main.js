// main.js — Harbour & Honey: boot, loop, input, state machine.
// Screens: title -> play -> paused -> feast. ?shot=cover|route|batch|feast
// stages a frozen scene and sets window.__shotReady for screenshots.
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');

// The whole game state in one object (exposed as window.GAME for testing).
const G = {
  state: 'title',
  shotMode: false,
  timeLeft: HH.SHIFT_SECONDS,
  coins: 0,
  served: 0,
  streak: 0,
  bestStreak: 0,
  walkouts: 0,
  dockIndex: 0,
  rush: 0,
  rushTimer: 40,
  animT: 0,
  carry: null,       // {ticketId, dish, stage 0..3}
  selectedId: null,
  nearStation: null,
  workProgress: 0,
  bellT: 0,
  hint: '',
  hintT: 0,
  passPlates: 0,
  passDishes: [],
  player: { x: 640, y: 580, tx: null, ty: null, moving: false },
};
window.GAME = G;

const keys = {};
let ePressed = false;

function resetGame() {
  G.state = 'play';
  G.timeLeft = HH.SHIFT_SECONDS;
  G.coins = 0;
  G.served = 0;
  G.streak = 0;
  G.bestStreak = 0;
  G.walkouts = 0;
  G.dockIndex = 0;
  G.rush = 0;
  G.rushTimer = 40;
  G.carry = null;
  G.selectedId = null;
  G.workProgress = 0;
  G.bellT = 0;
  G.hint = '';
  G.hintT = 0;
  G.passPlates = 0;
  G.passDishes = [];
  G.player.x = 640;
  G.player.y = 580;
  G.player.tx = null;
  HH.orders.reset();
  HH.route.reset();
  HH.prep.reset();
  HH.orders.spawnCatch();
  HH.orders.spawn();
  HH.orders.spawn();
}

function fmtTime(s) {
  return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
}

function update(dt) {
  G.animT += dt;
  if (G.bellT > 0) G.bellT -= dt;
  if (G.hintT > 0) G.hintT -= dt;
  if (G.state !== 'play' || G.shotMode) return;

  G.timeLeft -= dt;
  if (G.timeLeft <= 0) { G.timeLeft = 0; G.state = 'feast'; return; }

  // Wave rush every ~40s: 12 seconds of double pressure, no new chores.
  G.rushTimer -= dt;
  if (G.rushTimer <= 0) {
    if (G.rush > 0) { G.rush = 0; G.rushTimer = 40; }
    else { G.rush = 12; G.rushTimer = 12; G.hint = 'WAVE RUSH! The tide is coming in fast!'; G.hintT = 2.5; }
  }
  if (G.rush > 0) G.rush -= dt;

  HH.orders.update(dt);
  HH.route.update(dt);
  HH.prep.update(dt);

  // Player movement: keys, or click-to-walk target.
  const p = G.player;
  let mx = 0, my = 0;
  if (keys['KeyA'] || keys['ArrowLeft']) mx -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) mx += 1;
  if (keys['KeyW'] || keys['ArrowUp']) my -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) my += 1;
  if (mx || my) {
    p.tx = null; p.ty = null;
    const len = Math.hypot(mx, my);
    p.x += (mx / len) * 320 * dt;
    p.y += (my / len) * 320 * dt;
    p.moving = true;
  } else if (p.tx !== null) {
    const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
    if (d < 6) { p.tx = null; p.ty = null; p.moving = false; }
    else { p.x += (dx / d) * 320 * dt; p.y += (dy / d) * 320 * dt; p.moving = true; }
  } else {
    p.moving = false;
  }
  p.x = Math.max(24, Math.min(HH.W - 24, p.x));
  p.y = Math.max(510, Math.min(644, p.y));

  const eHeld = !!keys['KeyE'];
  HH.stations.interact(dt, eHeld, ePressed);
  ePressed = false;

  // Pass plates shown = served this dock (cap 3), for the cover's READY row.
  G.passPlates = Math.min(3, HH.route.legServed);
  if (G.passPlates > 0 && (!G.passDishes || G.passDishes.length !== G.passPlates)) {
    G.passDishes = [];
    const menu = HH.MENUS[G.dockIndex];
    for (let i = 0; i < G.passPlates; i++) G.passDishes.push(HH.DISHES[menu[i % menu.length]]);
  }
}

function render() {
  ctx.save();
  const sway = HH.boats.sway();
  ctx.translate(sway, 0);
  HH.boats.drawBackground(ctx);
  HH.stations.draw(ctx);
  HH.boats.drawPlayer(ctx);
  ctx.restore();
  HH.hud.draw(ctx);
  if (G.state === 'title') {
    HH.hud.drawOverlay(ctx, 'HARBOUR & HONEY', [
      'Cook aboard a boat sailing between three docks.',
      'Plan your route: pantry, chop, stove, stock pot, pass.',
      'One stock pot feeds three dishes — batch it.',
      'Serve the catch of the day before the tide turns.',
    ], 'Press ENTER or click to start cooking');
  } else if (G.state === 'paused') {
    HH.hud.drawOverlay(ctx, 'PAUSED', [
      'Coins $' + G.coins + '   •   Served ' + G.served + '   •   Streak x' + G.streak,
      'Dock: ' + HH.route.dock().name + '  •  Leg ' + (G.dockIndex + 1) + '/3',
    ], 'Press P to keep cooking');
  } else if (G.state === 'feast') {
    HH.hud.drawOverlay(ctx, 'HARBOUR FEAST!', [
      'Shift over — ' + G.served + ' dishes served, $' + G.coins + ' earned.',
      'Best streak x' + G.bestStreak + '   •   Walkouts ' + G.walkouts,
      G.dockIndex >= HH.DOCKS.length - 1
        ? 'All three docks worked. The harbour eats tonight!'
        : 'Next dock: ' + HH.DOCKS[Math.min(2, G.dockIndex + 1)].name,
    ], 'Press R to cook another shift');
  }
}

let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  render();
}

window.addEventListener('keydown', (e) => {
  if (e.repeat) { keys[e.code] = true; return; }
  keys[e.code] = true;
  if (e.code === 'KeyE') ePressed = true;
  if (e.code === 'Enter' && (G.state === 'title' || G.state === 'feast')) resetGame();
  if (e.code === 'KeyR' && G.state === 'feast') resetGame();
  if (e.code === 'KeyP' && G.state === 'play') G.state = 'paused';
  else if (e.code === 'KeyP' && G.state === 'paused') G.state = 'play';
  if (e.code === 'KeyQ' && G.state === 'play') {
    const list = HH.orders.list;
    if (list.length) {
      const i = list.findIndex((t) => t.id === G.selectedId);
      G.selectedId = list[(i + 1) % list.length].id;
    }
  }
  if (e.code === 'KeyB' && G.state === 'play') G.bellT = 0.6;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

canvas.addEventListener('click', (e) => {
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) * (HH.W / r.width);
  const y = (e.clientY - r.top) * (HH.H / r.height);
  if (G.state === 'title' || G.state === 'feast') { resetGame(); return; }
  if (G.state !== 'play') return;
  // Click a ticket to select it.
  for (let i = 0; i < HH.MAX_TICKETS; i++) {
    const tx = 12 + i * 204;
    if (y >= 72 && y <= 150 && x >= tx && x <= tx + 196 && HH.orders.list[i]) {
      G.selectedId = HH.orders.list[i].id;
      return;
    }
  }
  // Click a station to walk to it.
  for (const s of HH.stations.list) {
    if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) {
      G.player.tx = s.x + s.w / 2;
      G.player.ty = s.y + s.h + 30;
      return;
    }
  }
  G.player.tx = x;
  G.player.ty = Math.max(510, Math.min(644, y));
});

if (shotName) {
  HH.shots.apply(shotName);
  let painted = 0;
  (function paint() {
    render();
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  })();
} else {
  requestAnimationFrame(frame);
}
