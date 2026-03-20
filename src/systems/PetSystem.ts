import { Player } from '../entities/Player';
import { Creature } from '../entities/Creature';
import { CombatSystem } from './CombatSystem';

export class PetSystem {
  private faintCooldowns: Map<string, number> = new Map();

  update(dt: number, player: Player, combat: CombatSystem): void {
    // Update faint cooldowns
    for (const [id, time] of this.faintCooldowns) {
      const newTime = time - dt;
      if (newTime <= 0) {
        this.faintCooldowns.delete(id);
        // Revive pet
        const pet = player.pets.find(p => p.id === id);
        if (pet) {
          pet.stats.hp = Math.floor(pet.stats.maxHp * 0.5);
          pet.isAlive = true;
          pet.currentAnimation = 'idle';
          combat.addText(pet.x, pet.y - 20, '宠物已恢复！', '#4CAF50');
        }
      } else {
        this.faintCooldowns.set(id, newTime);
      }
    }

    // Check active pet status
    if (player.activePetIndex >= 0 && player.activePetIndex < player.pets.length) {
      const activePet = player.pets[player.activePetIndex];
      if (!activePet.isAlive && !this.faintCooldowns.has(activePet.id)) {
        // Pet fainted
        this.faintCooldowns.set(activePet.id, 30); // 30s cooldown
        combat.addText(activePet.x, activePet.y - 20, '宠物晕倒了！', '#FF5252');
        console.log(`[Pet] ${activePet.creatureType} fainted. 30s cooldown.`);
      }

      // Pet follows player
      if (activePet.isAlive) {
        activePet.update(dt, player.x, player.y, player);
      }
    }
  }

  addPet(player: Player, creature: Creature): boolean {
    // Create pet from captured creature
    creature.isPet = true;
    creature.petOwner = player;
    creature.isCaptured = true;
    creature.isAlive = true;
    creature.stats.hp = creature.stats.maxHp; // Full heal on capture
    creature.currentAnimation = 'idle';
    creature.aiState = 'idle';

    player.pets.push(creature);

    // Auto-deploy if no active pet and less than 3 pets
    if (player.activePetIndex === -1) {
      player.activePetIndex = player.pets.length - 1;
    }

    console.log(`[Pet] Added ${creature.creatureType}. Total pets: ${player.pets.length}`);
    return true;
  }

  deployPet(player: Player, index: number): boolean {
    if (index < 0 || index >= player.pets.length) return false;
    const pet = player.pets[index];
    if (!pet.isAlive && this.faintCooldowns.has(pet.id)) return false;

    player.activePetIndex = index;
    pet.x = player.x + 30;
    pet.y = player.y + 30;
    console.log(`[Pet] Deployed ${pet.creatureType}`);
    return true;
  }

  recallPet(player: Player): void {
    player.activePetIndex = -1;
  }

  getFaintCooldown(petId: string): number {
    return this.faintCooldowns.get(petId) || 0;
  }
}
