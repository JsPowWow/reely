import { SFX } from './audio';
import { WW, WH, GAME_TIME } from './constants';
import { Asteroid } from './entities/asteroid';
import { Bullet } from './entities/bullet';
import { Comet } from './entities/comet';
import { Debris } from './entities/debris';
import { Particle } from './entities/particle';
import { Ship, SHIP_DEFS } from './entities/ship';
import { codes, keys, joy, btnFire, btnSpec } from './input';

import type { GameState } from './types';

export let game: GameState | null = null;
export let bullets: Bullet[] = [];
export let particles: Particle[] = [];
export let debris: Debris[] = [];
export let asteroids: Asteroid[] = [];
export let comets: Comet[] = [];
let timerInt: any = null;

export function boom(x: number, y: number, color: string, n: number, spd: number, life: number, sz: number) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2,
      s = Math.random() * spd + spd * 0.2;
    particles.push(new Particle(x, y, Math.cos(a) * s, Math.sin(a) * s, color, life * (0.6 + Math.random() * 0.8), Math.random() * sz + 0.5));
  }
}

export function sparks(x: number, y: number) {
  for (let i = 0; i < 8; i++) {
    const a = Math.random() * Math.PI * 2,
      s = Math.random() * 6 + 2;
    particles.push(new Particle(x, y, Math.cos(a) * s, Math.sin(a) * s, '#ffffff', 8 + Math.random() * 8, Math.random() * 1.5 + 0.5));
  }
  boom(x, y, '#ff9900', 6, 3, 22, 2.5);
}

export function spawnDebris(x: number, y: number, color: string, n: number) {
  for (let i = 0; i < n; i++) debris.push(new Debris(x, y, color));
}

export function damageAsteroid(idx: number, dmgAmount: number, impactX: number, impactY: number, dvx?: number, dvy?: number) {
  const ast = asteroids[idx];
  ast.hp -= dmgAmount;
  boom(impactX, impactY, '#aa8866', 6, 2, 20, 2);
  if (ast.hp <= 0) {
    SFX.bump();
    boom(ast.x, ast.y, '#cc9955', 16, 3.5, 38, 3.5);
    boom(ast.x, ast.y, '#554433', 8, 2.0, 22, 2);
    spawnDebris(ast.x, ast.y, '#776655', 4 + Math.floor(ast.size / 10));
    const children = ast.size > 40 ? 3 : ast.size > 22 ? 2 : 0;
    for (let k = 0; k < children; k++) {
      const angle = (Math.PI * 2 / children) * k + Math.random() * 0.8;
      const spread = ast.size * 0.28;
      const child = new Asteroid(ast.x + Math.cos(angle) * spread, ast.y + Math.sin(angle) * spread, ast.size * (0.38 + Math.random() * 0.18));
      child.vx = ast.vx + Math.cos(angle) * (1.2 + Math.random() * 1.5) + (dvx || 0) * 0.2;
      child.vy = ast.vy + Math.sin(angle) * (1.2 + Math.random() * 1.5) + (dvy || 0) * 0.2;
      child.rotSpd = (Math.random() - 0.5) * 0.025;
      asteroids.push(child);
    }
    asteroids.splice(idx, 1);
    return true;
  }
  return false;
}

export function genAsteroids() {
  asteroids = [];
  let d1, d2;
  for (let i = 0; i < 6; i++) {
    const cx = 200 + Math.random() * (WW - 400),
      cy = 200 + Math.random() * (WH - 400);
    const n = 3 + Math.floor(Math.random() * 5);
    for (let j = 0; j < n; j++) {
      const x = cx + (Math.random() - 0.5) * 350;
      const y = cy + (Math.random() - 0.5) * 350;
      d1 = Math.sqrt((x - WW * 0.25) ** 2 + (y - WH * 0.5) ** 2);
      d2 = Math.sqrt((x - WW * 0.75) ** 2 + (y - WH * 0.5) ** 2);
      if (d1 < 200 || d2 < 200) continue;
      asteroids.push(new Asteroid(x, y, 20 + Math.random() * 55));
    }
  }
  for (let i = 0; i < 18; i++) {
    const x = Math.random() * WW;
    const y = Math.random() * WH;
    d1 = Math.sqrt((x - WW * 0.25) ** 2 + (y - WH * 0.5) ** 2);
    d2 = Math.sqrt((x - WW * 0.75) ** 2 + (y - WH * 0.5) ** 2);
    if (d1 < 220 || d2 < 220) continue;
    asteroids.push(new Asteroid(x, y, 15 + Math.random() * 38));
  }
}

