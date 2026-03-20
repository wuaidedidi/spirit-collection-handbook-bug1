// Seeded PRNG and 2D noise for terrain generation

export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) & 0xffffffff;
    return (this.seed >>> 0) / 0xffffffff;
  }

  nextRange(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.nextRange(min, max + 1));
  }

  fork(): SeededRandom {
    return new SeededRandom(this.seed);
  }
}

function hashCoord(x: number, y: number, seed: number): number {
  let h = seed + x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return (h >>> 0) / 0xffffffff;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

export function valueNoise2D(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const sx = smoothstep(fx);
  const sy = smoothstep(fy);

  const n00 = hashCoord(ix, iy, seed);
  const n10 = hashCoord(ix + 1, iy, seed);
  const n01 = hashCoord(ix, iy + 1, seed);
  const n11 = hashCoord(ix + 1, iy + 1, seed);

  const nx0 = n00 + (n10 - n00) * sx;
  const nx1 = n01 + (n11 - n01) * sx;

  return nx0 + (nx1 - nx0) * sy;
}

export function fractalNoise2D(x: number, y: number, seed: number, octaves: number = 4, persistence: number = 0.5): number {
  let total = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += valueNoise2D(x * frequency, y * frequency, seed + i * 1000) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }

  return total / maxValue;
}

export function chunkSeed(chunkX: number, chunkY: number, worldSeed: number): number {
  return ((chunkX * 73856093) ^ (chunkY * 19349663) ^ worldSeed) >>> 0;
}
