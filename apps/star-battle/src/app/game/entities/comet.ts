import { wx, wy } from '../camera';
import { WW, WH } from '../constants';

export class Comet {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public r: number;
  public life: number;
  public maxLife: number;
  public tail: { x: number; y: number }[] = [];
  public tailLen: number;
  public color: string;
  public power: number;

  constructor() {
    const side = Math.floor(Math.random() * 4);
    if (side === 0) {
      this.x = Math.random() * WW;
      this.y = -80;
    } else if (side === 1) {
      this.x = WW + 80;
      this.y = Math.random() * WH;
    } else if (side === 2) {
      this.x = Math.random() * WW;
      this.y = WH + 80;
    } else {
      this.x = -80;
      this.y = Math.random() * WH;
    }
    const tx = WW * 0.15 + Math.random() * WW * 0.7;
    const ty = WH * 0.15 + Math.random() * WH * 0.7;
    const dist = Math.sqrt((tx - this.x) * (tx - this.x) + (ty - this.y) * (ty - this.y));
    const spd = 5 + Math.random() * 6;
    this.vx = ((tx - this.x) / dist) * spd;
    this.vy = ((ty - this.y) / dist) * spd;
    this.r = 5 + Math.random() * 9;
    this.life = 350 + Math.random() * 250;
    this.maxLife = this.life;
    this.tailLen = 45 + Math.floor(Math.random() * 35);
    const cols = ['#aaddff', '#ffffaa', '#ffffff', '#ffccaa', '#aaffdd'];
    this.color = cols[Math.floor(Math.random() * cols.length)];
    this.power = this.r * spd * 0.5;
  }

  update() {
    this.tail.unshift({ x: this.x, y: this.y });
    if (this.tail.length > this.tailLen) this.tail.pop();
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }

  alive() {
    return (
      this.life > 0 &&
      this.x > -200 &&
      this.x < WW + 200 &&
      this.y > -200 &&
      this.y < WH + 200
    );
  }

  draw(ctx: CanvasRenderingContext2D, cam: any) {
    if (this.tail.length < 2) return;
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    ctx.save();
    for (let i = 1; i < this.tail.length; i++) {
      const t = 1 - i / this.tail.length;
      ctx.beginPath();
      ctx.moveTo(wx(this.tail[i - 1].x, W), wy(this.tail[i - 1].y, H));
      ctx.lineTo(wx(this.tail[i].x, W), wy(this.tail[i].y, H));
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.r * 0.6 * t * cam.zoom;
      ctx.globalAlpha = t * 0.5;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 6;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    const hg = ctx.createRadialGradient(wx(this.x, W), wy(this.y, H), 0, wx(this.x, W), wy(this.y, H), this.r * cam.zoom * 2);
    hg.addColorStop(0, '#ffffff');
    hg.addColorStop(0.4, this.color);
    hg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(wx(this.x, W), wy(this.y, H), this.r * cam.zoom * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
