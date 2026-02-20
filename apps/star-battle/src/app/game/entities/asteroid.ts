import { wx, wy } from '../camera';
import { WW, WH } from '../constants';

export class Asteroid {
  public vx: number;
  public vy: number;
  public rot: number;
  public rotSpd: number;
  public hp: number;
  public maxHp: number;
  public pts: [number, number][] = [];
  public craters: { ox: number; oy: number; r: number }[] = [];
  public tone: string;
  public cracks: number[][] = [];

  constructor(public x: number, public y: number, public size: number) {
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = (Math.random() - 0.5) * 0.6;
    this.rot = Math.random() * Math.PI * 2;
    this.rotSpd = (Math.random() - 0.5) * 0.009;
    this.hp = size * 2.5;
    this.maxHp = this.hp;

    const n = 7 + Math.floor(Math.random() * 5);
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 / n) * i + (Math.random() - 0.5) * 0.5;
      const r = size * (0.65 + Math.random() * 0.35);
      this.pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }

    const nc2 = 2 + Math.floor(size / 18);
    for (let i = 0; i < nc2; i++) {
      this.craters.push({
        ox: (Math.random() - 0.5) * size * 0.8,
        oy: (Math.random() - 0.5) * size * 0.8,
        r: size * 0.08 + Math.random() * size * 0.12,
      });
    }

    this.tone = Math.random() < 0.25 ? '#8866aa' : Math.random() < 0.4 ? '#446688' : '#776655';

    const nc3 = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < nc3; i++) {
      const ca2 = Math.random() * Math.PI * 2;
      const cr2 = size * (0.2 + Math.random() * 0.5);
      const cx2 = Math.cos(ca2 + 0.3) * size * 0.3,
        cy2 = Math.sin(ca2 + 0.3) * size * 0.3;
      this.cracks.push([
        cx2,
        cy2,
        Math.cos(ca2) * cr2,
        Math.sin(ca2) * cr2,
        Math.cos(ca2 + 1.1) * cr2 * 0.4,
        Math.sin(ca2 + 1.1) * cr2 * 0.4,
      ]);
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.rot += this.rotSpd;
    if (this.x < -100) this.x = WW + 100;
    if (this.x > WW + 100) this.x = -100;
    if (this.y < -100) this.y = WH + 100;
    if (this.y > WH + 100) this.y = -100;
  }

  draw(ctx: CanvasRenderingContext2D, cam: any) {
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    const sx = wx(this.x, W),
      sy = wy(this.y, H),
      sc = cam.zoom;
    if (sx < -this.size * sc * 2 || sx > W + this.size * sc * 2 || sy < -this.size * sc * 2 || sy > H + this.size * sc * 2) return;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(this.rot);
    ctx.scale(sc, sc);
    const dmgR = 1 - this.hp / this.maxHp;
    // base fill
    const g = ctx.createRadialGradient(-this.size * 0.3, -this.size * 0.3, 1, 0, 0, this.size * 1.1);
    g.addColorStop(0, '#aaa090');
    g.addColorStop(0.4, '#776655');
    g.addColorStop(0.85, this.tone);
    g.addColorStop(1, '#221a12');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(this.pts[0][0], this.pts[0][1]);
    for (let i = 1; i < this.pts.length; i++) ctx.lineTo(this.pts[i][0], this.pts[i][1]);
    ctx.closePath();
    ctx.fill();
    // edge stroke
    ctx.strokeStyle = 'rgba(200,180,140,0.3)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // edge darkening
    const eg = ctx.createRadialGradient(0, 0, this.size * 0.4, 0, 0, this.size * 1.1);
    eg.addColorStop(0, 'rgba(0,0,0,0)');
    eg.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.moveTo(this.pts[0][0], this.pts[0][1]);
    for (let i = 1; i < this.pts.length; i++) ctx.lineTo(this.pts[i][0], this.pts[i][1]);
    ctx.closePath();
    ctx.fill();
    // craters
    for (let i = 0; i < this.craters.length; i++) {
      const cr = this.craters[i];
      const cg = ctx.createRadialGradient(cr.ox - cr.r * 0.2, cr.oy - cr.r * 0.2, cr.r * 0.1, cr.ox, cr.oy, cr.r);
      cg.addColorStop(0, 'rgba(0,0,0,0.6)');
      cg.addColorStop(0.7, 'rgba(0,0,0,0.3)');
      cg.addColorStop(1, 'rgba(180,160,120,0.2)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cr.ox, cr.oy, cr.r, 0, Math.PI * 2);
      ctx.fill();
    }
    // damage: cracks stage 1
    if (dmgR > 0.25) {
      const ca = (dmgR - 0.25) * 1.1;
      ctx.strokeStyle = 'rgba(210,120,30,' + ca + ')';
      ctx.lineWidth = 0.9;
      for (let i = 0; i < this.cracks.length; i++) {
        const ck = this.cracks[i];
        ctx.beginPath();
        ctx.moveTo(ck[0], ck[1]);
        ctx.lineTo(ck[0] + ck[2], ck[1] + ck[3]);
        ctx.stroke();
        // branch
        ctx.beginPath();
        ctx.moveTo(ck[0] + ck[2] * 0.5, ck[1] + ck[3] * 0.5);
        ctx.lineTo(ck[0] + ck[2] * 0.5 + ck[4], ck[1] + ck[3] * 0.5 + ck[5]);
        ctx.stroke();
      }
    }
    // damage: glow interior stage 2
    if (dmgR > 0.55) {
      const ga = (dmgR - 0.55) * 1.4;
      const gg = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 0.7);
      gg.addColorStop(0, 'rgba(255,80,0,' + ga * 0.5 + ')');
      gg.addColorStop(1, 'rgba(255,40,0,0)');
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.moveTo(this.pts[0][0], this.pts[0][1]);
      for (let i = 1; i < this.pts.length; i++) ctx.lineTo(this.pts[i][0], this.pts[i][1]);
      ctx.closePath();
      ctx.fill();
    }
    // damage: bright hotspots stage 3
    if (dmgR > 0.78) {
      const ha = (dmgR - 0.78) * 3.5;
      ctx.fillStyle = 'rgba(255,180,40,' + ha + ')';
      for (let i = 0; i < this.craters.length; i++) {
        ctx.beginPath();
        ctx.arc(this.craters[i].ox * 0.6, this.craters[i].oy * 0.6, this.size * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowColor = '#ff6600';
      ctx.shadowBlur = this.size * 0.4 * ha;
      ctx.fillStyle = 'rgba(255,100,0,' + ha * 0.4 + ')';
      ctx.beginPath();
      ctx.moveTo(this.pts[0][0], this.pts[0][1]);
      for (let i = 1; i < this.pts.length; i++) ctx.lineTo(this.pts[i][0], this.pts[i][1]);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}