export function initGame(sel: number[], onWin: () => void, updateHUD: (game: any) => void) {
  bullets = [];
  particles = [];
  debris = [];
  comets = [];
  genAsteroids();
  const s0 = SHIP_DEFS[sel[0]],
    s1 = SHIP_DEFS[sel[1]];
  game = {
    p: [new Ship(s0, WW * 0.25, WH * 0.5, 0, 0), new Ship(s1, WW * 0.75, WH * 0.5, Math.PI, 1)],
    time: GAME_TIME,
    over: false,
  };

  const p1n = document.getElementById('p1n');
  const p2n = document.getElementById('p2n');
  if (p1n) p1n.textContent = s0.name;
  if (p2n) p2n.textContent = s1.name;

  updateHUD(game);

  if (timerInt) clearInterval(timerInt);
  const timerEl = document.getElementById('timer');
  if (timerEl) timerEl.textContent = GAME_TIME.toString();

  timerInt = setInterval(() => {
    if (!game || game.over) return;
    game.time--;
    if (timerEl) timerEl.textContent = game.time.toString();
    if (game.time <= 0) checkWin(onWin);
  }, 1000);
}

export function checkWin(onWin: () => void) {
  if (!game) return;
  const p0 = game.p[0],
    p1 = game.p[1];
  const p0d = p0.hp <= 0,
    p1d = p1.hp <= 0;
  if (p0d || p1d || game.time <= 0) {
    game.over = true;
    clearInterval(timerInt);
    for (let i = 0; i < game.p.length; i++) {
      const s = game.p[i];
      if (s.hp <= 0) {
        spawnDebris(s.x, s.y, s.color, 20);
        spawnDebris(s.x, s.y, '#666666', 12);
        boom(s.x, s.y, s.color, 30, 6, 65, 4.5);
        boom(s.x, s.y, '#ff8800', 20, 4, 40, 3.5);
      }
    }
    onWin();
  }
}

