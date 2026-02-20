import { Asteroid } from './entities/asteroid';
import { Bullet } from './entities/bullet';
import { Comet } from './entities/comet';
import { Debris } from './entities/debris';
import { Particle } from './entities/particle';

import type { Ship } from './entities/ship';

export interface Vector2 {
  x: number;
  y: number;
}

export interface Camera extends Vector2 {
  zoom: number;
}

export interface ShipDef {
  id: string;
  name: string;
  stats: string;
  speed: number;
  maxSpeed: number;
  hp: number;
  turnSpeed: number;
  mass: number;
  radius: number;
  fireRate: number;
  bulletSpeed: number;
  bulletDmg: number;
  bulletColor: string;
  specialName: string;
  specialCooldown: number;
  color: string;
  isLaser?: boolean;
  laserRange?: number;
  draw: (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string, scale: number, damage: number) => void;
}

export interface GameState {
  p: Ship[];
  time: number;
  over: boolean;
}
