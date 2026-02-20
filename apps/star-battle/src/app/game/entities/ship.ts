import { WW, WH } from '../constants';
import { drawScout, drawTank, drawSniper, drawBomber, drawGhost, drawOrb } from '../rendering/ship-draw';

import type { ShipDef } from '../types';

export const SHIP_DEFS: ShipDef[] = [
  {
    id: 'scout',
    name: 'SCOUT',
    stats: `SPD ████░\nHP  ██░░░\nDMG ███░░\nMASS light`,
    speed: 4.2,
    maxSpeed: 6.5,
    hp: 70,
    turnSpeed: 0.075,
    mass: 1.0,
    radius: 18,
    fireRate: 180,
    bulletSpeed: 9,
    bulletDmg: 12,
    bulletColor: '#00ffcc',
    specialName: 'DASH',
    specialCooldown: 5000,
    color: '#00ffcc',
    draw: (ct, x, y, a, col, sc, d) => {
      ct.save();
      ct.translate(x, y);
      ct.rotate(a);
      ct.scale(sc, sc);
      drawScout(ct, col, d);
      ct.restore();
    },
  },
  {
    id: 'tank',
    name: 'TANK',
    stats: `SPD ██░░░\nHP  █████\nDMG ████░\nMASS heavy`,
    speed: 1.8,
    maxSpeed: 3.5,
    hp: 160,
    turnSpeed: 0.04,
    mass: 4.0,
    radius: 24,
    fireRate: 800,
    bulletSpeed: 6,
    bulletDmg: 28,
    bulletColor: '#ff8800',
    specialName: 'SHIELD',
    specialCooldown: 8000,
    color: '#ff8800',
    draw: (ct, x, y, a, col, sc, d) => {
      ct.save();
      ct.translate(x, y);
      ct.rotate(a);
      ct.scale(sc, sc);
      drawTank(ct, col, d);
      ct.restore();
    },
  },
  {
    id: 'sniper',
    name: 'SNIPER',
    stats: `SPD ███░░\nHP  ███░░\nDMG █████\nMASS mid`,
    speed: 2.8,
    maxSpeed: 5.0,
    hp: 90,
    turnSpeed: 0.055,
    mass: 1.5,
    radius: 20,
    fireRate: 1200,
    bulletSpeed: 15,
    bulletDmg: 45,
    bulletColor: '#cc44ff',
    specialName: 'SCOPE',
    specialCooldown: 6000,
    color: '#cc44ff',
    draw: (ct, x, y, a, col, sc, d) => {
      ct.save();
      ct.translate(x, y);
      ct.rotate(a);
      ct.scale(sc, sc);
      drawSniper(ct, col, d);
      ct.restore();
    },
  },
  {
    id: 'bomber',
    name: 'BOMBER',
    stats: `SPD ██░░░\nHP  ████░\nDMG ███░░\nMASS heavy`,
    speed: 2.2,
    maxSpeed: 4.0,
    hp: 120,
    turnSpeed: 0.05,
    mass: 3.0,
    radius: 22,
    fireRate: 600,
    bulletSpeed: 4,
    bulletDmg: 18,
    bulletColor: '#ffdd00',
    specialName: 'MINE',
    specialCooldown: 4000,
    color: '#ffdd00',
    draw: (ct, x, y, a, col, sc, d) => {
      ct.save();
      ct.translate(x, y);
      ct.rotate(a);
      ct.scale(sc, sc);
      drawBomber(ct, col, d);
      ct.restore();
    },
  },
  {
    id: 'ghost',
    name: 'GHOST',
    stats: `SPD █████\nHP  ██░░░\nDMG ███░░\nMASS feather`,
    speed: 5.0,
    maxSpeed: 8.0,
    hp: 60,
    turnSpeed: 0.09,
    mass: 0.7,
    radius: 16,
    fireRate: 350,
    bulletSpeed: 8,
    bulletDmg: 14,
    bulletColor: '#44ddff',
    specialName: 'CLOAK',
    specialCooldown: 7000,
    color: '#44ddff',
    draw: (ct, x, y, a, col, sc, d) => {
      ct.save();
      ct.translate(x, y);
      ct.rotate(a);
      ct.scale(sc, sc);
      drawGhost(ct, col, d);
      ct.restore();
    },
  },
  {
    id: 'orb',
    name: 'ORB',
    stats: `SPD ███░░\nHP  ███░░\nDMG █████\nMASS mid`,
    speed: 3.0,
    maxSpeed: 5.0,
    hp: 100,
    turnSpeed: 0.12,
    mass: 1.8,
    radius: 19,
    fireRate: 80,
    bulletSpeed: 0,
    bulletDmg: 4,
    bulletColor: '#ff2200',
    specialName: 'NOVA',
    specialCooldown: 6000,
    color: '#ff6600',
    isLaser: true,
    laserRange: 90,
    draw: (ct, x, y, a, col, sc, d) => {
      ct.save();
      ct.translate(x, y);
      ct.rotate(a);
      ct.scale(sc, sc);
      drawOrb(ct, col, d);
      ct.restore();
    },
  },
];

export class Ship {
  public vx = 0;
  public vy = 0;
  public hp: number;
  public maxHp: number;
  public energy = 100;
  public maxEnergy = 100;
  public lastFire = 0;
  public lastSpecial = 0;
  public color: string;
  public specialActive = false;
  public specialTimer = 0;
  public alpha = 1;
  public shieldHp = 0;
  public hitFlash = 0;
  public laserTarget: { x: number; y: number } | null = null;
  public collideFlash = 0;

  constructor(
    public def: ShipDef,
    public x: number,
    public y: number,
    public angle: number,
    public playerIdx: number
  ) {
    this.hp = def.hp;
    this.maxHp = def.hp;
    this.color = playerIdx === 0 ? '#00ffcc' : '#ff4466';
  }

  alive() {
    return this.hp > 0;
  }

  dmg() {
    return Math.max(0, Math.min(1, 1 - this.hp / this.maxHp));
  }

  updatePosition() {
    this.vx *= 0.978;
    this.vy *= 0.978;
    const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (spd > this.def.maxSpeed) {
      this.vx = (this.vx / spd) * this.def.maxSpeed;
      this.vy = (this.vy / spd) * this.def.maxSpeed;
    }
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < -40) this.x = WW + 40;
    if (this.x > WW + 40) this.x = -40;
    if (this.y < -40) this.y = WH + 40;
    if (this.y > WH + 40) this.y = -40;
  }
}