export function updateShipControls(ship: Ship, pi: number) {
  if (!ship.alive()) return;
  let thrust = false,
    reverse = false,
    left = false,
    right = false,
    fire = false,
    special = false;
  if (pi === 0) {
    thrust = !!codes['KeyW'];
    reverse = !!codes['KeyS'];
    left = !!codes['KeyA'];
    right = !!codes['KeyD'];
    fire = !!(codes['Space'] || codes['KeyF'] || btnFire[0]);
    special = !!(codes['KeyE'] || codes['KeyG'] || btnSpec[0]);
    if (joy[0].active) {
      const jx = joy[0].dx,
        jy = joy[0].dy,
        jl = Math.sqrt(jx * jx + jy * jy);
      if (jl > 0.12) {
        const ja = Math.atan2(jy, jx);
        let df = ja - ship.angle;
        while (df > Math.PI) df -= Math.PI * 2;
        while (df < -Math.PI) df += Math.PI * 2;
        ship.angle += df * 0.15;
        if (jl > 0.3) thrust = true;
      }
    }
  } else {
    thrust = !!keys['ArrowUp'];
    reverse = !!keys['ArrowDown'];
    left = !!keys['ArrowLeft'];
    right = !!keys['ArrowRight'];
    fire = !!(keys['Enter'] || keys[','] || btnFire[1]);
    special = !!(keys['Shift'] || keys['.'] || btnSpec[1]);
    if (joy[1].active) {
      const jx2 = joy[1].dx,
        jy2 = joy[1].dy,
        jl2 = Math.sqrt(jx2 * jx2 + jy2 * jy2);
      if (jl2 > 0.12) {
        const ja2 = Math.atan2(jy2, jx2);
        let df2 = ja2 - ship.angle;
        while (df2 > Math.PI) df2 -= Math.PI * 2;
        while (df2 < -Math.PI) df2 += Math.PI * 2;
        ship.angle += df2 * 0.15;
        if (jl2 > 0.3) thrust = true;
      }
    }
  }
  if (left) ship.angle -= ship.def.turnSpeed;
  if (right) ship.angle += ship.def.turnSpeed;
  if (thrust) {
    ship.vx += Math.cos(ship.angle) * ship.def.speed * 0.06;
    ship.vy += Math.sin(ship.angle) * ship.def.speed * 0.06;
    if (Math.random() < 0.38) {
      const pa = ship.angle + Math.PI + (Math.random() - 0.5) * 0.6;
      particles.push(new Particle(ship.x - Math.cos(ship.angle) * 16, ship.y - Math.sin(ship.angle) * 16, Math.cos(pa) * 2.5 + ship.vx * 0.08, Math.sin(pa) * 2.5 + ship.vy * 0.08, ship.color + 'bb', 20, 2));
    }
  }
  if (reverse) {
    ship.vx -= Math.cos(ship.angle) * ship.def.speed * 0.036;
    ship.vy -= Math.sin(ship.angle) * ship.def.speed * 0.036;
    if (Math.random() < 0.25) {
      const pf = ship.angle + (Math.random() - 0.5) * 0.4;
      particles.push(new Particle(ship.x + Math.cos(ship.angle) * 14, ship.y + Math.sin(ship.angle) * 14, Math.cos(pf) * 1.5 + ship.vx * 0.05, Math.sin(pf) * 1.5 + ship.vy * 0.05, ship.color + '66', 14, 1.5));
    }
  }
  ship.updatePosition();
  if (fire) fireWeapon(ship);
  if (special) activateSpecial(ship);
  ship.energy = Math.min(ship.maxEnergy, ship.energy + 0.08);
  if (ship.specialActive) {
    ship.specialTimer -= 16;
    if (ship.specialTimer <= 0) {
      ship.specialActive = false;
      ship.alpha = 1;
      ship.shieldHp = 0;
    }
  }
  if (ship.hitFlash > 0) ship.hitFlash--;
  if (ship.collideFlash > 0) ship.collideFlash--;
  if (ship.dmg() > 0.45 && Math.random() < ship.dmg() * 0.12) {
    particles.push(new Particle(ship.x + (Math.random() - 0.5) * 16, ship.y + (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, '#444444', 50, 4 + Math.random() * 3));
  }
  if (ship.dmg() > 0.75 && Math.random() < 0.06) {
    particles.push(new Particle(ship.x + (Math.random() - 0.5) * ship.def.radius, ship.y + (Math.random() - 0.5) * ship.def.radius, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, '#ff5500', 22, 3));
  }
}

export function checkShipCollision() {
  if (!game) return;
  const a = game.p[0],
    b = game.p[1];
  if (!a.alive() || !b.alive()) return;
  const dx = b.x - a.x,
    dy = b.y - a.y,
    dist = Math.sqrt(dx * dx + dy * dy);
  const minD = a.def.radius + b.def.radius;
  if (dist >= minD || dist < 0.01) return;
  const ov = minD - dist,
    nx = dx / dist,
    ny = dy / dist,
    tm = a.def.mass + b.def.mass;
  a.x -= nx * ov * (b.def.mass / tm);
  a.y -= ny * ov * (b.def.mass / tm);
  b.x += nx * ov * (a.def.mass / tm);
  b.y += ny * ov * (a.def.mass / tm);
  const dvn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
  if (dvn > 0) return;
  const e = 0.55,
    j2 = (-(1 + e) * dvn) / (1 / a.def.mass + 1 / b.def.mass);
  a.vx -= (j2 * nx) / a.def.mass;
  a.vy -= (j2 * ny) / a.def.mass;
  b.vx += (j2 * nx) / b.def.mass;
  b.vy += (j2 * ny) / b.def.mass;
  const imp = Math.abs(dvn);
  if (imp > 0.7) {
    a.hp -= imp * b.def.mass * 0.28;
    b.hp -= imp * a.def.mass * 0.28;
    a.hitFlash = 8;
    b.hitFlash = 8;
    a.collideFlash = 10;
    b.collideFlash = 10;
    SFX.bump();
    const mx = (a.x + b.x) / 2,
      my = (a.y + b.y) / 2;
    sparks(mx, my);
  }
}

export function fireWeapon(ship: Ship) {
  const now = Date.now();
  if (now - ship.lastFire < ship.def.fireRate) return;
  if (ship.energy < 5) return;
  ship.lastFire = now;
  ship.energy -= 5;
  if (ship.def.isLaser) {
    if (!game) return;
    const en = game.p[ship.playerIdx === 0 ? 1 : 0];
    if (en && en.alive()) {
      const dx = en.x - ship.x,
        dy = en.y - ship.y,
        dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < (ship.def.laserRange || 0)) {
        let dmg = ship.def.bulletDmg;
        if (en.shieldHp > 0) {
          en.shieldHp -= dmg;
          dmg = 0;
          if (en.shieldHp < 0) {
            dmg = -en.shieldHp;
            en.shieldHp = 0;
          }
        }
        en.hp -= dmg;
        en.hitFlash = 3;
        if (dmg > 0) SFX.laser();
        else SFX.shield();
        ship.laserTarget = { x: en.x, y: en.y };
        const mx = ship.x + dx * 0.65,
          my2 = ship.y + dy * 0.65;
        if (Math.random() < 0.5) particles.push(new Particle(mx, my2, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, '#ff6600', 12, 2.5));
      } else ship.laserTarget = null;
    }
    return;
  }
  SFX.fire();
  bullets.push(new Bullet(ship.x + Math.cos(ship.angle) * 24, ship.y + Math.sin(ship.angle) * 24, Math.cos(ship.angle) * ship.def.bulletSpeed + ship.vx * 0.3, Math.sin(ship.angle) * ship.def.bulletSpeed + ship.vy * 0.3, ship.def.bulletDmg, ship.def.bulletColor, ship.playerIdx, false));
  ship.vx -= Math.cos(ship.angle) * 0.22;
  ship.vy -= Math.sin(ship.angle) * 0.22;
}

