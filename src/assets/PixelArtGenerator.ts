import { SpriteAtlas } from './SpriteTypes';
import { generatePlayerSprites } from './PlayerSprites';
import { generateTerrainSprites, generateDecorationSprites } from './TerrainSprites';
import { generateCreatureSprites } from './CreatureSprites';
import { generateItemSprites, generateUISprites } from './ItemSprites';

let cachedAtlas: SpriteAtlas | null = null;

export class PixelArtGenerator {
  generateAll(): SpriteAtlas {
    if (cachedAtlas) return cachedAtlas;

    console.log('[PixelArt] Generating all sprites...');
    const start = performance.now();

    cachedAtlas = {
      player: generatePlayerSprites(),
      terrain: generateTerrainSprites(),
      creatures: generateCreatureSprites(),
      items: generateItemSprites(),
      ui: generateUISprites(),
      decorations: generateDecorationSprites(),
    };

    const elapsed = (performance.now() - start).toFixed(1);
    console.log(`[PixelArt] All sprites generated in ${elapsed}ms`);

    return cachedAtlas;
  }
}

export type { SpriteAtlas, SpriteSheet } from './SpriteTypes';
