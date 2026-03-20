import { SpriteSheet, createCanvas, px } from './SpriteTypes';

function makeCreatureSheet(drawFrame: (ctx: CanvasRenderingContext2D, ox: number, anim: string, frame: number) => void): SpriteSheet {
  // idle(2) + move(4) + attack(3) + hurt(2) + die(3) = 14 frames
  const totalFrames = 14;
  const { canvas, ctx } = createCanvas(16 * totalFrames, 16);

  const anims = [
    { name: 'idle', count: 2 },
    { name: 'move', count: 4 },
    { name: 'attack', count: 3 },
    { name: 'hurt', count: 2 },
    { name: 'die', count: 3 },
  ];

  let idx = 0;
  for (const a of anims) {
    for (let f = 0; f < a.count; f++) {
      drawFrame(ctx, idx * 16, a.name, f);
      idx++;
    }
  }

  return {
    canvas,
    frameWidth: 16,
    frameHeight: 16,
    frames: totalFrames,
    animations: {
      idle: { start: 0, end: 1, speed: 24 },
      move: { start: 2, end: 5, speed: 24 },
      attack: { start: 6, end: 8, speed: 24 },
      hurt: { start: 9, end: 10, speed: 24 },
      die: { start: 11, end: 13, speed: 24 },
    },
  };
}

function drawKnight(ctx: CanvasRenderingContext2D, ox: number, anim: string, frame: number): void {
  const armor = '#B0BEC5';
  const armorD = '#78909C';
  const tunic = '#42A5F5';
  const skin = '#FFCCBC';
  const sword = '#FFD54F';
  const swordH = '#FFF176';
  const eye = '#1A1A1A';
  const helmet = '#90A4AE';

  // Helmet
  px(ctx, ox+6, 2, helmet); px(ctx, ox+7, 2, helmet); px(ctx, ox+8, 2, helmet); px(ctx, ox+9, 2, helmet);
  px(ctx, ox+7, 1, helmet); px(ctx, ox+8, 1, helmet);
  // Face
  px(ctx, ox+6, 3, skin); px(ctx, ox+7, 3, skin); px(ctx, ox+8, 3, skin); px(ctx, ox+9, 3, skin);
  px(ctx, ox+6, 4, skin); px(ctx, ox+7, 4, eye); px(ctx, ox+8, 4, skin); px(ctx, ox+9, 4, eye);
  px(ctx, ox+7, 5, skin); px(ctx, ox+8, 5, skin);
  // Body armor
  for (let y = 6; y < 10; y++) {
    px(ctx, ox+6, y, armorD); px(ctx, ox+7, y, armor); px(ctx, ox+8, y, armor); px(ctx, ox+9, y, armorD);
  }
  // Tunic
  px(ctx, ox+6, 10, tunic); px(ctx, ox+7, 10, tunic); px(ctx, ox+8, 10, tunic); px(ctx, ox+9, 10, tunic);
  px(ctx, ox+6, 11, tunic); px(ctx, ox+7, 11, tunic); px(ctx, ox+8, 11, tunic); px(ctx, ox+9, 11, tunic);
  // Legs
  const legOff = anim === 'move' ? (frame % 2 === 0 ? 1 : -1) : 0;
  px(ctx, ox+7, 12, armorD); px(ctx, ox+8, 12, armorD);
  px(ctx, ox+7+legOff, 13, armorD); px(ctx, ox+8-legOff, 13, armorD);
  // Sword
  if (anim === 'attack') {
    const sy = 4 - frame;
    for (let i = 0; i < 4; i++) px(ctx, ox+11, sy+i, sword);
    px(ctx, ox+11, sy, swordH);
    px(ctx, ox+10, 6, armor); px(ctx, ox+11, 6, armor);
  } else {
    px(ctx, ox+10, 7, sword); px(ctx, ox+10, 8, sword); px(ctx, ox+10, 9, sword);
    px(ctx, ox+10, 7, swordH);
  }
  // Hurt flash
  if (anim === 'hurt') {
    px(ctx, ox+5, 5, '#FF5252'); px(ctx, ox+10, 3, '#FF5252');
  }
  // Die fade
  if (anim === 'die' && frame >= 1) {
    ctx.fillStyle = `rgba(0,0,0,${frame * 0.3})`;
    ctx.fillRect(ox, 0, 16, 16);
  }
}

