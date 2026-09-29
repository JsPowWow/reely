// Star Duel: authoritative PartyKit server.

import { hasProperty, isString } from '@reely/utils';
import type { Nullable } from '@reely/utils';

import type * as Party from 'partykit/server';

interface ShipDef {
  readonly speed: number;
  readonly maxSpeed: number;
  readonly hp: number;
  readonly turnSpeed: number;
  readonly mass: number;
  readonly radius: number;
  readonly fireRate: number;
  readonly bulletSpeed: number;
  readonly bulletDmg: number;
  readonly isLaser: boolean;
  readonly laserRange: number;
  readonly specialCooldown: number;
}

interface Point {
  readonly x: number;
  readonly y: number;
}

interface Ship {
  readonly id: number;
  readonly defId: ShipKind;
  x: number;
  y: number;
  angle: number;
  vx: number;
  vy: number;
  hp: number;
  readonly maxHp: number;
  energy: number;
  readonly maxEnergy: number;
  lastFire: number;
  lastSpecial: number;
  shieldHp: number;
  specialActive: boolean;
  specialTimer: number;
  alpha: number;
  hitFlash: number;
  laserTarget: Nullable<Point>;
}

interface Asteroid {
  readonly id: string;
  x: number;
  y: number;
  readonly size: number;
  vx: number;
  vy: number;
  rot: number;
  readonly rotSpd: number;
  hp: number;
  readonly maxHp: number;
  readonly pts: ReadonlyArray<readonly [number, number]>;
  readonly craters: ReadonlyArray<{ readonly ox: number; readonly oy: number; readonly r: number }>;
  readonly tone: string;
  readonly cracks: ReadonlyArray<readonly number[]>;
}

interface Bullet {
  readonly id: number;
  x: number;
  y: number;
  readonly vx: number;
  readonly vy: number;
  readonly dmg: number;
  readonly color: string;
  readonly owner: number;
  readonly isMine: boolean;
  life: number;
  readonly maxLife: number;
  readonly r: number;
}

// what the clients render: sounds, particles and hit numbers
interface GameEvent {
  readonly [detail: string]: unknown;
  readonly type: string;
}

interface Input {
  readonly left: boolean;
  readonly right: boolean;
  readonly thrust: boolean;
  readonly reverse: boolean;
  readonly fire: boolean;
  readonly special: boolean;
}

interface Player {
  readonly conn: Party.Connection;
  shipIndex: number;
  alive: boolean;
}

const TICK_MS = 16; // ~60 fps (faster server updates)
const GAME_TIME = 120;
const WW = 4800,
  WH = 4800;

let _bulletId = 0;
const nextId = (): number => ++_bulletId;

// Server-side physics only.
const DEFS = {
  scout: {
    speed: 4.2,
    maxSpeed: 6.5,
    hp: 70,
    turnSpeed: 0.075,
    mass: 1.0,
    radius: 18,
    fireRate: 180,
    bulletSpeed: 18,
    bulletDmg: 12,
    isLaser: false,
    laserRange: 0,
    specialCooldown: 5000,
  },
  tank: {
    speed: 1.8,
    maxSpeed: 3.5,
    hp: 160,
    turnSpeed: 0.04,
    mass: 4.0,
    radius: 24,
    fireRate: 800,
    bulletSpeed: 12,
    bulletDmg: 28,
    isLaser: false,
    laserRange: 0,
    specialCooldown: 8000,
  },
  sniper: {
    speed: 2.8,
    maxSpeed: 5.0,
    hp: 90,
    turnSpeed: 0.055,
    mass: 1.5,
    radius: 20,
    fireRate: 1200,
    bulletSpeed: 25,
    bulletDmg: 45,
    isLaser: false,
    laserRange: 0,
    specialCooldown: 6000,
  },
  bomber: {
    speed: 2.2,
    maxSpeed: 4.0,
    hp: 120,
    turnSpeed: 0.05,
    mass: 3.0,
    radius: 22,
    fireRate: 600,
    bulletSpeed: 8,
    bulletDmg: 18,
    isLaser: false,
    laserRange: 0,
    specialCooldown: 4000,
  },
  ghost: {
    speed: 5.0,
    maxSpeed: 8.0,
    hp: 60,
    turnSpeed: 0.09,
    mass: 0.7,
    radius: 16,
    fireRate: 350,
    bulletSpeed: 16,
    bulletDmg: 14,
    isLaser: false,
    laserRange: 0,
    specialCooldown: 7000,
  },
  orb: {
    speed: 3.0,
    maxSpeed: 5.0,
    hp: 100,
    turnSpeed: 0.12,
    mass: 1.8,
    radius: 19,
    fireRate: 80,
    bulletSpeed: 0,
    bulletDmg: 4,
    isLaser: true,
    laserRange: 90,
    specialCooldown: 6000,
  },
} satisfies Record<string, ShipDef>;

