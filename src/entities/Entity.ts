import { Vector2, AABB } from '../utils/math';

export type Direction = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
export type AnimationName = 'idle' | 'move' | 'attack' | 'hurt' | 'die';

export interface EntityStats {
  hp: number;
  maxHp: number;
  attack: number;
  speed: number;
  attackRange: number;
  attackInterval: number;
}

let nextEntityId = 0;

export class Entity {
  public id: string;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public direction: Direction;
  public currentAnimation: AnimationName;
  public animationFrame: number;
  public animationTimer: number;
  public isAlive: boolean;
  public stats: EntityStats;

  constructor(x: number = 0, y: number = 0, width: number = 16, height: number = 16) {
    this.id = `entity_${nextEntityId++}`;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.direction = 's';
    this.currentAnimation = 'idle';
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.isAlive = true;
    this.stats = {
      hp: 100,
      maxHp: 100,
      attack: 0,
      speed: 0,
      attackRange: 0,
      attackInterval: 0,
    };
  }

  public animationSpeed: number = 6; // frames per second, overridden by sprite animation speed

  update(dt: number): void {
    this.animationTimer += dt;
    const frameDuration = 1.0 / this.animationSpeed;
    if (this.animationTimer >= frameDuration) {
      this.animationTimer -= frameDuration;
      this.animationFrame++;
    }
  }

  takeDamage(amount: number): void {
    if (!this.isAlive) return;
    this.stats.hp -= amount;
    if (this.stats.hp <= 0) {
      this.stats.hp = 0;
      this.isAlive = false;
      this.currentAnimation = 'die';
      this.animationFrame = 0;
      this.animationTimer = 0;
    } else {
      this.currentAnimation = 'hurt';
      this.animationFrame = 0;
      this.animationTimer = 0;
    }
  }

  distanceTo(other: Entity): number {
    const a = new Vector2(this.x, this.y);
    const b = new Vector2(other.x, other.y);
    return a.distance(b);
  }

  getBounds(): AABB {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      w: this.width,
      h: this.height,
    };
  }
}
