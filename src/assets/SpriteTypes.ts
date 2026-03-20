export interface SpriteSheet {
  canvas: HTMLCanvasElement;
  frameWidth: number;
  frameHeight: number;
  frames: number;
  animations?: Record<string, { start: number; end: number; speed: number }>;
}

export interface SpriteAtlas {
  player: Record<string, SpriteSheet>;
  terrain: Record<string, SpriteSheet>;
  creatures: Record<string, SpriteSheet>;
  items: Record<string, SpriteSheet>;
  ui: Record<string, SpriteSheet>;
  decorations: Record<string, SpriteSheet>;
}

export function createCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

export function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

export function drawPixels(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, data: string[][], palette: Record<string, string>): void {
  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data[y].length; x++) {
      const key = data[y][x];
      if (key && key !== '.' && palette[key]) {
        px(ctx, offsetX + x, offsetY + y, palette[key]);
      }
    }
  }
}
