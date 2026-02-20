import { WW, WH } from '../constants';

export class Bullet {
  public life: number;
  public maxLife: number;
  public r: number;

  constructor(
    public x: number,
    public y: number,
    public vx: number,
    public vy: number,
    public dmg: number,
    public color: string,
    public owner: number,
    public isMine: boolean
  ) {
    this.life = isMine ? 300 : 180;
    this.maxLife = this.life;
    this.r = isMine ? 8 : 3;
  }

  update() {
    if (!this.isMine) {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -28) this.x = WW + 28;
      if (this.x > WW + 28) this.x = -28;
      if (this.y < -28) this.y = WH + 28;
      if (this.y > WH + 28) this.y = -28;
    }
    this.life--;
  }
}