type ShipKind = keyof typeof DEFS;

const BULLET_COLORS = {
  scout: '#00ffcc',
  tank: '#ff8800',
  sniper: '#cc44ff',
  bomber: '#ffdd00',
  ghost: '#44ddff',
  orb: '#ff2200',
} satisfies Record<ShipKind, string>;

const isShipKind = (maybeKind: unknown): maybeKind is ShipKind => isString(maybeKind) && Object.hasOwn(DEFS, maybeKind);

const flag = (message: object, name: keyof Input): boolean => hasProperty(name, message) && message[name] === true;

const readInput = (message: object): Input => ({
  left: flag(message, 'left'),
  right: flag(message, 'right'),
  thrust: flag(message, 'thrust'),
  reverse: flag(message, 'reverse'),
  fire: flag(message, 'fire'),
  special: flag(message, 'special'),
});

const NO_INPUT = readInput({});

function makeShip(defId: ShipKind, x: number, y: number, angle: number, pi: number): Ship {
  const d = DEFS[defId];
  return {
    id: pi,
    defId,
    x,
    y,
    angle,
    vx: 0,
    vy: 0,
    hp: d.hp,
    maxHp: d.hp,
    energy: 100,
    maxEnergy: 100,
    lastFire: 0,
    lastSpecial: 0,
    shieldHp: 0,
    specialActive: false,
    specialTimer: 0,
    alpha: 1,
    hitFlash: 0,
    laserTarget: null,
  };
}

function hypot(dx: number, dy: number): number {
  return Math.sqrt(dx * dx + dy * dy);
}

function makeAsteroid(x: number, y: number, size: number): Asteroid {
  const n = 7 + Math.floor(Math.random() * 5);
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const a = ((Math.PI * 2) / n) * i + (Math.random() - 0.5) * 0.5;
    const r = size * (0.65 + Math.random() * 0.35);
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  const craters: Array<{ ox: number; oy: number; r: number }> = [];
  for (let i = 0, nc = 2 + Math.floor(size / 18); i < nc; i++)
    craters.push({
      ox: (Math.random() - 0.5) * size * 0.8,
      oy: (Math.random() - 0.5) * size * 0.8,
      r: size * 0.08 + Math.random() * size * 0.12,
    });
  const toneArr = ['#8866aa', '#446688', '#776655'];
  const tone = toneArr[Math.random() < 0.25 ? 0 : Math.random() < 0.4 ? 1 : 2];
  const cracks: number[][] = [];
  for (let i = 0, nc = 4 + Math.floor(Math.random() * 4); i < nc; i++) {
    const ca = Math.random() * Math.PI * 2,
      cr = size * (0.2 + Math.random() * 0.5);
    const cx = Math.cos(ca + 0.3) * size * 0.3,
      cy = Math.sin(ca + 0.3) * size * 0.3;
    cracks.push([
      cx,
      cy,
      Math.cos(ca) * cr,
      Math.sin(ca) * cr,
      Math.cos(ca + 1.1) * cr * 0.4,
      Math.sin(ca + 1.1) * cr * 0.4,
    ]);
  }
  return {
    id: Math.random().toString(36).slice(2),
    x,
    y,
    size,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    rot: Math.random() * Math.PI * 2,
    rotSpd: (Math.random() - 0.5) * 0.009,
    hp: size * 2.5,
    maxHp: size * 2.5,
    pts,
    craters,
    tone,
    cracks,
  };
}

