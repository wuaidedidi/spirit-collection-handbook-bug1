import { Entity, Direction } from './Entity';
import { TerrainType } from '../utils/constants';
import type { Creature } from './Creature';

const DIRECTION_MAP: [number, number, Direction][] = [
  [0, -1, 'n'],
  [1, -1, 'ne'],
  [1, 0, 'e'],
  [1, 1, 'se'],
  [0, 1, 's'],
  [-1, 1, 'sw'],
  [-1, 0, 'w'],
  [-1, -1, 'nw'],
];

function vectorToDirection(dx: number, dy: number): Direction {
  if (dx === 0 && dy === 0) return 's';
  const angle = Math.atan2(dy, dx);
  const index = Math.round(angle / (Math.PI / 4));
  const dirMap: Direction[] = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
  return dirMap[((index % 8) + 8) % 8];
}

export class Player extends Entity {
  public gold: number;
  public speedModifier: number;
  public visitedTerrains: Set<TerrainType>;
  public pets: Creature[];
  public activePetIndex: number;

  constructor(x: number = 0, y: number = 0) {
    super(x, y, 16, 16);
    this.stats = {
      hp: 300,
      maxHp: 300,
      speed: 48,
      attack: 0,
      attackRange: 0,
      attackInterval: 0,
    };
    this.gold = 100;
    this.speedModifier = 1.0;
    this.visitedTerrains = new Set<TerrainType>();
    this.pets = [];
    this.activePetIndex = -1;
  }

  update(dt: number, inputX: number = 0, inputY: number = 0): void {
    super.update(dt);

    if (!this.isAlive) return;

    const hasInput = inputX !== 0 || inputY !== 0;

    if (hasInput) {
      // Normalize input vector
      const len = Math.sqrt(inputX * inputX + inputY * inputY);
      const nx = inputX / len;
      const ny = inputY / len;

      const moveSpeed = this.stats.speed * this.speedModifier * dt;
      this.x += nx * moveSpeed;
      this.y += ny * moveSpeed;

      // Update direction based on movement
      this.direction = vectorToDirection(nx, ny);

      if (this.currentAnimation !== 'move') {
        this.currentAnimation = 'move';
        this.animationFrame = 0;
        this.animationTimer = 0;
      }
    } else {
      if (this.currentAnimation !== 'idle') {
        this.currentAnimation = 'idle';
        this.animationFrame = 0;
        this.animationTimer = 0;
      }
    }
  }

  canAccessDungeon(): boolean {
    const requiredTerrains: TerrainType[] = ['grassland', 'highland', 'desert', 'ocean', 'volcano'];
    return requiredTerrains.every(t => this.visitedTerrains.has(t));
  }

  addGold(amount: number): void {
    this.gold += amount;
  }

  spendGold(amount: number): boolean {
    if (this.gold >= amount) {
      this.gold -= amount;
      return true;
    }
    return false;
  }
}
