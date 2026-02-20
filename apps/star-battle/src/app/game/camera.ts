import { WW, WH } from './constants';

import type { Camera } from './types';

export const cam: Camera = { x: WW / 2, y: WH / 2, zoom: 0.9 };

export function wx(x: number, W: number) {
  return (x - cam.x) * cam.zoom + W / 2;
}

export function wy(y: number, H: number) {
  return (y - cam.y) * cam.zoom + H / 2;
}

export function updateCamera(aliveShips: any[], W: number, H: number) {
  if (!aliveShips.length) return;
  let mx = 0,
    my = 0;
  for (let i = 0; i < aliveShips.length; i++) {
    mx += aliveShips[i].x;
    my += aliveShips[i].y;
  }
  mx /= aliveShips.length;
  my /= aliveShips.length;
  cam.x += (mx - cam.x) * 0.06;
  cam.y += (my - cam.y) * 0.06;

  if (aliveShips.length === 2) {
    const ddx = aliveShips[0].x - aliveShips[1].x,
      ddy = aliveShips[0].y - aliveShips[1].y;
    const dd = Math.sqrt(ddx * ddx + ddy * ddy);
    const tz = Math.max(0.38, Math.min(1.1, Math.min(W, H) * 0.6 / Math.max(dd, 200)));
    cam.zoom += (tz - cam.zoom) * 0.04;
  }
}