function drawArcher(ctx: CanvasRenderingContext2D, ox: number, anim: string, frame: number): void {
  const hood = '#66BB6A';
  const hoodD = '#43A047';
  const clothes = '#8D6E63';
  const skin = '#FFCCBC';
  const bow = '#A1887F';
  const bowS = '#795548';
  const eye = '#1A1A1A';

  // Hood
  px(ctx, ox+6, 1, hoodD); px(ctx, ox+7, 1, hood); px(ctx, ox+8, 1, hood); px(ctx, ox+9, 1, hoodD);
  px(ctx, ox+5, 2, hoodD); px(ctx, ox+6, 2, hood); px(ctx, ox+7, 2, hood); px(ctx, ox+8, 2, hood); px(ctx, ox+9, 2, hood); px(ctx, ox+10, 2, hoodD);
  // Face
  px(ctx, ox+6, 3, skin); px(ctx, ox+7, 3, skin); px(ctx, ox+8, 3, skin); px(ctx, ox+9, 3, skin);
  px(ctx, ox+7, 4, eye); px(ctx, ox+9, 4, eye);
  px(ctx, ox+7, 5, skin); px(ctx, ox+8, 5, skin);
  // Body
  for (let y = 6; y < 11; y++) {
    px(ctx, ox+6, y, clothes); px(ctx, ox+7, y, clothes); px(ctx, ox+8, y, clothes); px(ctx, ox+9, y, clothes);
  }
  // Legs
  const legOff = anim === 'move' ? (frame % 2 === 0 ? 1 : 0) : 0;
  px(ctx, ox+7, 11+legOff, clothes); px(ctx, ox+8, 11, clothes);
  px(ctx, ox+7, 12, '#5D4037'); px(ctx, ox+8, 12+legOff, '#5D4037');
  // Bow
  if (anim === 'attack') {
    // Draw bow pulled back
    px(ctx, ox+11, 4, bow); px(ctx, ox+12, 5, bow); px(ctx, ox+12, 6, bow);
    px(ctx, ox+12, 7, bow); px(ctx, ox+12, 8, bow); px(ctx, ox+11, 9, bow);
    // String
    px(ctx, ox+11, 5, bowS); px(ctx, ox+11, 6, bowS); px(ctx, ox+11, 7, bowS); px(ctx, ox+11, 8, bowS);
    // Arrow
    if (frame >= 1) {
      px(ctx, ox+13, 7, '#FFD54F'); px(ctx, ox+14, 7, '#FFD54F'); px(ctx, ox+15, 7, '#FF5252');
    }
  } else {
    px(ctx, ox+10, 5, bow); px(ctx, ox+11, 6, bow); px(ctx, ox+11, 7, bow); px(ctx, ox+11, 8, bow); px(ctx, ox+10, 9, bow);
  }
  if (anim === 'hurt') {
    px(ctx, ox+5, 4, '#FF5252'); px(ctx, ox+10, 2, '#FF5252');
  }
  if (anim === 'die' && frame >= 1) {
    ctx.fillStyle = `rgba(0,0,0,${frame * 0.3})`;
    ctx.fillRect(ox, 0, 16, 16);
  }
}