export function activateSpecial(ship: Ship) {
  const now = Date.now();
  if (now - ship.lastSpecial < ship.def.specialCooldown) return;
  if (ship.energy < 30) return;
  ship.lastSpecial = now;
  ship.energy -= 30;
  const id = ship.def.id;
  if (id === 'scout') {
    ship.vx += Math.cos(ship.angle) * 9;
    ship.vy += Math.sin(ship.angle) * 9;
    SFX.special();
    boom(ship.x, ship.y, ship.color, 22, 3, 32, 2.5);
  } else if (id === 'tank') {
    ship.shieldHp = 60;
    ship.specialActive = true;
    ship.specialTimer = 3000;
    SFX.shield();
  } else if (id === 'sniper') {
    SFX.special();
    const sb = new Bullet(ship.x + Math.cos(ship.angle) * 30, ship.y + Math.sin(ship.angle) * 30, Math.cos(ship.angle) * 20 + ship.vx, Math.sin(ship.angle) * 20 + ship.vy, 80, ship.def.bulletColor, ship.playerIdx, false);
    sb.r = 6;
    bullets.push(sb);
  } else if (id === 'bomber') {
    SFX.mine();
    bullets.push(new Bullet(ship.x, ship.y, 0, 0, 40, '#ffdd00', ship.playerIdx, true));
  } else if (id === 'ghost') {
    ship.alpha = 0.18;
    ship.specialActive = true;
    ship.specialTimer = 3000;
    SFX.special();
  } else if (id === 'orb') {
    SFX.nova();
    for (let k = 0; k < 12; k++) {
      const a2 = (Math.PI * 2 / 12) * k;
      const nb2 = new Bullet(ship.x, ship.y, Math.cos(a2) * 7, Math.sin(a2) * 7, 20, '#ff6600', ship.playerIdx, false);
      nb2.r = 4;
      nb2.life = 45;
      nb2.maxLife = 45;
      bullets.push(nb2);
    }
    boom(ship.x, ship.y, '#ff4400', 28, 5, 42, 3.5);
  }
}

