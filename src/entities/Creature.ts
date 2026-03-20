import { Entity } from './Entity';
import { Player } from './Player';
import { Vector2 } from '../utils/math';
import { randomInt, randomRange } from '../utils/math';
import {
  CreatureType,
  CREATURE_CONFIG,
  CREATURE_NAMES,
  CREATURE_ALERT_RANGE,
} from '../utils/constants';

export type CreatureAIState = 'idle' | 'patrol' | 'chase' | 'attack' | 'hurt' | 'dead';

export class Creature extends Entity {
  public creatureType: CreatureType;
  public aiState: CreatureAIState;
  public isCaptured: boolean;
  public isPet: boolean;
  public petOwner: Player | null;
  public spawnX: number;
  public spawnY: number;
  public patrolTarget: { x: number; y: number } | null;
  public attackCooldown: number;
  public jellySpeedTimer: number;
  public stateTimer: number;
  public onDamageDealt: ((x: number, y: number, damage: number) => void) | null = null;

  private previousAIState: CreatureAIState;

  constructor(creatureType: CreatureType, x: number, y: number) {
    super(x, y, 16, 16);
    this.creatureType = creatureType;
    this.aiState = 'idle';
    this.previousAIState = 'idle';
    this.isCaptured = false;
    this.isPet = false;
    this.petOwner = null;
    this.spawnX = x;
    this.spawnY = y;
    this.patrolTarget = null;
    this.attackCooldown = 0;
    this.jellySpeedTimer = 0;
    this.stateTimer = 0;

    const config = CREATURE_CONFIG[creatureType];
    const hp = randomInt(config.minHp, config.maxHp);
    const atk = randomInt(config.minAtk, config.maxAtk);

    this.stats = {
      hp,
      maxHp: hp,
      attack: atk,
      speed: config.speed,
      attackRange: config.attackRange,
      attackInterval: config.attackInterval,
    };

    const name = CREATURE_NAMES[creatureType];
    console.log(`[Creature] ${name} spawned: HP=${hp}, ATK=${atk}`);
  }

  update(dt: number, playerX: number = 0, playerY: number = 0, playerEntity: Player | null = null): void {
    super.update(dt);

    if (!this.isAlive) {
      this.aiState = 'dead';
      return;
    }

    this.attackCooldown -= dt;
    if (this.attackCooldown < 0) this.attackCooldown = 0;

    // Jelly special: randomize speed every 2 seconds
    if (this.creatureType === 'jelly') {
      this.jellySpeedTimer -= dt;
      if (this.jellySpeedTimer <= 0) {
        this.jellySpeedTimer = 2;
        this.stats.speed = randomRange(24, 64);
      }
    }

    if (this.isPet && this.petOwner) {
      this.updatePetAI(dt, playerEntity);
      return;
    }

    this.updateWildAI(dt, playerX, playerY, playerEntity);
  }

