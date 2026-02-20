export class Particle {
  constructor(
    public x: number,
    public y: number,
    public vx: number,
    public vy: number,
    public color: string,
    public life: number,
    public r: number,
    public maxLife: number = life
  ) {}

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.93;
    this.vy *= 0.93;
    this.life--;
  }
}
