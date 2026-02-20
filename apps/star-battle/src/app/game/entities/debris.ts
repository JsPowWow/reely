import { wx, wy } from '../camera';

export class Debris {
  public vx: number;
  public vy: number;
  public rot: number;
  public rotSpd: number;
  public r: number;
  public life: number;
  public maxLife: number;
  public heat = 1.0;
  public pts: [number, number][] = [];
  public glowing: boolean;

  constructor(public x: number, public y: number, public color: string) {
    const a = Math.random() * Math.PI * 2,
      spd = 0.5 + Math.random() * 3;
    this.vx = Math.cos(a) * spd;
    this.vy = Math.sin(a) * spd;
    this.rot = Math.random() * Math.PI * 2;
    this.rotSpd = (Math.random() - 0.5) * 0.07;
    this.r = 3 + Math.random() * 9;
    this.life = 500 + Math.random() * 700;
    this.maxLife = this.life;
    this.glowing = Math.random() < 0.4;

    const n = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const ang = (Math.PI * 2 / n) * i + (Math.random() - 0.5) * 0.8;
      const r = this.r * (0.5 + Math.random() * 0.5);
      this.pts.push([Math.cos(ang) * r, Math.sin(ang) * r]);
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.999;
    this.vy *= 0.999;
    this.rot += this.rotSpd;
    this.life--;
    this.heat = Math.max(0, this.heat - 0.002);
  }

  alive() {
    return this.life > 0;
  }

  draw(ctx: CanvasRenderingContext2D, cam: any) {
    const a = this.life / this.maxLife;
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    ctx.save();
    ctx.translate(wx(this.x, W), wy(this.y, H));
    ctx.rotate(this.rot);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.globalAlpha = Math.min(1, a * 2);
    if (this.glowing && this.heat > 0.1) {
      ctx.shadowColor = '#ff6600';
      ctx.shadowBlur = 8;
    }
    const g = ctx.createRadialGradient(-this.r * 0.3, -this.r * 0.3, 0.5, 0, 0, this.r);
    if (this.glowing && this.heat > 0.1) {
      g.addColorStop(0, 'rgba(255,200,80,' + this.heat * 0.9 + ')');
      g.addColorStop(0.5, this.color);
      g.addColorStop(1, '#111');
    } else {
      g.addColorStop(0, 'rgba(180,160,140,0.8)');
      g.addColorStop(1, this.color);
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(this.pts[0][0], this.pts[0][1]);
    for (let i = 1; i < this.pts.length; i++) ctx.lineTo(this.pts[i][0], this.pts[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
