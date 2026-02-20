import { cam, updateCamera } from './app/game/camera';
import {
  initGame,
  game,
  updateShipControls,
  checkShipCollision,
  updateBullets,
  updateParticles,
  updateWorld,
  asteroids,
  comets,
  debris,
  bullets,
  particles,
} from './app/game/engine';
import { SHIP_DEFS } from './app/game/entities/ship';
import { initInput } from './app/game/input';
import { buildStars, drawBackground } from './app/game/rendering/background';
import { drawMinimap } from './app/game/rendering/minimap';
import { drawWorldBorder, drawParticles, drawBullets, drawShip } from './app/game/rendering/renderer';
import { updateHUD } from './app/ui/hud';
import { initScreens, showWinScreen, sel } from './app/ui/screens';

const canvas = document.getElementById('c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
let W = 0, H = 0;
let lastTime = performance.now();
let frames = 0;
const fpsEl = document.getElementById('fps');

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  buildStars();
}

function onGameWin() {
  if (!game) return;
  const p0 = game.p[0],
    p1 = game.p[1];
  const p0d = p0.hp <= 0,
    p1d = p1.hp <= 0;
  let wt = '',
    ws = '',
    wc = '';
  if (p0d && p1d) {
    wt = 'DRAW';
    ws = 'MUTUAL ANNIHILATION';
    wc = 'wd';
  } else if (p1d) {
    wt = 'PLAYER 1 WINS';
    ws = SHIP_DEFS[sel[0]].name + ' VICTORIOUS';
    wc = 'wp1';
  } else if (p0d) {
    wt = 'PLAYER 2 WINS';
    ws = SHIP_DEFS[sel[1]].name + ' VICTORIOUS';
    wc = 'wp2';
  } else {
    const r0 = p0.hp / p0.maxHp,
      r1 = p1.hp / p1.maxHp;
    if (r0 > r1) {
      wt = 'PLAYER 1 WINS';
      ws = 'BY ENDURANCE';
      wc = 'wp1';
    } else if (r1 > r0) {
      wt = 'PLAYER 2 WINS';
      ws = 'BY ENDURANCE';
      wc = 'wp2';
    } else {
      wt = 'DRAW';
      ws = 'EQUAL FORTITUDE';
      wc = 'wd';
    }
  }
  showWinScreen(wt, ws, wc);
}

function loop() {
  const now = performance.now();
  frames++;
  if (now >= lastTime + 1000) {
    const fps = Math.round((frames * 1000) / (now - lastTime));
    if (fpsEl) {
      fpsEl.textContent = `FPS: ${fps}`;
      if (fps < 20) fpsEl.classList.add('low-fps');
      else fpsEl.classList.remove('low-fps');
    }
    lastTime = now;
    frames = 0;
  }
  W = canvas.width;
  H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  drawBackground(ctx, W, H, cam);

  if (game) {
    const aliveShips = game.p.filter((s) => s.alive());
    updateCamera(aliveShips, W, H);
    drawWorldBorder(ctx, cam);

    for (let i = 0; i < asteroids.length; i++) asteroids[i].draw(ctx, cam);
    for (let i = 0; i < comets.length; i++) comets[i].draw(ctx, cam);
    for (let i = 0; i < debris.length; i++) debris[i].draw(ctx, cam);

    drawParticles(ctx, particles, cam);
    drawBullets(ctx, bullets, cam);

    if (!game.over) {
      for (let i = 0; i < game.p.length; i++) updateShipControls(game.p[i], i);
      checkShipCollision();
      updateBullets();
      updateParticles();
      updateWorld();
      for (let i = 0; i < game.p.length; i++) drawShip(ctx, game.p[i], cam);
      updateHUD(game);
    } else {
      for (let i = 0; i < game.p.length; i++) drawShip(ctx, game.p[i], cam);
      updateParticles();
      for (let i = 0; i < debris.length; i++) debris[i].update();
    }
    drawMinimap(ctx, W, H, asteroids, comets, game);
  }
  requestAnimationFrame(loop);
}

window.addEventListener('resize', resize);
initInput();
initScreens(() => initGame(sel, onGameWin, updateHUD));
resize();
loop();