function genAsteroids(): Asteroid[] {
  const list: Asteroid[] = [];
  // clustered
  for (let i = 0; i < 6; i++) {
    const cx = 200 + Math.random() * (WW - 400),
      cy = 200 + Math.random() * (WH - 400);
    for (let j = 0, n = 3 + Math.floor(Math.random() * 5); j < n; j++) {
      const x = cx + (Math.random() - 0.5) * 350,
        y = cy + (Math.random() - 0.5) * 350;
      if (hypot(x - WW * 0.25, y - WH * 0.5) < 200 || hypot(x - WW * 0.75, y - WH * 0.5) < 200) continue;
      list.push(makeAsteroid(x, y, 20 + Math.random() * 55));
    }
  }
  // scattered
  for (let i = 0; i < 18; i++) {
    const x = Math.random() * WW,
      y = Math.random() * WH;
    if (hypot(x - WW * 0.25, y - WH * 0.5) < 220 || hypot(x - WW * 0.75, y - WH * 0.5) < 220) continue;
    list.push(makeAsteroid(x, y, 15 + Math.random() * 38));
  }
  return list;
}

export default class SpaceBattleServer implements Party.Server {
  // by connection id
  private readonly players = new Map<string, Player>();
  private readonly inputs = new Map<string, Input>();
  private ships: Ship[] = [];
  private bullets: Bullet[] = [];
  private asteroids: Asteroid[] = [];
  private events: GameEvent[] = [];
  private time = GAME_TIME;
  private tick = 0;
  private lastTimer = 0;
  private gameStarted = false;

  constructor(private readonly party: Party.Room) {}

  public onConnect(conn: Party.Connection): void {
    this.players.set(conn.id, {
      conn,
      shipIndex: -1,
      alive: false,
    });

    conn.send(JSON.stringify({
      type: 'lobby',
      playersInGame: this.ships.length
    }));

    if (this.gameStarted && this.asteroids.length > 0) {
      conn.send(JSON.stringify({
        type: 'asteroids',
        asteroids: this.asteroids,
      }));
    }
  }

  public onMessage(msg: string | ArrayBuffer | ArrayBufferView, conn: Party.Connection): void {
    let data: unknown;
    try {
      data = isString(msg) ? JSON.parse(msg) : null;
    } catch {
      return;
    }
    const player = this.players.get(conn.id);
    if (!player || !hasProperty('type', data)) return;

    if (data.type === 'selectShip' && hasProperty('shipId', data) && isShipKind(data.shipId)) {
      this.spawnPlayer(conn.id, data.shipId);
    } else if (data.type === 'input') {
      this.inputs.set(conn.id, readInput(data));
    }
  }

  public onClose(conn: Party.Connection): void {
    const player = this.players.get(conn.id);

    if (player && player.shipIndex >= 0 && this.ships[player.shipIndex]) {
      this.ships[player.shipIndex].hp = 0;
    }

    this.players.delete(conn.id);
    this.inputs.delete(conn.id);
  }

