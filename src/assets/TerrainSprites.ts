import { SpriteSheet, createCanvas, px } from './SpriteTypes';

export function generateTerrainSprites(): Record<string, SpriteSheet> {
  const result: Record<string, SpriteSheet> = {};

  // Grassland - 2 frames
  {
    const { canvas, ctx } = createCanvas(32, 16);
    for (let f = 0; f < 2; f++) {
      const ox = f * 16;
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const shade = Math.random() * 0.15;
          const g = Math.floor(140 + shade * 60 + (y > 12 ? -10 : 0));
          ctx.fillStyle = `rgb(${60 + Math.floor(shade * 30)},${g},${50 + Math.floor(shade * 20)})`;
          ctx.fillRect(ox + x, y, 1, 1);
        }
      }
      // Add grass blade details
      const bladeColor = f === 0 ? '#5CBF60' : '#4CAF50';
      const bladeColor2 = f === 0 ? '#6DD070' : '#5CBF60';
      px(ctx, ox + 3, 10, bladeColor); px(ctx, ox + 3, 9, bladeColor2);
      px(ctx, ox + 7, 11, bladeColor); px(ctx, ox + 7, 10, bladeColor2); px(ctx, ox + 7, 9, bladeColor);
      px(ctx, ox + 12, 10, bladeColor); px(ctx, ox + 12, 9, bladeColor2);
      if (f === 1) {
        px(ctx, ox + 4, 9, bladeColor2); px(ctx, ox + 8, 10, bladeColor);
        px(ctx, ox + 13, 9, bladeColor2);
      }
    }
    result['grassland'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 2 };
  }

  // Highland - 1 frame
  {
    const { canvas, ctx } = createCanvas(16, 16);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const v = Math.random() * 0.2;
        const base = 100 + Math.floor(v * 40);
        ctx.fillStyle = `rgb(${base + 20},${base + 5},${base - 15})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Stone cracks
    px(ctx, 3, 5, '#6B5B45'); px(ctx, 4, 5, '#6B5B45'); px(ctx, 4, 6, '#6B5B45');
    px(ctx, 10, 10, '#6B5B45'); px(ctx, 11, 10, '#6B5B45'); px(ctx, 11, 11, '#6B5B45');
    result['highland'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 1 };
  }

  // Desert - 2 frames
  {
    const { canvas, ctx } = createCanvas(32, 16);
    for (let f = 0; f < 2; f++) {
      const ox = f * 16;
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const wave = Math.sin((x + f * 3) * 0.5 + y * 0.3) * 0.1;
          const r = Math.floor(210 + wave * 30 + Math.random() * 15);
          const g = Math.floor(180 + wave * 20 + Math.random() * 10);
          const b = Math.floor(120 + wave * 10 + Math.random() * 10);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(ox + x, y, 1, 1);
        }
      }
    }
    result['desert'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 2 };
  }

  // Ocean - 3 frames
  {
    const { canvas, ctx } = createCanvas(48, 16);
    for (let f = 0; f < 3; f++) {
      const ox = f * 16;
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const wave = Math.sin((x + f * 4) * 0.6 + y * 0.4) * 0.15;
          const depth = y / 16;
          const r = Math.floor(20 + wave * 20);
          const g = Math.floor(100 + wave * 40 - depth * 30);
          const b = Math.floor(200 + wave * 30 - depth * 20);
          ctx.fillStyle = `rgb(${Math.max(0, r)},${Math.max(0, g)},${Math.min(255, b)})`;
          ctx.fillRect(ox + x, y, 1, 1);
        }
      }
      // Wave foam highlights
      const foamY = (f + 1) % 3 + 2;
      for (let x = 0; x < 16; x += 3) {
        px(ctx, ox + x + f, foamY, 'rgba(200,230,255,0.7)');
        px(ctx, ox + x + f + 1, foamY, 'rgba(180,220,250,0.5)');
      }
    }
    result['ocean'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 3 };
  }

  // Volcano - 3 frames
  {
    const { canvas, ctx } = createCanvas(48, 16);
    for (let f = 0; f < 3; f++) {
      const ox = f * 16;
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const v = Math.random() * 0.15;
          const r = Math.floor(50 + v * 20);
          const g = Math.floor(30 + v * 15);
          const b = Math.floor(25 + v * 10);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(ox + x, y, 1, 1);
        }
      }
      // Lava cracks
      const lavaColors = ['#FF5722', '#FF7043', '#FF9800'];
      const lc = lavaColors[f];
      px(ctx, ox + 5, 8, lc); px(ctx, ox + 6, 8, lc); px(ctx, ox + 6, 9, lc);
      px(ctx, ox + 11, 4, lc); px(ctx, ox + 12, 4, lc); px(ctx, ox + 12, 5, lc);
    }
    result['volcano'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 3 };
  }

  // Dungeon - 1 frame
  {
    const { canvas, ctx } = createCanvas(16, 16);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const v = Math.random() * 0.1;
        const base = 45 + Math.floor(v * 20);
        ctx.fillStyle = `rgb(${base + 10},${base + 15},${base + 20})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Tile grid lines
    for (let i = 0; i < 16; i++) {
      px(ctx, i, 0, '#2A3540'); px(ctx, 0, i, '#2A3540');
      px(ctx, i, 15, '#2A3540'); px(ctx, 15, i, '#2A3540');
    }
    result['dungeon'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 1 };
  }

  return result;
}

