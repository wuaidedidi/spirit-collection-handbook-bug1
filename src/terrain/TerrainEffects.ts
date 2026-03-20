import { Player } from '../entities/Player';
import { ChunkManager } from '../engine/ChunkManager';
import { OCEAN_SPEED_MODIFIER, VOLCANO_DAMAGE_PER_SEC, TerrainType } from '../utils/constants';

export class TerrainEffects {
  private damageTimer = 0;
  private spikeTimer = 0;
  private fallingRockTimer = 0;
  public onTerrainDamage: ((type: 'lava' | 'trap' | 'falling_rock') => void) | null = null;

  update(dt: number, player: Player, chunkManager: ChunkManager): void {
    const terrain = chunkManager.getTerrainAt(player.x, player.y);
    if (!terrain) return;

    // Track visited terrains
    if (terrain !== 'dungeon') {
      player.visitedTerrains.add(terrain);
    }

    // Speed modifier
    if (terrain === 'ocean') {
      player.speedModifier = OCEAN_SPEED_MODIFIER;
    } else {
      player.speedModifier = 1.0;
    }

    // Volcano lava damage
    const tile = chunkManager.getTileAt(player.x, player.y);
    if (tile && tile.damageZone) {
      this.damageTimer += dt;
      if (this.damageTimer >= 1.0) {
        this.damageTimer -= 1.0;
        player.takeDamage(VOLCANO_DAMAGE_PER_SEC);
        if (this.onTerrainDamage) this.onTerrainDamage('lava');
        console.log(`[Terrain] Player took ${VOLCANO_DAMAGE_PER_SEC} lava damage. HP: ${player.stats.hp}`);
      }
    } else {
      this.damageTimer = 0;
    }

    // Dungeon spike traps (1s cooldown)
    if (tile && tile.trap) {
      this.spikeTimer += dt;
      if (this.spikeTimer >= 1.0) {
        this.spikeTimer -= 1.0;
        player.takeDamage(10);
        if (this.onTerrainDamage) this.onTerrainDamage('trap');
      }
    } else {
      this.spikeTimer = 0;
    }

    // Dungeon falling rock traps
    if (tile && tile.fallingRock) {
      this.fallingRockTimer += dt;
      if (this.fallingRockTimer >= 1.5) {
        this.fallingRockTimer -= 1.5;
        player.takeDamage(15);
        if (this.onTerrainDamage) this.onTerrainDamage('falling_rock');
        console.log(`[Terrain] Player hit by falling rock! -15 HP. HP: ${player.stats.hp}`);
      }
    } else {
      this.fallingRockTimer = 0;
    }
  }

  checkObstacle(chunkManager: ChunkManager, wx: number, wy: number): boolean {
    const tile = chunkManager.getTileAt(wx, wy);
    return tile ? tile.obstacle : false;
  }
}