export function updateBullets() {
  if (!game) return;
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.update();
    if (b.life <= 0) {
      bullets.splice(i, 1);
      continue;
    }
    let hit = false;
    for (let pi = 0; pi < game.p.length; pi++) {
      const ship = game.p[pi];
      if (ship.playerIdx === b.owner || !ship.alive()) continue;
      if (ship.def.id === 'ghost' && ship.specialActive) continue;
      const dx = ship.x - b.x,
        dy = ship.y - b.y,
        dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < ship.def.radius + b.r - 4) {
        let dmg = b.dmg;
        if (ship.shieldHp > 0) {
          ship.shieldHp -= dmg;
          dmg = 0;
          if (ship.shieldHp < 0) {
            dmg = -ship.shieldHp;
            ship.shieldHp = 0;
          }
        }
        ship.hp -= dmg;
        ship.hitFlash = 6;
        if (dmg > 0) SFX.hit();
        if (ship.hp <= 0) SFX.explode();
        boom(b.x, b.y, b.color, b.isMine ? 26 : 10, b.isMine ? 4 : 3, b.isMine ? 45 : 28, b.isMine ? 3.5 : 2.5);
        sparks(b.x, b.y);
        bullets.splice(i, 1);
        hit = true;
        break;
      }
    }
    if (hit) continue;
    for (let ai = asteroids.length - 1; ai >= 0; ai--) {
      const ast = asteroids[ai];
      const dx = b.x - ast.x,
        dy = b.y - ast.y,
        dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < ast.size + b.r) {
        damageAsteroid(ai, b.dmg * 0.55, b.x, b.y, b.vx, b.vy);
        bullets.splice(i, 1);
        hit = true;
        break;
      }
    }
  }
}

export function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    if (particles[i].life <= 0) particles.splice(i, 1);
  }
}

