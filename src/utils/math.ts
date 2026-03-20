// Vector2 utility class
export class Vector2 {
  constructor(public x: number = 0, public y: number = 0) {}

  add(v: Vector2): Vector2 { return new Vector2(this.x + v.x, this.y + v.y); }
  sub(v: Vector2): Vector2 { return new Vector2(this.x - v.x, this.y - v.y); }
  mul(s: number): Vector2 { return new Vector2(this.x * s, this.y * s); }
  div(s: number): Vector2 { return s !== 0 ? new Vector2(this.x / s, this.y / s) : new Vector2(); }

  length(): number { return Math.sqrt(this.x * this.x + this.y * this.y); }

  normalize(): Vector2 {
    const len = this.length();
    return len > 0 ? this.div(len) : new Vector2();
  }

  distance(v: Vector2): number { return this.sub(v).length(); }
  dot(v: Vector2): number { return this.x * v.x + this.y * v.y; }
  clone(): Vector2 { return new Vector2(this.x, this.y); }
  set(x: number, y: number): void { this.x = x; this.y = y; }
  equals(v: Vector2): boolean { return this.x === v.x && this.y === v.y; }
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1));
}

export interface AABB {
  x: number; y: number; w: number; h: number;
}

export function aabbOverlap(a: AABB, b: AABB): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

export function pointInAABB(px: number, py: number, box: AABB): boolean {
  return px >= box.x && px <= box.x + box.w && py >= box.y && py <= box.y + box.h;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}
