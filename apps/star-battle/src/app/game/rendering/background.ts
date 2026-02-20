import { wx, wy } from '../camera';
import { WW, WH } from '../constants';

const starLayers = [
  { count: 350, rMin: 0.3, rMax: 0.9, alpha: 0.3, parallax: 0.04, stars: [] as any[] },
  { count: 200, rMin: 0.5, rMax: 1.4, alpha: 0.5, parallax: 0.12, stars: [] as any[] },
  { count: 100, rMin: 0.8, rMax: 2.0, alpha: 0.7, parallax: 0.28, stars: [] as any[] },
  { count: 35, rMin: 1.2, rMax: 2.6, alpha: 0.9, parallax: 0.55, stars: [] as any[] },
];
let nebulas: any[] = [];
let dustClouds: any[] = [];

export function buildStars() {
  const skyW = WW * 3,
    skyH = WH * 3;
  for (let i = 0; i < starLayers.length; i++) {
    const l = starLayers[i];
    l.stars = [];
    for (let j = 0; j < l.count; j++) {
      l.stars.push({
        x: (Math.random() - 0.5) * skyW,
        y: (Math.random() - 0.5) * skyH,
        r: l.rMin + Math.random() * (l.rMax - l.rMin),
        a: l.alpha * (0.5 + Math.random() * 0.5),
        tw: Math.random() * Math.PI * 2,
        p: l.parallax,
      });
    }
  }
  nebulas = [];
  const nc = [
    [18, 0, 70],
    [0, 20, 65],
    [55, 0, 55],
    [0, 45, 35],
    [75, 18, 0],
  ];
  for (let i = 0; i < 8; i++) {
    const col = nc[i % nc.length];
    nebulas.push({
      x: Math.random() * WW,
      y: Math.random() * WH,
      rx: 280 + Math.random() * 500,
      ry: 180 + Math.random() * 380,
      col: col,
      alpha: 0.07 + Math.random() * 0.1,
    });
  }
  dustClouds = [];
  for (let i = 0; i < 12; i++) {
    dustClouds.push({
      x: Math.random() * WW,
      y: Math.random() * WH,
      r: 90 + Math.random() * 180,
      alpha: 0.04 + Math.random() * 0.05,
      warm: Math.random() < 0.5,
    });
  }
}

export function drawBackground(ctx: CanvasRenderingContext2D, W: number, H: number, cam: any) {
  ctx.fillStyle = '#030410';
  ctx.fillRect(0, 0, W, H);

  // nebulas
  for (let i = 0; i < nebulas.length; i++) {
    const nb = nebulas[i],
      p = 0.02;
    const sx = wx(nb.x * p + (1 - p) * WW / 2, W);
    const sy = wy(nb.y * p + (1 - p) * WH / 2, H);
    const rg = ctx.createRadialGradient(sx, sy, 10, sx, sy, nb.rx * cam.zoom);
    rg.addColorStop(0, `rgba(${nb.col[0]},${nb.col[1]},${nb.col[2]},${nb.alpha * 1.8})`);
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
  }

  // dust
  for (let i = 0; i < dustClouds.length; i++) {
    const dc = dustClouds[i],
      p = 0.05;
    const sx = wx(dc.x * p + (1 - p) * WW / 2, W);
    const sy = wy(dc.y * p + (1 - p) * WH / 2, H);
    const rg = ctx.createRadialGradient(sx, sy, 5, sx, sy, dc.r * cam.zoom * 2.5);
    const dcol = dc.warm ? `rgba(120,80,30,${dc.alpha})` : `rgba(30,60,120,${dc.alpha})`;
    rg.addColorStop(0, dcol);
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
  }

  // stars
  const t = Date.now() / 3000;
  for (let i = 0; i < starLayers.length; i++) {
    const layer = starLayers[i];
    for (let j = 0; j < layer.stars.length; j++) {
      const s = layer.stars[j];
      const ox = -(cam.x - WW / 2) * s.p,
        oy = -(cam.y - WH / 2) * s.p;
      const fx = (((s.x + ox) % W) + W) % W,
        fy = (((s.y + oy) % H) + H) % H;
      const tw = 0.5 + 0.5 * Math.sin(s.tw + t);
      ctx.beginPath();
      ctx.arc(fx, fy, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,210,255,${s.a * tw})`;
      ctx.fill();
    }
  }
}