  public async onAlarm(): Promise<void> {
    if (!this.gameStarted) return;

    this.events = [];
    this.tick++;

    const now = Date.now();
    if (now - this.lastTimer >= 1000) {
      this.time--;
      this.lastTimer = now;
    }

    for (const [connId, player] of this.players) {
      if (player.shipIndex >= 0 && this.ships[player.shipIndex]) {
        const input = this.inputs.get(connId) ?? NO_INPUT;
        this.updateShip(this.ships[player.shipIndex], input, now);
      }
    }

    this.checkAllShipCollisions();
    this.updateBullets();
    this.updateAsteroids();

    for (let i = this.ships.length - 1; i >= 0; i--) {
      if (this.ships[i].hp <= 0) {
        for (const player of this.players.values()) {
          if (player.shipIndex === i) {
            player.alive = false;
            player.conn.send(JSON.stringify({ type: 'returnToLobby' }));
            // Removing ship i shifts the indices after it.
            for (const p of this.players.values()) {
              if (p.shipIndex > i) p.shipIndex--;
            }
            break;
          }
        }
        this.ships.splice(i, 1);
      }
    }

    const stateMsg = {
      type: 'gameState',
      tick: this.tick,
      time: this.time,
      ships: this.ships.map((s) => ({
        id: s.id,
        defId: s.defId,
        x: s.x,
        y: s.y,
        angle: s.angle,
        vx: s.vx,
        vy: s.vy,
        hp: s.hp,
        maxHp: s.maxHp,
        energy: s.energy,
        maxEnergy: s.maxEnergy,
        shieldHp: s.shieldHp,
        specialActive: s.specialActive,
        alpha: s.alpha,
        hitFlash: s.hitFlash,
        laserTarget: s.laserTarget,
      })),
      bullets: this.bullets.map((b) => ({
        id: b.id,
        x: b.x,
        y: b.y,
        vx: b.vx,
        vy: b.vy,
        r: b.r,
        owner: b.owner,
        isMine: b.isMine,
        life: b.life,
        maxLife: b.maxLife,
        color: b.color,
      })),
      asteroids: this.asteroids.map((a) => ({
        id: a.id,
        x: a.x,
        y: a.y,
        rot: a.rot,
        hp: a.hp,
        maxHp: a.maxHp,
      })),
      events: this.events,
    };

    for (const player of this.players.values()) {
      if (player.alive) {
        player.conn.send(JSON.stringify(stateMsg));
      }
    }

    await this.party.storage.setAlarm(Date.now() + TICK_MS);
  }

  private spawnPlayer(connId: string, shipId: ShipKind): void {
    const player = this.players.get(connId);
    if (!player) return;

    if (!this.gameStarted) {
      this.gameStarted = true;
      this.asteroids = genAsteroids();
      this.bullets = [];
      this.events = [];
      this.time = GAME_TIME;
      this.tick = 0;
      this.lastTimer = Date.now();
      this.party.storage.setAlarm(Date.now() + TICK_MS);
    }

    let x = 0;
    let y = 0;
    for (let attempt = 0; attempt < 20; attempt++) {
      x = 400 + Math.random() * (WW - 800);
      y = 400 + Math.random() * (WH - 800);
      let safe = true;
      for (const ast of this.asteroids) {
        if (hypot(x - ast.x, y - ast.y) < ast.size + 150) {
          safe = false;
          break;
        }
      }
      if (safe) break;
    }

    const shipIndex = this.ships.length;
    const newShip = makeShip(shipId, x, y, Math.random() * Math.PI * 2, shipIndex);
    this.ships.push(newShip);

    player.shipIndex = shipIndex;
    player.alive = true;

    player.conn.send(JSON.stringify({
      type: 'gameStart',
      playerIdx: shipIndex,
      asteroids: this.asteroids,
    }));

    console.log(`Player spawned: ${connId} as ship ${shipIndex}`);
  }

  private updateShip(ship: Ship, inp: Input, now: number): void {
    const d = DEFS[ship.defId];

    if (inp.left) ship.angle -= d.turnSpeed;
    if (inp.right) ship.angle += d.turnSpeed;

    if (inp.thrust) {
      ship.vx += Math.cos(ship.angle) * d.speed * 0.06;
      ship.vy += Math.sin(ship.angle) * d.speed * 0.06;
      this.events.push({ type: 'thrust', shipId: ship.id, x: ship.x, y: ship.y, angle: ship.angle });
    }
    if (inp.reverse) {
      ship.vx -= Math.cos(ship.angle) * d.speed * 0.036;
      ship.vy -= Math.sin(ship.angle) * d.speed * 0.036;
      this.events.push({ type: 'retro', shipId: ship.id, x: ship.x, y: ship.y, angle: ship.angle });
    }

    ship.vx *= 0.978;
    ship.vy *= 0.978;
    const spd = hypot(ship.vx, ship.vy);
    if (spd > d.maxSpeed) {
      ship.vx = (ship.vx / spd) * d.maxSpeed;
      ship.vy = (ship.vy / spd) * d.maxSpeed;
    }

    ship.x += ship.vx;
    ship.y += ship.vy;
    if (ship.x < -40) ship.x = WW + 40;
    if (ship.x > WW + 40) ship.x = -40;
    if (ship.y < -40) ship.y = WH + 40;
    if (ship.y > WH + 40) ship.y = -40;

    if (inp.fire && ship.hp > 0) this.fireWeapon(ship, d, now);
    if (inp.special && ship.hp > 0) this.activateSpecial(ship, d, now);

    ship.energy = Math.min(ship.maxEnergy, ship.energy + 0.08);
    if (ship.specialActive) {
      ship.specialTimer -= TICK_MS;
      if (ship.specialTimer <= 0) {
        ship.specialActive = false;
        ship.alpha = 1;
        ship.shieldHp = 0;
      }
    }
    if (ship.hitFlash > 0) ship.hitFlash--;
    ship.laserTarget = null;
  }