export function generateDecorationSprites(): Record<string, SpriteSheet> {
  const result: Record<string, SpriteSheet> = {};

  // Grass tuft - 2 frames (swaying)
  {
    const { canvas, ctx } = createCanvas(32, 16);
    for (let f = 0; f < 2; f++) {
      const ox = f * 16;
      const lean = f === 0 ? 0 : 1;
      // Grass blades
      px(ctx, ox + 6 + lean, 8, '#4CAF50'); px(ctx, ox + 6 + lean, 7, '#66BB6A'); px(ctx, ox + 6 + lean, 6, '#81C784');
      px(ctx, ox + 8, 9, '#4CAF50'); px(ctx, ox + 8, 8, '#66BB6A'); px(ctx, ox + 8, 7, '#81C784'); px(ctx, ox + 8, 6, '#A5D6A7');
      px(ctx, ox + 10 - lean, 8, '#4CAF50'); px(ctx, ox + 10 - lean, 7, '#66BB6A'); px(ctx, ox + 10 - lean, 6, '#81C784');
      // Base
      px(ctx, ox + 7, 10, '#388E3C'); px(ctx, ox + 8, 10, '#388E3C'); px(ctx, ox + 9, 10, '#388E3C');
    }
    result['grass_tuft'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 2 };
  }

  // Stone
  {
    const { canvas, ctx } = createCanvas(16, 16);
    // Round stone shape
    const stonePixels = [
      [6,8,'#9E9E9E'],[7,7,'#BDBDBD'],[8,7,'#BDBDBD'],[9,7,'#9E9E9E'],
      [5,9,'#9E9E9E'],[6,9,'#BDBDBD'],[7,8,'#E0E0E0'],[8,8,'#BDBDBD'],[9,8,'#9E9E9E'],[10,9,'#757575'],
      [5,10,'#757575'],[6,10,'#9E9E9E'],[7,9,'#BDBDBD'],[8,9,'#9E9E9E'],[9,9,'#757575'],[10,10,'#616161'],
      [6,11,'#757575'],[7,10,'#9E9E9E'],[8,10,'#757575'],[9,10,'#616161'],
      [7,11,'#616161'],[8,11,'#616161'],
    ];
    for (const [x, y, c] of stonePixels) {
      px(ctx, x as number, y as number, c as string);
    }
    result['stone'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 1 };
  }

  // Cactus
  {
    const { canvas, ctx } = createCanvas(16, 16);
    const c1 = '#2E7D32', c2 = '#388E3C', c3 = '#43A047', c4 = '#1B5E20';
    // Main trunk
    for (let y = 4; y < 15; y++) { px(ctx, 7, y, c2); px(ctx, 8, y, c3); px(ctx, 9, y, c2); }
    // Left arm
    px(ctx, 5, 7, c2); px(ctx, 5, 8, c2); px(ctx, 6, 7, c3); px(ctx, 6, 6, c2); px(ctx, 6, 5, c3);
    // Right arm
    px(ctx, 10, 9, c2); px(ctx, 11, 9, c3); px(ctx, 11, 8, c2); px(ctx, 11, 7, c3);
    // Highlights
    px(ctx, 8, 5, c3); px(ctx, 8, 4, c3);
    // Shadow
    px(ctx, 7, 14, c4); px(ctx, 8, 14, c4); px(ctx, 9, 14, c4);
    // Spines
    px(ctx, 6, 4, '#A5D6A7'); px(ctx, 10, 6, '#A5D6A7'); px(ctx, 12, 7, '#A5D6A7');
    result['cactus'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 1 };
  }

  // Seaweed
  {
    const { canvas, ctx } = createCanvas(16, 16);
    const sw = '#2E7D32';
    px(ctx, 8, 14, sw); px(ctx, 8, 13, sw); px(ctx, 7, 12, sw); px(ctx, 7, 11, sw);
    px(ctx, 8, 10, sw); px(ctx, 8, 9, sw); px(ctx, 9, 8, sw); px(ctx, 9, 7, '#43A047');
    result['seaweed'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 1 };
  }

  // Lava pool - 3 frames
  {
    const { canvas, ctx } = createCanvas(48, 16);
    const lavaColors = [['#FF5722','#FF7043','#FFAB91'], ['#FF7043','#FF9800','#FFCC80'], ['#FF9800','#FF5722','#FFE0B2']];
    for (let f = 0; f < 3; f++) {
      const ox = f * 16;
      const [c1, c2, c3] = lavaColors[f];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const dist = Math.sqrt((x - 8) ** 2 + (y - 8) ** 2);
          if (dist < 6) {
            const t = dist / 6;
            ctx.fillStyle = t < 0.3 ? c3 : t < 0.6 ? c2 : c1;
            ctx.fillRect(ox + x, y, 1, 1);
          }
        }
      }
    }
    result['lava'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 3 };
  }

  // Rock (volcanic)
  {
    const { canvas, ctx } = createCanvas(16, 16);
    const rockPixels: [number, number, string][] = [
      [5,10,'#37474F'],[6,9,'#455A64'],[7,8,'#546E7A'],[8,8,'#455A64'],[9,9,'#37474F'],
      [10,10,'#263238'],[6,10,'#455A64'],[7,9,'#546E7A'],[8,9,'#455A64'],[9,10,'#37474F'],
      [7,10,'#455A64'],[8,10,'#37474F'],[6,11,'#263238'],[7,11,'#37474F'],[8,11,'#263238'],[9,11,'#263238'],
    ];
    for (const [x, y, c] of rockPixels) px(ctx, x, y, c);
    result['rock'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 1 };
  }

  // Wall (dungeon)
  {
    const { canvas, ctx } = createCanvas(16, 16);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const v = Math.random() * 0.1;
        ctx.fillStyle = `rgb(${55 + Math.floor(v * 20)},${60 + Math.floor(v * 20)},${70 + Math.floor(v * 20)})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Brick pattern
    for (let x = 0; x < 16; x++) { px(ctx, x, 4, '#2A3540'); px(ctx, x, 11, '#2A3540'); }
    for (let y = 0; y < 4; y++) px(ctx, 8, y, '#2A3540');
    for (let y = 5; y < 11; y++) px(ctx, 4, y, '#2A3540');
    for (let y = 12; y < 16; y++) px(ctx, 12, y, '#2A3540');
    result['wall'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 1 };
  }

  // Spike (trap)
  {
    const { canvas, ctx } = createCanvas(16, 16);
    const sc = '#78909C', sd = '#546E7A', sl = '#90A4AE';
    // 3 spikes
    px(ctx, 4, 8, sl); px(ctx, 4, 9, sc); px(ctx, 4, 10, sd); px(ctx, 3, 11, sd); px(ctx, 4, 11, sc); px(ctx, 5, 11, sd);
    px(ctx, 8, 7, sl); px(ctx, 8, 8, sc); px(ctx, 8, 9, sc); px(ctx, 8, 10, sd); px(ctx, 7, 11, sd); px(ctx, 8, 11, sc); px(ctx, 9, 11, sd);
    px(ctx, 12, 8, sl); px(ctx, 12, 9, sc); px(ctx, 12, 10, sd); px(ctx, 11, 11, sd); px(ctx, 12, 11, sc); px(ctx, 13, 11, sd);
    result['spike'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 1 };
  }

  // Falling rock (dungeon trap) - 3 frames
  {
    const { canvas, ctx } = createCanvas(48, 16);
    const rc1 = '#78909C', rc2 = '#546E7A', rc3 = '#455A64';
    for (let f = 0; f < 3; f++) {
      const ox = f * 16;
      const dropY = 2 + f * 3; // rock falls down over frames
      // Rock shape
      px(ctx, ox + 6, dropY, rc2); px(ctx, ox + 7, dropY, rc1); px(ctx, ox + 8, dropY, rc1); px(ctx, ox + 9, dropY, rc2);
      px(ctx, ox + 5, dropY + 1, rc3); px(ctx, ox + 6, dropY + 1, rc1); px(ctx, ox + 7, dropY + 1, rc1);
      px(ctx, ox + 8, dropY + 1, rc2); px(ctx, ox + 9, dropY + 1, rc1); px(ctx, ox + 10, dropY + 1, rc3);
      px(ctx, ox + 5, dropY + 2, rc3); px(ctx, ox + 6, dropY + 2, rc2); px(ctx, ox + 7, dropY + 2, rc1);
      px(ctx, ox + 8, dropY + 2, rc1); px(ctx, ox + 9, dropY + 2, rc2); px(ctx, ox + 10, dropY + 2, rc3);
      px(ctx, ox + 6, dropY + 3, rc3); px(ctx, ox + 7, dropY + 3, rc2); px(ctx, ox + 8, dropY + 3, rc2); px(ctx, ox + 9, dropY + 3, rc3);
      // Dust particles below
      if (f === 2) {
        px(ctx, ox + 4, dropY + 4, '#9E9E9E'); px(ctx, ox + 11, dropY + 4, '#9E9E9E');
        px(ctx, ox + 5, dropY + 5, '#BDBDBD'); px(ctx, ox + 10, dropY + 5, '#BDBDBD');
      }
      // Warning shadow on ground
      px(ctx, ox + 6, 13, '#2A2A2A'); px(ctx, ox + 7, 13, '#2A2A2A');
      px(ctx, ox + 8, 13, '#2A2A2A'); px(ctx, ox + 9, 13, '#2A2A2A');
    }
    result['falling_rock'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 3 };
  }

  // Chest
  {
    const { canvas, ctx } = createCanvas(16, 16);
    // Body
    for (let y = 7; y < 14; y++) for (let x = 3; x < 13; x++) px(ctx, x, y, '#795548');
    // Lid
    for (let y = 5; y < 8; y++) for (let x = 3; x < 13; x++) px(ctx, x, y, '#8D6E63');
    // Top curve
    px(ctx, 4, 4, '#8D6E63'); px(ctx, 5, 4, '#8D6E63'); px(ctx, 6, 4, '#8D6E63');
    px(ctx, 7, 4, '#8D6E63'); px(ctx, 8, 4, '#8D6E63'); px(ctx, 9, 4, '#8D6E63');
    px(ctx, 10, 4, '#8D6E63'); px(ctx, 11, 4, '#8D6E63');
    // Gold trim
    for (let x = 3; x < 13; x++) { px(ctx, x, 7, '#FFD700'); px(ctx, x, 13, '#FFD700'); }
    for (let y = 5; y < 14; y++) { px(ctx, 3, y, '#FFD700'); px(ctx, 12, y, '#FFD700'); }
    // Lock
    px(ctx, 7, 8, '#FFD700'); px(ctx, 8, 8, '#FFD700'); px(ctx, 7, 9, '#FFD700'); px(ctx, 8, 9, '#FFD700');
    px(ctx, 7, 10, '#FFA000'); px(ctx, 8, 10, '#FFA000');
    // Highlight
    px(ctx, 5, 6, '#A1887F'); px(ctx, 6, 6, '#A1887F');
    result['chest'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 1 };
  }

  return result;
}
