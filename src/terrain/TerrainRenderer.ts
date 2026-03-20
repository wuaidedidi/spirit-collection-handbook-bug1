import { Camera } from '../engine/Camera';
import { Chunk, TileData } from '../engine/ChunkManager';
import { SpriteAtlas, SpriteSheet } from '../assets/SpriteTypes';
import { TILE_SIZE, CHUNK_TILES, CHUNK_SIZE, TERRAIN_ANIM } from '../utils/constants';

export class TerrainRenderer {
  private atlas: SpriteAtlas;
  private animTimers: Record<string, number> = {};

  constructor(atlas: SpriteAtlas) {
    this.atlas = atlas;
    // Initialize animation timers for each terrain type
    for (const key of Object.keys(TERRAIN_ANIM)) {
      this.animTimers[key] = 0;
    }
    this.animTimers['grass_tuft'] = 0;
    this.animTimers['lava'] = 0;
    this.animTimers['falling_rock'] = 0;
  }

  update(dt: number): void {
    for (const key of Object.keys(this.animTimers)) {
      this.animTimers[key] += dt;
    }
  }

  getAnimFrame(key: string, totalFrames: number, period: number): number {
    const t = this.animTimers[key] || 0;
    return Math.floor((t / period) * totalFrames) % totalFrames;
  }

  renderChunk(ctx: CanvasRenderingContext2D, chunk: Chunk, camera: Camera): void {
    const vp = camera.getViewport();
    const worldX = chunk.cx * CHUNK_SIZE;
    const worldY = chunk.cy * CHUNK_SIZE;

    // Calculate visible tile range within this chunk
    const startTX = Math.max(0, Math.floor((vp.x - worldX) / TILE_SIZE));
    const startTY = Math.max(0, Math.floor((vp.y - worldY) / TILE_SIZE));
    const endTX = Math.min(CHUNK_TILES - 1, Math.floor((vp.x + vp.w - worldX) / TILE_SIZE));
    const endTY = Math.min(CHUNK_TILES - 1, Math.floor((vp.y + vp.h - worldY) / TILE_SIZE));

    const terrainSheet = this.atlas.terrain[chunk.terrain];
    if (!terrainSheet) return;

    const terrainAnim = TERRAIN_ANIM[chunk.terrain];
    const terrainFrame = this.getAnimFrame(chunk.terrain, terrainAnim.frames, terrainAnim.period);

    for (let ty = startTY; ty <= endTY; ty++) {
      for (let tx = startTX; tx <= endTX; tx++) {
        const tile = chunk.tiles[ty][tx];
        const tileWorldX = worldX + tx * TILE_SIZE;
        const tileWorldY = worldY + ty * TILE_SIZE;
        const screen = camera.worldToScreen(tileWorldX, tileWorldY);

        // Draw base terrain tile
        this.drawSpriteFrame(ctx, terrainSheet, terrainFrame, screen.x, screen.y, camera.scale);

        // Draw grass density layer for grassland tiles (1-2 tufts per tile ≈ 1-2 per 100px²)
        if (chunk.terrain === 'grassland') {
          this.renderGrassDensity(ctx, tileWorldX, tileWorldY, screen.x, screen.y, camera.scale);
        }

        // Draw decoration
        if (tile.decoration) {
          this.renderDecoration(ctx, tile, screen.x, screen.y, camera.scale);
        }
      }
    }
  }

  private tileHash(wx: number, wy: number): number {
    // Fast deterministic hash from tile world coords
    let h = (wx * 374761393 + wy * 668265263) | 0;
    h = ((h ^ (h >> 13)) * 1274126177) | 0;
    return (h ^ (h >> 16)) >>> 0;
  }

  private renderGrassDensity(
    ctx: CanvasRenderingContext2D,
    wx: number, wy: number,
    sx: number, sy: number,
    scale: number
  ): void {
    const grassSheet = this.atlas.decorations['grass_tuft'];
    if (!grassSheet) return;

    const frame = this.getAnimFrame('grass_tuft', 2, 0.8);
    const hash = this.tileHash(wx, wy);
    // 3-5 tufts per tile (16x16=256px², need 1-2 per 100px² → 2.56-5.12 per tile)
    const count = 3 + (hash % 3); // 3, 4, or 5
    const tileScaled = TILE_SIZE * scale;
    const grassW = Math.floor(grassSheet.frameWidth * scale * 0.5);
    const grassH = Math.floor(grassSheet.frameHeight * scale * 0.5);

    for (let i = 0; i < count; i++) {
      const subHash = this.tileHash(wx + i * 7, wy + i * 13);
      const offX = (subHash % 11) / 11 * (tileScaled - grassW);
      const offY = ((subHash >> 4) % 11) / 11 * (tileScaled - grassH);
      ctx.drawImage(
        grassSheet.canvas,
        frame * grassSheet.frameWidth, 0,
        grassSheet.frameWidth, grassSheet.frameHeight,
        Math.floor(sx + offX), Math.floor(sy + offY),
        grassW, grassH
      );
    }
  }

  private renderDecoration(ctx: CanvasRenderingContext2D, tile: TileData, sx: number, sy: number, scale: number): void {
    const decoName = tile.decoration!;
    const decoSheet = this.atlas.decorations[decoName];
    if (!decoSheet) return;

    let frame = 0;
    if (decoName === 'grass_tuft') {
      frame = this.getAnimFrame('grass_tuft', 2, 0.8);
    } else if (decoName === 'lava') {
      frame = this.getAnimFrame('lava', 3, 0.5);
    } else if (decoName === 'falling_rock') {
      frame = this.getAnimFrame('falling_rock', 3, 1.2);
    }

    this.drawSpriteFrame(ctx, decoSheet, frame, sx, sy, scale);
  }

  private drawSpriteFrame(
    ctx: CanvasRenderingContext2D,
    sheet: SpriteSheet,
    frame: number,
    dx: number, dy: number,
    scale: number
  ): void {
    const safeFrame = frame % sheet.frames;
    ctx.drawImage(
      sheet.canvas,
      safeFrame * sheet.frameWidth, 0,
      sheet.frameWidth, sheet.frameHeight,
      Math.floor(dx), Math.floor(dy),
      Math.floor(sheet.frameWidth * scale), Math.floor(sheet.frameHeight * scale)
    );
  }
}
