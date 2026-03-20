import { CHUNK_SIZE, CHUNK_TILES, TILE_SIZE, RENDER_DISTANCE, WORLD_SEED, TerrainType } from '../utils/constants';
import { fractalNoise2D, chunkSeed, SeededRandom } from '../utils/noise';

export interface TileData {
  terrain: TerrainType;
  decoration: string | null; // decoration type or null
  obstacle: boolean;
  damageZone: boolean;
  slowZone: boolean;
  chest: boolean;
  trap: boolean;
  fallingRock: boolean;
}

export interface Chunk {
  cx: number;
  cy: number;
  terrain: TerrainType;
  tiles: TileData[][];
  creatureSpawns: { x: number; y: number; type: string }[];
  loaded: boolean;
}

export class ChunkManager {
  private chunks: Map<string, Chunk> = new Map();
  private worldSeed: number;

  constructor(seed: number = WORLD_SEED) {
    this.worldSeed = seed;
  }

  private chunkKey(cx: number, cy: number): string {
    return `${cx},${cy}`;
  }

  worldToChunk(wx: number, wy: number): { cx: number; cy: number } {
    return {
      cx: Math.floor(wx / CHUNK_SIZE),
      cy: Math.floor(wy / CHUNK_SIZE),
    };
  }

  getChunk(cx: number, cy: number): Chunk | undefined {
    return this.chunks.get(this.chunkKey(cx, cy));
  }

  getTileAt(wx: number, wy: number): TileData | null {
    const cc = this.worldToChunk(wx, wy);
    const chunk = this.getChunk(cc.cx, cc.cy);
    if (!chunk) return null;
    const localX = Math.floor((wx - cc.cx * CHUNK_SIZE) / TILE_SIZE);
    const localY = Math.floor((wy - cc.cy * CHUNK_SIZE) / TILE_SIZE);
    if (localX < 0 || localX >= CHUNK_TILES || localY < 0 || localY >= CHUNK_TILES) return null;
    return chunk.tiles[localY][localX];
  }

  getTerrainAt(wx: number, wy: number): TerrainType | null {
    const tile = this.getTileAt(wx, wy);
    return tile ? tile.terrain : null;
  }

  update(playerX: number, playerY: number, dungeonUnlocked: boolean): void {
    const center = this.worldToChunk(playerX, playerY);

    // Load chunks in render distance
    for (let dy = -RENDER_DISTANCE; dy <= RENDER_DISTANCE; dy++) {
      for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
        const cx = center.cx + dx;
        const cy = center.cy + dy;
        const key = this.chunkKey(cx, cy);
        if (!this.chunks.has(key)) {
          this.chunks.set(key, this.generateChunk(cx, cy, dungeonUnlocked));
        }
      }
    }

