import { SpriteSheet, createCanvas, px } from './SpriteTypes';

export function generateItemSprites(): Record<string, SpriteSheet> {
  const result: Record<string, SpriteSheet> = {};

  // Normal Ball - red/white
  {
    const { canvas, ctx } = createCanvas(16, 16);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const dist = Math.sqrt((x - 7.5) ** 2 + (y - 7.5) ** 2);
        if (dist < 6.5) {
          if (y < 8) {
            ctx.fillStyle = dist < 5.5 ? '#F44336' : '#D32F2F';
          } else if (y === 8) {
            ctx.fillStyle = '#212121';
          } else {
            ctx.fillStyle = dist < 5.5 ? '#FAFAFA' : '#E0E0E0';
          }
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    // Button
    px(ctx, 7, 7, '#FAFAFA'); px(ctx, 8, 7, '#FAFAFA');
    px(ctx, 7, 8, '#212121'); px(ctx, 8, 8, '#212121');
    px(ctx, 7, 9, '#FAFAFA'); px(ctx, 8, 9, '#FAFAFA');
    // Highlight
    px(ctx, 5, 4, '#FF8A80'); px(ctx, 6, 3, '#FF8A80');
    result['normalBall'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 1 };
  }

  // Great Ball - blue/white
  {
    const { canvas, ctx } = createCanvas(16, 16);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const dist = Math.sqrt((x - 7.5) ** 2 + (y - 7.5) ** 2);
        if (dist < 6.5) {
          if (y < 8) {
            ctx.fillStyle = dist < 5.5 ? '#2196F3' : '#1976D2';
          } else if (y === 8) {
            ctx.fillStyle = '#212121';
          } else {
            ctx.fillStyle = dist < 5.5 ? '#FAFAFA' : '#E0E0E0';
          }
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    // Red stripes on top
    for (let x = 4; x < 12; x++) { px(ctx, x, 4, '#F44336'); px(ctx, x, 5, '#F44336'); }
    // Button
    px(ctx, 7, 7, '#FAFAFA'); px(ctx, 8, 7, '#FAFAFA');
    px(ctx, 7, 8, '#212121'); px(ctx, 8, 8, '#212121');
    px(ctx, 7, 9, '#FAFAFA'); px(ctx, 8, 9, '#FAFAFA');
    px(ctx, 5, 3, '#64B5F6'); px(ctx, 6, 2, '#64B5F6');
    result['greatBall'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 1 };
  }

  // Ultra Ball - black/gold
  {
    const { canvas, ctx } = createCanvas(16, 16);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const dist = Math.sqrt((x - 7.5) ** 2 + (y - 7.5) ** 2);
        if (dist < 6.5) {
          if (y < 8) {
            ctx.fillStyle = dist < 5.5 ? '#212121' : '#111111';
          } else if (y === 8) {
            ctx.fillStyle = '#FFD700';
          } else {
            ctx.fillStyle = dist < 5.5 ? '#FFD700' : '#FFA000';
          }
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    // H pattern on top
    px(ctx, 5, 3, '#FFD700'); px(ctx, 5, 4, '#FFD700'); px(ctx, 5, 5, '#FFD700'); px(ctx, 5, 6, '#FFD700');
    px(ctx, 10, 3, '#FFD700'); px(ctx, 10, 4, '#FFD700'); px(ctx, 10, 5, '#FFD700'); px(ctx, 10, 6, '#FFD700');
    px(ctx, 6, 5, '#FFD700'); px(ctx, 7, 5, '#FFD700'); px(ctx, 8, 5, '#FFD700'); px(ctx, 9, 5, '#FFD700');
    // Button
    px(ctx, 7, 7, '#FFD700'); px(ctx, 8, 7, '#FFD700');
    px(ctx, 7, 8, '#FFD700'); px(ctx, 8, 8, '#FFD700');
    px(ctx, 7, 9, '#FFD700'); px(ctx, 8, 9, '#FFD700');
    result['ultraBall'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 1 };
  }

  // Coin
  {
    const { canvas, ctx } = createCanvas(16, 16);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const dist = Math.sqrt((x - 7.5) ** 2 + (y - 7.5) ** 2);
        if (dist < 6) {
          const edge = dist > 5;
          ctx.fillStyle = edge ? '#FFA000' : (x < 7 && y < 7 ? '#FFECB3' : '#FFD700');
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    // $ symbol
    px(ctx, 7, 4, '#B8860B'); px(ctx, 8, 4, '#B8860B');
    px(ctx, 6, 5, '#B8860B'); px(ctx, 7, 6, '#B8860B'); px(ctx, 8, 6, '#B8860B');
    px(ctx, 9, 7, '#B8860B'); px(ctx, 8, 8, '#B8860B'); px(ctx, 7, 8, '#B8860B');
    px(ctx, 6, 9, '#B8860B'); px(ctx, 7, 10, '#B8860B'); px(ctx, 8, 10, '#B8860B');
    px(ctx, 9, 9, '#B8860B');
    px(ctx, 7, 11, '#B8860B'); px(ctx, 8, 11, '#B8860B');
    result['coin'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 1 };
  }

  // Heart
  {
    const { canvas, ctx } = createCanvas(16, 16);
    const heartShape = [
      '................',
      '................',
      '..rr....rr......',
      '.rRRr..rRRr.....',
      '.rRRRrrRRRr.....',
      '.rRRRRRRRRr.....',
      '..rRRRRRRr......',
      '...rRRRRr.......',
      '....rRRr........',
      '.....rr.........',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
    ];
    const hp: Record<string, string> = { r: '#C62828', R: '#E53935', '.': '' };
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const c = heartShape[y][x];
        if (c !== '.' && hp[c]) { px(ctx, x, y, hp[c]); }
      }
    }
    // Highlight
    px(ctx, 4, 3, '#EF9A9A'); px(ctx, 5, 3, '#EF9A9A');
    result['heart'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 1 };
  }

  // Cat portrait (for HP bar icon)
  {
    const { canvas, ctx } = createCanvas(16, 16);
    const o = '#E8A040', d = '#C07830', p = '#FF9090', w = '#F0E0D0', e = '#1A1A1A', n = '#FF7070';
    // Ears
    px(ctx, 3, 1, p); px(ctx, 4, 1, p); px(ctx, 11, 1, p); px(ctx, 12, 1, p);
    px(ctx, 2, 2, o); px(ctx, 3, 2, p); px(ctx, 4, 2, o); px(ctx, 11, 2, o); px(ctx, 12, 2, p); px(ctx, 13, 2, o);
    // Head top
    for (let x = 3; x <= 12; x++) px(ctx, x, 3, o);
    for (let x = 2; x <= 13; x++) px(ctx, x, 4, o);
    // Eyes row
    for (let x = 2; x <= 13; x++) px(ctx, x, 5, o);
    px(ctx, 4, 5, e); px(ctx, 5, 5, e); px(ctx, 10, 5, e); px(ctx, 11, 5, e);
    // Nose/mouth
    for (let x = 2; x <= 13; x++) px(ctx, x, 6, o);
    px(ctx, 7, 6, n); px(ctx, 8, 6, n);
    // Cheeks
    for (let x = 2; x <= 13; x++) px(ctx, x, 7, o);
    px(ctx, 3, 7, p); px(ctx, 12, 7, p);
    // Whiskers area
    for (let x = 3; x <= 12; x++) px(ctx, x, 8, o);
    px(ctx, 5, 8, w); px(ctx, 6, 8, w); px(ctx, 9, 8, w); px(ctx, 10, 8, w);
    // Lower face
    for (let x = 3; x <= 12; x++) px(ctx, x, 9, o);
    for (let x = 4; x <= 11; x++) px(ctx, x, 10, o);
    for (let x = 5; x <= 10; x++) px(ctx, x, 11, d);
    // Highlight
    px(ctx, 4, 4, '#F0C060'); px(ctx, 5, 4, '#F0C060');
    result['catPortrait'] = { canvas, frameWidth: 16, frameHeight: 16, frames: 1 };
  }

  return result;
}

export function generateUISprites(): Record<string, SpriteSheet> {
  const result: Record<string, SpriteSheet> = {};

  // Slot background 20x20
  {
    const { canvas, ctx } = createCanvas(20, 20);
    ctx.fillStyle = 'rgba(40, 40, 60, 0.9)';
    ctx.fillRect(0, 0, 20, 20);
    ctx.strokeStyle = 'rgba(100, 100, 140, 0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, 19, 19);
    result['slot'] = { canvas, frameWidth: 20, frameHeight: 20, frames: 1 };
  }

  // Selected slot 20x20
  {
    const { canvas, ctx } = createCanvas(20, 20);
    ctx.fillStyle = 'rgba(60, 60, 80, 0.95)';
    ctx.fillRect(0, 0, 20, 20);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 18, 18);
    ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
    ctx.fillRect(2, 2, 16, 16);
    result['slotSelected'] = { canvas, frameWidth: 20, frameHeight: 20, frames: 1 };
  }

  // Button background 48x16
  {
    const { canvas, ctx } = createCanvas(48, 16);
    ctx.fillStyle = 'rgba(40, 40, 60, 0.9)';
    ctx.beginPath();
    ctx.roundRect(0, 0, 48, 16, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(0.5, 0.5, 47, 15, 3);
    ctx.stroke();
    result['buttonBg'] = { canvas, frameWidth: 48, frameHeight: 16, frames: 1 };
  }

  return result;
}
