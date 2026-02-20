import { WW, WH } from '../constants';

export function drawMinimap(ctx: CanvasRenderingContext2D, W: number, H: number, asteroids: any[], comets: any[], game: any) {
  const mw = 110,
    mh = 110;
  const mx = Math.floor(W / 2 - mw / 2);
  const my = 72; // below the timer HUD row
  ctx.save();
  ctx.fillStyle = 'rgba(0,5,20,0.7)';
  ctx.fillRect(mx, my, mw, mh);
  ctx.strokeStyle = 'rgba(60,100,180,0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(mx, my, mw, mh);

  ctx.fillStyle = '#665544';
  for (let i = 0; i < asteroids.length; i++) {
    const ast = asteroids[i];
    ctx.beginPath();
    ctx.arc(mx + (ast.x / WW) * mw, my + (ast.y / WH) * mh, Math.max(1, ast.size / 30), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#aaddff';
  for (let i = 0; i < comets.length; i++) {
    ctx.beginPath();
    ctx.arc(mx + (comets[i].x / WW) * mw, my + (comets[i].y / WH) * mh, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  if (game) {
    for (let i = 0; i < game.p.length; i++) {
      const s = game.p[i];
      if (!s.alive()) continue;
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(mx + (s.x / WW) * mw, my + (s.y / WH) * mh, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