    // Unload distant chunks
    const maxDist = RENDER_DISTANCE + 2;
    for (const [key, chunk] of this.chunks) {
      if (Math.abs(chunk.cx - center.cx) > maxDist || Math.abs(chunk.cy - center.cy) > maxDist) {
        this.chunks.delete(key);
      }
    }
  }

  getVisibleChunks(vpX: number, vpY: number, vpW: number, vpH: number): Chunk[] {
    const result: Chunk[] = [];
    const startCX = Math.floor(vpX / CHUNK_SIZE);
    const startCY = Math.floor(vpY / CHUNK_SIZE);
    const endCX = Math.floor((vpX + vpW) / CHUNK_SIZE);
    const endCY = Math.floor((vpY + vpH) / CHUNK_SIZE);

    for (let cy = startCY; cy <= endCY; cy++) {
      for (let cx = startCX; cx <= endCX; cx++) {
        const chunk = this.getChunk(cx, cy);
        if (chunk) result.push(chunk);
      }
    }
    return result;
  }

  private determineTerrain(cx: number, cy: number, dungeonUnlocked: boolean): TerrainType {
    const scale = 0.08;
    const nx = cx * scale;
    const ny = cy * scale;

    const elevation = fractalNoise2D(nx, ny, this.worldSeed, 4, 0.5);
    const moisture = fractalNoise2D(nx + 500, ny + 500, this.worldSeed + 1, 3, 0.5);
    const heat = fractalNoise2D(nx + 1000, ny + 1000, this.worldSeed + 2, 3, 0.5);

    // Dungeon: rare, only if unlocked
    if (dungeonUnlocked) {
      const dungeonNoise = fractalNoise2D(nx * 2, ny * 2, this.worldSeed + 3, 2, 0.5);
      if (dungeonNoise > 0.78) return 'dungeon';
    }

    // Ocean: low elevation
    if (elevation < 0.32) return 'ocean';
    // Desert: high heat, low moisture
    if (heat > 0.6 && moisture < 0.4) return 'desert';
    // Volcano: very high heat, high elevation
    if (heat > 0.7 && elevation > 0.6) return 'volcano';
    // Highland: high elevation
    if (elevation > 0.62) return 'highland';
    // Default: grassland
    return 'grassland';
  }

  private generateChunk(cx: number, cy: number, dungeonUnlocked: boolean): Chunk {
    const terrain = this.determineTerrain(cx, cy, dungeonUnlocked);
    const seed = chunkSeed(cx, cy, this.worldSeed);
    const rng = new SeededRandom(seed);
    const tiles: TileData[][] = [];
    const creatureSpawns: { x: number; y: number; type: string }[] = [];

    for (let ty = 0; ty < CHUNK_TILES; ty++) {
      const row: TileData[] = [];
      for (let tx = 0; tx < CHUNK_TILES; tx++) {
        const tile = this.generateTile(terrain, tx, ty, rng);
        row.push(tile);
      }
      tiles.push(row);
    }

    // Spawn creatures (2-5 per chunk, not in ocean)
    if (terrain !== 'ocean') {
      const creatureCount = rng.nextInt(2, 5);
      const types = this.getCreatureTypesForTerrain(terrain);
      for (let i = 0; i < creatureCount; i++) {
        let attempts = 0;
        while (attempts < 20) {
          const tx = rng.nextInt(2, CHUNK_TILES - 3);
          const ty2 = rng.nextInt(2, CHUNK_TILES - 3);
          if (!tiles[ty2][tx].obstacle) {
            creatureSpawns.push({
              x: cx * CHUNK_SIZE + tx * TILE_SIZE + TILE_SIZE / 2,
              y: cy * CHUNK_SIZE + ty2 * TILE_SIZE + TILE_SIZE / 2,
              type: types[rng.nextInt(0, types.length - 1)],
            });
            break;
          }
          attempts++;
        }
      }
    }

    return { cx, cy, terrain, tiles, creatureSpawns, loaded: true };
  }

  private getCreatureTypesForTerrain(terrain: TerrainType): string[] {
    switch (terrain) {
      case 'grassland': return ['knight', 'jelly'];
      case 'highland': return ['knight', 'archer'];
      case 'desert': return ['archer', 'flameBeast'];
      case 'volcano': return ['flameBeast'];
      case 'dungeon': return ['knight', 'archer', 'flameBeast', 'jelly'];
      default: return ['jelly'];
    }
  }

  private generateTile(terrain: TerrainType, tx: number, ty: number, rng: SeededRandom): TileData {
    const base: TileData = {
      terrain,
      decoration: null,
      obstacle: false,
      damageZone: false,
      slowZone: false,
      chest: false,
      trap: false,
      fallingRock: false,
    };

    switch (terrain) {
      case 'grassland': {
        // 1-2 grass tufts per 100px² ≈ ~40% chance per tile
        if (rng.next() < 0.4) base.decoration = 'grass_tuft';
        break;
      }
      case 'highland': {
        const hRoll = rng.next();
        if (hRoll < 0.1) {
          base.decoration = 'grass_tuft';
        } else if (hRoll < 0.7) {
          base.decoration = 'stone';
          if (rng.next() < 0.3) base.obstacle = true;
        }
        break;
      }
      case 'desert': {
        if (rng.next() < 0.05) {
          base.decoration = 'cactus';
          base.obstacle = true;
        }
        break;
      }
      case 'ocean': {
        base.slowZone = true;
        if (rng.next() < 0.02) base.decoration = 'seaweed';
        break;
      }
      case 'volcano': {
        if (rng.next() < 0.25) {
          base.decoration = 'lava';
          base.damageZone = true;
        } else if (rng.next() < 0.15) {
          base.decoration = 'rock';
          base.obstacle = true;
        }
        break;
      }
      case 'dungeon': {
        if (rng.next() < 0.3) {
          base.decoration = 'wall';
          base.obstacle = true;
        } else if (rng.next() < 0.05) {
          base.trap = true;
          base.decoration = 'spike';
        } else if (rng.next() < 0.04) {
          base.fallingRock = true;
          base.decoration = 'falling_rock';
        } else if (rng.next() < 0.02) {
          base.chest = true;
          base.decoration = 'chest';
        }
        break;
      }
    }

    return base;
  }

  getAllChunks(): Chunk[] {
    return Array.from(this.chunks.values());
  }
}
