import { Player } from '../entities/Player';
import { Creature } from '../entities/Creature';
import { Entity } from '../entities/Entity';
import { CREATURE_ALERT_RANGE } from '../utils/constants';

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  timer: number;
  maxTime: number;
}

export class CombatSystem {
  floatingTexts: FloatingText[] = [];

  update(dt: number, player: Player, creatures: Creature[]): void {
    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.timer += dt;
      ft.y += 30 * dt;
      if (ft.timer >= ft.maxTime) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Pet combat: find nearest wild creature for each active pet
    for (const pet of player.pets) {
      if (!pet.isPet || !pet.isAlive) continue;
      if (player.activePetIndex === -1) continue;
      if (player.pets[player.activePetIndex] !== pet) continue;

      let nearestDist = Infinity;
      let nearestCreature: Creature | null = null;

      for (const creature of creatures) {
        if (!creature.isAlive || creature.isCaptured || creature.isPet) continue;
        const dist = pet.distanceTo(creature);
        if (dist < CREATURE_ALERT_RANGE && dist < nearestDist) {
          nearestDist = dist;
          nearestCreature = creature;
        }
      }

      if (nearestCreature) {
        pet.petAttackTarget(nearestCreature, dt);
      }
    }

    // Wild creatures attack active pet if pet is closer than player
    for (const creature of creatures) {
      if (!creature.isAlive || creature.isCaptured || creature.isPet) continue;
      if (creature.attackCooldown > 0) continue;

      // Check if there's an active pet that is closer than player
      if (player.activePetIndex >= 0 && player.activePetIndex < player.pets.length) {
        const activePet = player.pets[player.activePetIndex];
        if (activePet.isAlive) {
          const distToPet = creature.distanceTo(activePet);
          const distToPlayer = creature.distanceTo(player);
          
          // If pet is closer than player and in attack range, attack the pet
          if (distToPet <= creature.stats.attackRange && distToPet < distToPlayer) {
            activePet.takeDamage(creature.stats.attack);
            if (creature.onDamageDealt) {
              creature.onDamageDealt(activePet.x, activePet.y - 20, creature.stats.attack);
            }
            creature.attackCooldown = creature.stats.attackInterval;
            creature.animationFrame = 0;
            creature.animationTimer = 0;
          }
        }
      }
    }

    // Remove dead creatures after die animation
    for (const creature of creatures) {
      if (!creature.isAlive && creature.currentAnimation === 'die') {
        creature.update(dt);
      }
    }
  }

  addDamageText(x: number, y: number, damage: number): void {
    this.floatingTexts.push({
      x, y,
      text: `-${damage}`,
      color: '#FF5252',
      timer: 0,
      maxTime: 1.0,
    });
  }

  addGoldText(x: number, y: number, amount: number): void {
    this.floatingTexts.push({
      x, y,
      text: `+${amount}金币`,
      color: '#FFD700',
      timer: 0,
      maxTime: 1.5,
    });
  }

  addText(x: number, y: number, text: string, color: string): void {
    this.floatingTexts.push({
      x, y, text, color,
      timer: 0,
      maxTime: 1.5,
    });
  }
}
