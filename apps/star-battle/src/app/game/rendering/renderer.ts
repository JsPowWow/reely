import { wx, wy } from '../camera';
import { WW, WH } from '../constants';

export function drawWorldBorder(ctx: CanvasRenderingContext2D, cam: any) {
  ctx.save();
  ctx.strokeStyle = 'rgba(80,120,200,0.25)';
  ctx.lineWidth = 3 * cam.zoom;
  ctx.setLineDash([20 * cam.zoom, 15 * cam.zoom]);
  ctx.shadowColor = '#4488ff';
  ctx.shadowBlur = 8;
  ctx.strokeRect(wx(0, ctx.canvas.width), wy(0, ctx.canvas.height), WW * cam.zoom, WH * cam.zoom);
  ctx.setLineDash([]);
  ctx.restore();
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: any[], cam: any) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const a = p.life / p.maxLife;
    ctx.save();
    ctx.globalAlpha = a * 0.88;
    ctx.beginPath();
    ctx.arc(wx(p.x, W), wy(p.y, H), p.r * Math.max(0.05, a) * cam.zoom, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    if (p.color !== '#444444') {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 5;
    }
    ctx.fill();
    ctx.restore();
  }
}

export function drawBullets(ctx: CanvasRenderingContext2D, bullets: any[], cam: any) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  for (let i = 0; i < bullets.length; i++) {
    const b = bullets[i];
    ctx.save();
    ctx.globalAlpha = b.isMine ? 0.5 + 0.5 * Math.sin(Date.now() / 170) : b.life / b.maxLife;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = b.isMine ? 24 : 12;
    ctx.beginPath();
    ctx.arc(wx(b.x, W), wy(b.y, H), b.r * cam.zoom, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.fill();
    ctx.restore();
  }
}

export function drawShip(ctx: CanvasRenderingContext2D, ship: any, cam: any) {
  if (!ship.alive()) return;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.save();
  ctx.globalAlpha = ship.alpha * (ship.hitFlash % 2 === 1 ? 0.2 : 1);
  ship.def.draw(ctx, wx(ship.x, W), wy(ship.y, H), ship.angle, ship.color, cam.zoom, ship.dmg());

  // laser
  if (ship.def.isLaser && ship.laserTarget) {
    const t2 = ship.laserTarget,
      pulse = 0.5 + 0.5 * Math.sin(Date.now() / 32);
    ctx.globalAlpha = ship.alpha * pulse;
    ctx.beginPath();
    ctx.moveTo(wx(ship.x, W), wy(ship.y, H));
    ctx.lineTo(wx(t2.x, W), wy(t2.y, H));
    ctx.strokeStyle = 'rgba(255,68,0,0.33)';
    ctx.lineWidth = (8 + pulse * 5) * cam.zoom;
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 22;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wx(ship.x, W), wy(ship.y, H));
    ctx.lineTo(wx(t2.x, W), wy(t2.y, H));
    ctx.strokeStyle = '#ff5500';
    ctx.lineWidth = 3 * cam.zoom;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.globalAlpha = ship.alpha;
  }

  // shield
  if (ship.shieldHp > 0) {
    const sf = ship.shieldHp / 60;
    ctx.globalAlpha = sf * 0.55;
    const shr = ship.def.radius + 12;
    const shg = ctx.createRadialGradient(wx(ship.x, W), wy(ship.y, H), shr * 0.4 * cam.zoom, wx(ship.x, W), wy(ship.y, H), (shr + 5) * cam.zoom);
    shg.addColorStop(0, 'rgba(0,0,0,0)');
    shg.addColorStop(0.7, 'rgba(68,136,255,0.2)');
    shg.addColorStop(1, 'rgba(136,187,255,0.8)');
    ctx.fillStyle = shg;
    ctx.beginPath();
    ctx.arc(wx(ship.x, W), wy(ship.y, H), shr * cam.zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#88bbff';
    ctx.lineWidth = 2 * cam.zoom;
    ctx.shadowColor = '#88bbff';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(wx(ship.x, W), wy(ship.y, H), shr * cam.zoom, 0, Math.PI * 2);
    ctx.stroke();
  }

  // collide flash
  if (ship.collideFlash > 0) {
    ctx.globalAlpha = (ship.collideFlash / 10) * 0.8;
    ctx.strokeStyle = '#ffaa44';
    ctx.lineWidth = 2.5 * cam.zoom;
    ctx.shadowColor = '#ffaa44';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(wx(ship.x, W), wy(ship.y, H), (ship.def.radius + 8) * cam.zoom, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  if (ship.def.isLaser) ship.laserTarget = null;
}