  private fireWeapon(ship: Ship, d: ShipDef, now: number): void {
    if (now - ship.lastFire < d.fireRate) return;
    if (ship.energy < 5) return;
    ship.lastFire = now;
    ship.energy -= 5;

    if (d.isLaser) {
      let closest: Nullable<Ship> = null;
      let minDist = d.laserRange;
      for (const en of this.ships) {
        if (en.id === ship.id || en.hp <= 0) continue;
        const dist = hypot(en.x - ship.x, en.y - ship.y);
        if (dist < minDist) {
          minDist = dist;
          closest = en;
        }
      }

      if (closest) {
        let dmg = d.bulletDmg;
        if (closest.shieldHp > 0) {
          closest.shieldHp -= dmg;
          dmg = 0;
          if (closest.shieldHp < 0) {
            dmg = -closest.shieldHp;
            closest.shieldHp = 0;
          }
        }
        closest.hp -= dmg;
        closest.hitFlash = 3;
        ship.laserTarget = { x: closest.x, y: closest.y };
        this.events.push({ type: 'laser', shipId: ship.id, targetId: closest.id, dmg, x: closest.x, y: closest.y });
      }
      return;
    }

    this.events.push({ type: 'fire', shipId: ship.id });
    const color = BULLET_COLORS[ship.defId];
    this.bullets.push({
      id: nextId(),
      x: ship.x + Math.cos(ship.angle) * 24,
      y: ship.y + Math.sin(ship.angle) * 24,
      vx: Math.cos(ship.angle) * d.bulletSpeed + ship.vx * 0.3,
      vy: Math.sin(ship.angle) * d.bulletSpeed + ship.vy * 0.3,
      dmg: d.bulletDmg,
      color,
      owner: ship.id,
      isMine: false,
      life: 180,
      maxLife: 180,
      r: 3,
    });
    ship.vx -= Math.cos(ship.angle) * 0.22;
    ship.vy -= Math.sin(ship.angle) * 0.22;
  }

  private activateSpecial(ship: Ship, d: ShipDef, now: number): void {
    if (now - ship.lastSpecial < d.specialCooldown) return;
    if (ship.energy < 30) return;
    ship.lastSpecial = now;
    ship.energy -= 30;

    switch (ship.defId) {
      case 'scout':
        ship.vx += Math.cos(ship.angle) * 9;
        ship.vy += Math.sin(ship.angle) * 9;
        this.events.push({ type: 'dash', shipId: ship.id, x: ship.x, y: ship.y });
        break;
      case 'tank':
        ship.shieldHp = 60;
        ship.specialActive = true;
        ship.specialTimer = 3000;
        this.events.push({ type: 'shield', shipId: ship.id });
        break;
      case 'sniper':
        this.bullets.push({
          id: nextId(),
          x: ship.x + Math.cos(ship.angle) * 30,
          y: ship.y + Math.sin(ship.angle) * 30,
          vx: Math.cos(ship.angle) * 20 + ship.vx,
          vy: Math.sin(ship.angle) * 20 + ship.vy,
          dmg: 80,
          color: '#cc44ff',
          owner: ship.id,
          isMine: false,
          life: 180,
          maxLife: 180,
          r: 6,
        });
        this.events.push({ type: 'sniperFire', shipId: ship.id });
        break;
      case 'bomber':
        this.bullets.push({
          id: nextId(),
          x: ship.x,
          y: ship.y,
          vx: 0,
          vy: 0,
          dmg: 40,
          color: '#ffdd00',
          owner: ship.id,
          isMine: true,
          life: 300,
          maxLife: 300,
          r: 8,
        });
        this.events.push({ type: 'mine', shipId: ship.id, x: ship.x, y: ship.y });
        break;
      case 'ghost':
        ship.alpha = 0.18;
        ship.specialActive = true;
        ship.specialTimer = 3000;
        this.events.push({ type: 'cloak', shipId: ship.id });
        break;
      case 'orb':
        for (let k = 0; k < 12; k++) {
          const a = ((Math.PI * 2) / 12) * k;
          this.bullets.push({
            id: nextId(),
            x: ship.x,
            y: ship.y,
            vx: Math.cos(a) * 7,
            vy: Math.sin(a) * 7,
            dmg: 20,
            color: '#ff6600',
            owner: ship.id,
            isMine: false,
            life: 45,
            maxLife: 45,
            r: 4,
          });
        }
        this.events.push({ type: 'nova', shipId: ship.id, x: ship.x, y: ship.y });
        break;
    }
  }