  private updateWildAI(dt: number, playerX: number, playerY: number, playerEntity: Player | null): void {
    const distToPlayer = this.distanceToPoint(playerX, playerY);

    switch (this.aiState) {
      case 'idle':
        this.currentAnimation = 'idle';
        this.stateTimer -= dt;
        // Random chance to patrol
        if (this.stateTimer <= 0) {
          if (Math.random() < 0.3) {
            this.aiState = 'patrol';
            this.patrolTarget = {
              x: this.spawnX + randomRange(-100, 100),
              y: this.spawnY + randomRange(-100, 100),
            };
            this.stateTimer = 5; // patrol timeout
          } else {
            this.stateTimer = randomRange(1, 3);
          }
        }
        // Check if player is in alert range
        if (distToPlayer <= CREATURE_ALERT_RANGE) {
          this.aiState = 'chase';
          this.stateTimer = 0;
        }
        break;

      case 'patrol':
        this.currentAnimation = 'move';
        if (this.patrolTarget) {
          this.moveToward(this.patrolTarget.x, this.patrolTarget.y, dt);
          const distToTarget = this.distanceToPoint(this.patrolTarget.x, this.patrolTarget.y);
          if (distToTarget < 4) {
            this.aiState = 'idle';
            this.patrolTarget = null;
            this.stateTimer = randomRange(1, 3);
          }
        }
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          this.aiState = 'idle';
          this.patrolTarget = null;
          this.stateTimer = randomRange(1, 3);
        }
        // Check if player is in alert range
        if (distToPlayer <= CREATURE_ALERT_RANGE) {
          this.aiState = 'chase';
          this.patrolTarget = null;
          this.stateTimer = 0;
        }
        break;

      case 'chase':
        this.currentAnimation = 'move';
        this.moveToward(playerX, playerY, dt);
        if (distToPlayer <= this.stats.attackRange) {
          this.aiState = 'attack';
          this.stateTimer = 0;
        }
        // Give up if player is too far
        if (distToPlayer > 300) {
          this.aiState = 'idle';
          this.stateTimer = randomRange(1, 3);
        }
        break;

      case 'attack':
        this.currentAnimation = 'attack';
        if (distToPlayer > this.stats.attackRange) {
          this.aiState = 'chase';
          break;
        }
        if (this.attackCooldown <= 0 && playerEntity && playerEntity.isAlive) {
          playerEntity.takeDamage(this.stats.attack);
          if (this.onDamageDealt) {
            this.onDamageDealt(playerEntity.x, playerEntity.y - 20, this.stats.attack);
          }
          this.attackCooldown = this.stats.attackInterval;
          this.animationFrame = 0;
          this.animationTimer = 0;
        }
        break;

      case 'hurt':
        this.currentAnimation = 'hurt';
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          this.aiState = this.previousAIState;
        }
        break;

      case 'dead':
        this.currentAnimation = 'die';
        break;
    }
  }

  private updatePetAI(dt: number, playerEntity: Player | null): void {
    if (!this.petOwner) return;

    // For pet AI, we don't have a list of all creatures here,
    // so pet follows the owner and attacks nearby enemies when in range.
    const distToOwner = this.distanceToPoint(this.petOwner.x, this.petOwner.y);

    // Follow owner if too far
    if (distToOwner > 100) {
      this.currentAnimation = 'move';
      this.moveToward(this.petOwner.x, this.petOwner.y, dt);
    } else {
      this.currentAnimation = 'idle';
    }
  }

  /**
   * Called externally when a nearby non-pet creature is found for the pet to attack.
   */
  petAttackTarget(target: Entity, dt: number): void {
    if (!this.isPet || !this.isAlive) return;

    const dist = this.distanceTo(target);
    if (dist <= this.stats.attackRange) {
      this.currentAnimation = 'attack';
      if (this.attackCooldown <= 0) {
        target.takeDamage(this.stats.attack);
        if (this.onDamageDealt) {
          this.onDamageDealt(target.x, target.y - 20, this.stats.attack);
        }
        this.attackCooldown = this.stats.attackInterval;
        this.animationFrame = 0;
        this.animationTimer = 0;
      }
    } else {
      this.currentAnimation = 'move';
      this.moveToward(target.x, target.y, dt);
    }
  }

  takeDamage(amount: number): void {
    if (!this.isAlive) return;
    if (this.aiState !== 'hurt' && this.aiState !== 'dead') {
      // Always chase after being attacked (react aggressively)
      this.previousAIState = 'chase';
    }
    super.takeDamage(amount);
    if (this.isAlive) {
      this.aiState = 'hurt';
      this.stateTimer = 0.3;
    } else {
      this.aiState = 'dead';
    }
  }

  private moveToward(targetX: number, targetY: number, dt: number): void {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;

    const nx = dx / dist;
    const ny = dy / dist;
    const moveAmount = this.stats.speed * dt;

    this.x += nx * moveAmount;
    this.y += ny * moveAmount;

    // Update direction
    this.direction = this.vectorToDirection(nx, ny);
  }

  private distanceToPoint(px: number, py: number): number {
    const dx = this.x - px;
    const dy = this.y - py;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private vectorToDirection(dx: number, dy: number): 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' {
    if (dx === 0 && dy === 0) return 's';
    const angle = Math.atan2(dy, dx);
    const index = Math.round(angle / (Math.PI / 4));
    const dirMap: ('n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw')[] = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
    return dirMap[((index % 8) + 8) % 8];
  }
}