function drawFlameBeast(ctx: CanvasRenderingContext2D, ox: number, anim: string, frame: number): void {
  const body = '#FF7043';
  const bodyD = '#E64A19';
  const flame = '#FFEB3B';
  const flameD = '#FFC107';
  const eye = '#FFF176';
  const eyeP = '#1A1A1A';

  // Flame crown
  const fOff = frame % 2;
  px(ctx, ox+6, 1+fOff, flame); px(ctx, ox+8, 1-fOff+1, flame); px(ctx, ox+10, 1+fOff, flame);
  px(ctx, ox+7, 2, flameD); px(ctx, ox+9, 2, flameD);
  // Head
  for (let y = 3; y < 6; y++) {
    px(ctx, ox+5, y, bodyD); px(ctx, ox+6, y, body); px(ctx, ox+7, y, body);
    px(ctx, ox+8, y, body); px(ctx, ox+9, y, body); px(ctx, ox+10, y, bodyD);
  }
  // Eyes
  px(ctx, ox+6, 4, eye); px(ctx, ox+7, 4, eyeP); px(ctx, ox+9, 4, eye); px(ctx, ox+10, 4, eyeP);
  // Body
  for (let y = 6; y < 11; y++) {
    px(ctx, ox+4, y, bodyD); px(ctx, ox+5, y, body); px(ctx, ox+6, y, body);
    px(ctx, ox+7, y, body); px(ctx, ox+8, y, body); px(ctx, ox+9, y, body);
    px(ctx, ox+10, y, body); px(ctx, ox+11, y, bodyD);
  }
  // Belly glow
  px(ctx, ox+7, 8, flame); px(ctx, ox+8, 8, flameD); px(ctx, ox+7, 9, flameD); px(ctx, ox+8, 9, flame);
  // Legs
  const lo = anim === 'move' ? (frame % 2) : 0;
  px(ctx, ox+5, 11+lo, bodyD); px(ctx, ox+6, 11, bodyD); px(ctx, ox+9, 11+lo, bodyD); px(ctx, ox+10, 11, bodyD);
  px(ctx, ox+5, 12, bodyD); px(ctx, ox+10, 12, bodyD);
  // Attack: fire breath
  if (anim === 'attack') {
    const fc = ['#FF5722', '#FF9800', '#FFEB3B'][frame];
    for (let i = 0; i < 3 + frame; i++) {
      px(ctx, ox+12+i, 5, fc); px(ctx, ox+12+i, 6, fc); px(ctx, ox+12+i, 7, fc);
    }
  }
  if (anim === 'hurt') {
    px(ctx, ox+4, 3, '#FFFFFF'); px(ctx, ox+11, 5, '#FFFFFF');
  }
  if (anim === 'die' && frame >= 1) {
    ctx.fillStyle = `rgba(0,0,0,${frame * 0.3})`;
    ctx.fillRect(ox, 0, 16, 16);
  }
}

function drawJelly(ctx: CanvasRenderingContext2D, ox: number, anim: string, frame: number): void {
  const body = '#4DD0E1';
  const bodyL = '#80DEEA';
  const bodyD = '#26C6DA';
  const shine = '#E0F7FA';
  const eye = '#1A1A1A';

  // Wobble effect
  const squish = anim === 'move' ? (frame % 2 === 0 ? 1 : -1) : (anim === 'idle' ? (frame === 0 ? 0 : 1) : 0);
  const w = 4 + squish;
  const h = 5 - squish;

  const cx = 8, cy = 8;
  // Draw blob shape
  for (let dy = -h; dy <= h; dy++) {
    const rowW = Math.floor(w * Math.sqrt(1 - (dy * dy) / (h * h + 0.1)));
    for (let dx = -rowW; dx <= rowW; dx++) {
      const px2 = ox + cx + dx;
      const py = cy + dy;
      if (px2 >= ox && px2 < ox + 16 && py >= 0 && py < 16) {
        const edge = Math.abs(dx) === rowW || Math.abs(dy) === h;
        ctx.fillStyle = edge ? bodyD : (dx < 0 && dy < 0 ? bodyL : body);
        ctx.fillRect(px2, py, 1, 1);
      }
    }
  }
  // Shine
  px(ctx, ox+6, 5, shine); px(ctx, ox+7, 5, shine);
  // Eyes
  px(ctx, ox+6, 7, eye); px(ctx, ox+9, 7, eye);
  // Mouth
  px(ctx, ox+7, 9, eye); px(ctx, ox+8, 9, eye);
  // Attack lunge
  if (anim === 'attack') {
    px(ctx, ox+11, 7, bodyD); px(ctx, ox+12, 7, bodyD); px(ctx, ox+12, 8, bodyD);
  }
  if (anim === 'hurt') {
    px(ctx, ox+5, 4, '#FF5252'); px(ctx, ox+10, 6, '#FF5252');
  }
  if (anim === 'die' && frame >= 1) {
    ctx.fillStyle = `rgba(0,0,0,${frame * 0.3})`;
    ctx.fillRect(ox, 0, 16, 16);
  }
}

export function generateCreatureSprites(): Record<string, SpriteSheet> {
  return {
    knight: makeCreatureSheet(drawKnight),
    archer: makeCreatureSheet(drawArcher),
    flameBeast: makeCreatureSheet(drawFlameBeast),
    jelly: makeCreatureSheet(drawJelly),
  };
}