  private checkAllShipCollisions(): void {
    for (let i = 0; i < this.ships.length; i++) {
      for (let j = i + 1; j < this.ships.length; j++) {
        this.checkShipCollision(this.ships[i], this.ships[j]);
      }
    }
  }

  private checkShipCollision(a: Ship, b: Ship): void {
    if (a.hp <= 0 || b.hp <= 0) return;
    const dx = b.x - a.x,
      dy = b.y - a.y,
      dist = hypot(dx, dy);
    const da = DEFS[a.defId],
      db = DEFS[b.defId];
    const minD = da.radius + db.radius;
    if (dist >= minD || dist < 0.01) return;
    const ov = minD - dist,
      nx = dx / dist,
      ny = dy / dist,
      tm = da.mass + db.mass;
    a.x -= nx * ov * (db.mass / tm);
    a.y -= ny * ov * (db.mass / tm);
    b.x += nx * ov * (da.mass / tm);
    b.y += ny * ov * (da.mass / tm);
    const dvn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
    if (dvn > 0) return;
    const e = 0.55,
      j2 = (-(1 + e) * dvn) / (1 / da.mass + 1 / db.mass);
    a.vx -= (j2 * nx) / da.mass;
    a.vy -= (j2 * ny) / da.mass;
    b.vx += (j2 * nx) / db.mass;
    b.vy += (j2 * ny) / db.mass;
    const imp = Math.abs(dvn);
    if (imp > 0.7) {
      const dmg = imp * 3;
      a.hp -= dmg;
      b.hp -= dmg;
      a.hitFlash = 8;
      b.hitFlash = 8;
      this.events.push({ type: 'collision', x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    }
  }

  private updateBullets(): void {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      if (!b.isMine) {
        b.x += b.vx;
        b.y += b.vy;
      }
      b.life--;
      if (!b.isMine) {
        if (b.x < -28) b.x = WW + 28;
        if (b.x > WW + 28) b.x = -28;
        if (b.y < -28) b.y = WH + 28;
        if (b.y > WH + 28) b.y = -28;
      }
      if (b.life <= 0) {
        this.bullets.splice(i, 1);
        continue;
      }

      let hit = false;
      for (const ship of this.ships) {
        if (ship.id === b.owner || ship.hp <= 0) continue;
        if (ship.defId === 'ghost' && ship.specialActive) continue;
        if (hypot(ship.x - b.x, ship.y - b.y) < DEFS[ship.defId].radius + b.r - 4) {
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
          this.events.push({
            type: b.isMine ? 'mineHit' : 'bulletHit',
            x: b.x,
            y: b.y,
            targetId: ship.id,
            dmg,
            isMine: b.isMine,
            color: b.color,
          });
          if (ship.hp <= 0) this.events.push({ type: 'destroyed', shipId: ship.id, x: ship.x, y: ship.y });
          this.bullets.splice(i, 1);
          hit = true;
          break;
        }
      }
      if (hit) continue;

      for (let ai = this.asteroids.length - 1; ai >= 0; ai--) {
        const ast = this.asteroids[ai];
        if (hypot(b.x - ast.x, b.y - ast.y) < ast.size + b.r) {
          ast.hp -= b.dmg * 0.55;
          this.events.push({ type: 'asteroidHit', astId: ast.id, x: b.x, y: b.y });
          if (ast.hp <= 0) {
            this.events.push({ type: 'asteroidBoom', x: ast.x, y: ast.y, size: ast.size });
            this.splitAsteroid(ai, b.vx, b.vy);
          }
          this.bullets.splice(i, 1);
          hit = true;
          break;
        }
      }
    }
  }

  private splitAsteroid(idx: number, dvx: number, dvy: number): void {
    const ast = this.asteroids[idx];
    const children = ast.size > 40 ? 3 : ast.size > 22 ? 2 : 0;
    const newKids: Asteroid[] = [];
    for (let k = 0; k < children; k++) {
      const angle = ((Math.PI * 2) / children) * k + Math.random() * 0.8;
      const child = makeAsteroid(
        ast.x + Math.cos(angle) * ast.size * 0.28,
        ast.y + Math.sin(angle) * ast.size * 0.28,
        ast.size * 0.45
      );
      child.vx = ast.vx + Math.cos(angle) * (1.2 + Math.random() * 1.5) + (dvx || 0) * 0.2;
      child.vy = ast.vy + Math.sin(angle) * (1.2 + Math.random() * 1.5) + (dvy || 0) * 0.2;
      newKids.push(child);
    }
    this.asteroids.splice(idx, 1);
    for (const c of newKids) {
      this.asteroids.push(c);
      // tell clients about new child asteroid (with full geometry)
      this.events.push({
        type: 'asteroidSpawn',
        asteroid: c,
      });
    }
  }

  private updateAsteroids(): void {
    for (const a of this.asteroids) {
      a.x += a.vx;
      a.y += a.vy;
      a.rot += a.rotSpd;
      if (a.x < -100) a.x = WW + 100;
      if (a.x > WW + 100) a.x = -100;
      if (a.y < -100) a.y = WH + 100;
      if (a.y > WH + 100) a.y = -100;
    }
    // ship-asteroid collisions (simplified, server-side)
    for (const ship of this.ships) {
      if (ship.hp <= 0) continue;
      const ds = DEFS[ship.defId];
      for (const ast of this.asteroids) {
        const dist = hypot(ship.x - ast.x, ship.y - ast.y);
        const minD = ds.radius + ast.size;
        if (dist < minD && dist > 0.1) {
          const nx = (ship.x - ast.x) / dist,
            ny = (ship.y - ast.y) / dist,
            ov = minD - dist;
          ship.x += nx * ov * 0.8;
          ship.y += ny * ov * 0.8;
          ast.x -= nx * ov * 0.2;
          ast.y -= ny * ov * 0.2;
          const dvn = (ship.vx - ast.vx) * nx + (ship.vy - ast.vy) * ny;
          if (dvn < 0) {
            const imp = Math.abs(dvn);
            const massB = Math.max(1, ast.size * 0.08);
            const jj = (-(1 + 0.45) * dvn) / (1 / ds.mass + 1 / massB);
            ship.vx += (jj * nx) / ds.mass;
            ship.vy += (jj * ny) / ds.mass;
            ast.vx -= (jj * nx) / massB;
            ast.vy -= (jj * ny) / massB;
            const aspd = hypot(ast.vx, ast.vy);
            if (aspd > 4) {
              ast.vx = (ast.vx / aspd) * 4;
              ast.vy = (ast.vy / aspd) * 4;
            }
            const dmg = imp * ast.size * 0.1;
            if (dmg > 0.8) {
              ship.hp -= dmg;
              ship.hitFlash = 6;
              this.events.push({ type: 'collision', x: (ship.x + ast.x) / 2, y: (ship.y + ast.y) / 2 });
            }
          }
        }
      }
    }
  }

}
