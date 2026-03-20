import { Vector2, lerp } from '../utils/math';

export class Camera {
  position: Vector2 = new Vector2();
  private target: Vector2 = new Vector2();
  private viewportWidth: number;
  private viewportHeight: number;
  private smoothing = 0.08;
  scale = 2;

  constructor(viewportWidth: number, viewportHeight: number) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  resize(w: number, h: number): void {
    this.viewportWidth = w;
    this.viewportHeight = h;
  }

  follow(target: Vector2): void {
    this.target = target;
  }

  snapTo(pos: Vector2): void {
    this.position.set(pos.x, pos.y);
    this.target = pos.clone();
  }

  update(): void {
    this.position.x = lerp(this.position.x, this.target.x, this.smoothing);
    this.position.y = lerp(this.position.y, this.target.y, this.smoothing);
  }

  getViewport(): { x: number; y: number; w: number; h: number } {
    const w = this.viewportWidth / this.scale;
    const h = this.viewportHeight / this.scale;
    return {
      x: this.position.x - w / 2,
      y: this.position.y - h / 2,
      w,
      h,
    };
  }

  worldToScreen(wx: number, wy: number): { x: number; y: number } {
    const vp = this.getViewport();
    return {
      x: (wx - vp.x) * this.scale,
      y: (wy - vp.y) * this.scale,
    };
  }

  screenToWorld(sx: number, sy: number): { x: number; y: number } {
    const vp = this.getViewport();
    return {
      x: sx / this.scale + vp.x,
      y: sy / this.scale + vp.y,
    };
  }

  isVisible(x: number, y: number, w: number, h: number): boolean {
    const vp = this.getViewport();
    return x + w > vp.x && x < vp.x + vp.w && y + h > vp.y && y < vp.y + vp.h;
  }

  getWidth(): number { return this.viewportWidth; }
  getHeight(): number { return this.viewportHeight; }
}