export function updateWorld() {
  if (!game) return;
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const ast = asteroids[i];
    ast.update();
    for (let pi = 0; pi < game.p.length; pi++) {
      const ship = game.p[pi];
      if (!ship.alive()) continue;
      const dx = ship.x - ast.x,
        dy = ship.y - ast.y,
        dist = Math.sqrt(dx * dx + dy * dy);
      const minD = ship.def.radius + ast.size;
      if (dist < minD && dist > 0.1) {
        const nx2 = dx / dist,
          ny2 = dy / dist,
          ov = minD - dist;
        ship.x += nx2 * ov * 0.8;
        ship.y += ny2 * ov * 0.8;
        ast.x -= nx2 * ov * 0.2;
        ast.y -= ny2 * ov * 0.2;
        const dvn = (ship.vx - ast.vx) * nx2 + (ship.vy - ast.vy) * ny2;
        if (dvn < 0) {
          const imp = Math.abs(dvn);
          const e2 = 0.45,
            massA = ship.def.mass,
            massB = Math.max(1, ast.size * 0.08);
          const jj = (-(1 + e2) * dvn) / (1 / massA + 1 / massB);
          ship.vx += (jj * nx2) / massA;
          ship.vy += (jj * ny2) / massA;
          ast.vx -= (jj * nx2) / massB;
          ast.vy -= (jj * ny2) / massB;
          const aspd = Math.sqrt(ast.vx * ast.vx + ast.vy * ast.vy);
          if (aspd > 4) {
            ast.vx = (ast.vx / aspd) * 4;
            ast.vy = (ast.vy / aspd) * 4;
          }
          const dmg = imp * ast.size * 0.1;
          if (dmg > 0.8) {
            ship.hp -= dmg;
            ship.hitFlash = 6;
            ship.collideFlash = 8;
            SFX.bump();
            sparks((ship.x + ast.x) / 2, (ship.y + ast.y) / 2);
          }
          const astDmg = imp * massA * 1.8;
          if (astDmg > 0.5) {
            damageAsteroid(i, astDmg, (ship.x + ast.x) / 2, (ship.y + ast.y) / 2, -ship.vx, -ship.vy);
          }
        }
      }
    }
    for (let j = i - 1; j >= 0; j--) {
      const ast2 = asteroids[j];
      const dx = ast2.x - ast.x,
        dy = ast2.y - ast.y,
        dist = Math.sqrt(dx * dx + dy * dy);
      const minD = ast.size + ast2.size;
      if (dist < minD && dist > 0.1) {
        const nx3 = dx / dist,
          ny3 = dy / dist,
          ov3 = minD - dist;
        const m1 = Math.max(1, ast.size * 0.08),
          m2 = Math.max(1, ast2.size * 0.08),
          mt = m1 + m2;
        ast.x -= nx3 * ov3 * (m2 / mt);
        ast.y -= ny3 * ov3 * (m2 / mt);
        ast2.x += nx3 * ov3 * (m1 / mt);
        ast2.y += ny3 * ov3 * (m1 / mt);
        const dvn = (ast2.vx - ast.vx) * nx3 + (ast2.vy - ast.vy) * ny3;
        if (dvn < 0) {
          const imp = Math.abs(dvn);
          const e3 = 0.6,
            jj3 = (-(1 + e3) * dvn) / (1 / m1 + 1 / m2);
          ast.vx -= (jj3 * nx3) / m1;
          ast.vy -= (jj3 * ny3) / m1;
          ast2.vx += (jj3 * nx3) / m2;
          ast2.vy += (jj3 * ny3) / m2;
          const sp1 = Math.sqrt(ast.vx * ast.vx + ast.vy * ast.vy);
          const sp2 = Math.sqrt(ast2.vx * ast2.vx + ast2.vy * ast2.vy);
          if (sp1 > 5) {
            ast.vx = (ast.vx / sp1) * 5;
            ast.vy = (ast.vy / sp1) * 5;
          }
          if (sp2 > 5) {
            ast2.vx = (ast2.vx / sp2) * 5;
            ast2.vy = (ast2.vy / sp2) * 5;
          }
          const dmg1 = imp * m2 * 2.2,
            dmg2 = imp * m1 * 2.2;
          const mx3 = (ast.x + ast2.x) / 2,
            my3 = (ast.y + ast2.y) / 2;
          if (imp > 0.4) {
            boom(mx3, my3, '#aa8844', 6, 2, 22, 2);
            if (imp > 1.2) sparks(mx3, my3);
          }
          if (dmg1 > 0.8) damageAsteroid(i, dmg1, mx3, my3, 0, 0);
          if (dmg2 > 0.8) damageAsteroid(j, dmg2, mx3, my3, 0, 0);
        }
      }
    }
  }
  for (let i = comets.length - 1; i >= 0; i--) {
    const c2 = comets[i];
    c2.update();
    let cometDead = false;
    for (let pi2 = 0; pi2 < game.p.length; pi2++) {
      const sh2 = game.p[pi2];
      if (!sh2.alive()) continue;
      const dx = sh2.x - c2.x,
        dy = sh2.y - c2.y,
        dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < sh2.def.radius + c2.r * 2.5) {
        sh2.hp -= Math.sqrt(c2.vx * c2.vx + c2.vy * c2.vy) * 3.5;
        sh2.vx += c2.vx * 0.5;
        sh2.vy += c2.vy * 0.5;
        sh2.hitFlash = 10;
        boom(c2.x, c2.y, c2.color, 18, 5, 35, 3.5);
        SFX.bump();
        comets.splice(i, 1);
        cometDead = true;
        break;
      }
    }
    if (cometDead) continue;
    let hitAst = false;
    for (let ai2 = asteroids.length - 1; ai2 >= 0; ai2--) {
      const ast3 = asteroids[ai2];
      const dx = ast3.x - c2.x,
        dy = ast3.y - c2.y,
        dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < ast3.size + c2.r * 1.5) {
        const cometDmg = (c2.power || 30) * 1.8;
        boom(c2.x, c2.y, c2.color, 20, 5, 40, 3.5);
        boom(c2.x, c2.y, '#aa8844', 10, 3, 25, 2.5);
        SFX.bump();
        ast3.vx += c2.vx * 0.25;
        ast3.vy += c2.vy * 0.25;
        const cAspd = Math.sqrt(ast3.vx * ast3.vx + ast3.vy * ast3.vy);
        if (cAspd > 6) {
          ast3.vx = (ast3.vx / cAspd) * 6;
          ast3.vy = (ast3.vy / cAspd) * 6;
        }
        damageAsteroid(ai2, cometDmg, c2.x, c2.y, c2.vx, c2.vy);
        comets.splice(i, 1);
        hitAst = true;
        break;
      }
    }
    if (hitAst) continue;
    if (!c2.alive()) comets.splice(i, 1);
  }
  for (let i = debris.length - 1; i >= 0; i--) {
    debris[i].update();
    if (!debris[i].alive()) debris.splice(i, 1);
  }
  if (Math.random() < 0.007 && comets.length < 12) comets.push(new Comet());
}
