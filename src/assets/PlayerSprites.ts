import { SpriteSheet, createCanvas, drawPixels } from './SpriteTypes';

const P: Record<string, string> = {
  o: '#E8A040', // orange body
  d: '#C07830', // dark orange stripes
  p: '#FF9090', // pink ears/nose
  w: '#F0E0D0', // white belly
  e: '#1A1A1A', // eyes
  n: '#FF7070', // nose
  t: '#D09030', // tail
  b: '#C08030', // darker body shadow
};

// Cat facing south (front view) - idle
const catSouthIdle: string[][] = [
  '................'.split(''),
  '................'.split(''),
  '..pp..pp........'.split(''),
  '.pooo.ooop......'.split(''),
  '.oooooooop......'.split(''),
  '.oe.oo.eop......'.split(''),
  '.ooo.nooop......'.split(''),
  '..oowwoop.......'.split(''),
  '...owwwo........'.split(''),
  '..dowwwod.......'.split(''),
  '..oowwwoo.......'.split(''),
  '..oowwwoo.......'.split(''),
  '...owwwo........'.split(''),
  '...o..o.........'.split(''),
  '...o..o.........'.split(''),
  '................'.split(''),
];

// Cat south walk frames (4 frames with leg movement)
const catSouthWalk1: string[][] = [
  '................'.split(''),
  '................'.split(''),
  '..pp..pp........'.split(''),
  '.pooo.ooop......'.split(''),
  '.oooooooop......'.split(''),
  '.oe.oo.eop......'.split(''),
  '.ooo.nooop......'.split(''),
  '..oowwoop.......'.split(''),
  '...owwwo........'.split(''),
  '..dowwwod.......'.split(''),
  '..oowwwoo.......'.split(''),
  '..oowwwoo.......'.split(''),
  '...owwwo........'.split(''),
  '..o....o........'.split(''),
  '..o.....o.......'.split(''),
  '................'.split(''),
];

const catSouthWalk2: string[][] = [
  '................'.split(''),
  '................'.split(''),
  '..pp..pp........'.split(''),
  '.pooo.ooop......'.split(''),
  '.oooooooop......'.split(''),
  '.oe.oo.eop......'.split(''),
  '.ooo.nooop......'.split(''),
  '..oowwoop.......'.split(''),
  '...owwwo........'.split(''),
  '..dowwwod.......'.split(''),
  '..oowwwoo.......'.split(''),
  '..oowwwoo.......'.split(''),
  '...owwwo........'.split(''),
  '...o..o.........'.split(''),
  '...o..o.........'.split(''),
  '................'.split(''),
];

const catSouthWalk3: string[][] = [
  '................'.split(''),
  '................'.split(''),
  '..pp..pp........'.split(''),
  '.pooo.ooop......'.split(''),
  '.oooooooop......'.split(''),
  '.oe.oo.eop......'.split(''),
  '.ooo.nooop......'.split(''),
  '..oowwoop.......'.split(''),
  '...owwwo........'.split(''),
  '..dowwwod.......'.split(''),
  '..oowwwoo.......'.split(''),
  '..oowwwoo.......'.split(''),
  '...owwwo........'.split(''),
  '....o.o.........'.split(''),
  '...o...o........'.split(''),
  '................'.split(''),
];

const catSouthWalk4: string[][] = catSouthWalk1.map(r => [...r]);

// Cat facing north (back view)
const catNorthIdle: string[][] = [
  '................'.split(''),
  '................'.split(''),
  '..dd..dd........'.split(''),
  '.dooo.oood......'.split(''),
  '.ooooooood......'.split(''),
  '.ooddddood......'.split(''),
  '.ooooooood......'.split(''),
  '..ooooood.......'.split(''),
  '...ooooo........'.split(''),
  '..doooood.......'.split(''),
  '..ooddooo.......'.split(''),
  '..ooooooo.......'.split(''),
  '...ooooo........'.split(''),
  '...o..o......t..'.split(''),
  '...o..o.....t...'.split(''),
  '................'.split(''),
];

const catNorthWalk1: string[][] = [
  '................'.split(''),
  '................'.split(''),
  '..dd..dd........'.split(''),
  '.dooo.oood......'.split(''),
  '.ooooooood......'.split(''),
  '.ooddddood......'.split(''),
  '.ooooooood......'.split(''),
  '..ooooood.......'.split(''),
  '...ooooo........'.split(''),
  '..doooood.......'.split(''),
  '..ooddooo.......'.split(''),
  '..ooooooo.......'.split(''),
  '...ooooo........'.split(''),
  '..o....o.....t..'.split(''),
  '..o.....o...t...'.split(''),
  '................'.split(''),
];

const catNorthWalk2: string[][] = [
  '................'.split(''),
  '................'.split(''),
  '..dd..dd........'.split(''),
  '.dooo.oood......'.split(''),
  '.ooooooood......'.split(''),
  '.ooddddood......'.split(''),
  '.ooooooood......'.split(''),
  '..ooooood.......'.split(''),
  '...ooooo........'.split(''),
  '..doooood.......'.split(''),
  '..ooddooo.......'.split(''),
  '..ooooooo.......'.split(''),
  '...ooooo........'.split(''),
  '...o..o......t..'.split(''),
  '...o..o.....t...'.split(''),
  '................'.split(''),
];

const catNorthWalk3: string[][] = [
  '................'.split(''),
  '................'.split(''),
  '..dd..dd........'.split(''),
  '.dooo.oood......'.split(''),
  '.ooooooood......'.split(''),
  '.ooddddood......'.split(''),
  '.ooooooood......'.split(''),
  '..ooooood.......'.split(''),
  '...ooooo........'.split(''),
  '..doooood.......'.split(''),
  '..ooddooo.......'.split(''),
  '..ooooooo.......'.split(''),
  '...ooooo........'.split(''),
  '....o.o......t..'.split(''),
  '...o...o....t...'.split(''),
  '................'.split(''),
];

// Cat facing east (side view)
const catEastIdle: string[][] = [
  '................'.split(''),
  '................'.split(''),
  '....pp..........'.split(''),
  '...pooop........'.split(''),
  '...ooooo........'.split(''),
  '...oe.oo........'.split(''),
  '...oonoo........'.split(''),
  '....ooo.........'.split(''),
  '..ddoooo........'.split(''),
  '..oowwoo........'.split(''),
  '..oowwoo........'.split(''),
  '..oowwoo........'.split(''),
  '...owwo.........'.split(''),
  '...o.o..........'.split(''),
  '...o.o..........'.split(''),
  '................'.split(''),
];

const catEastWalk1: string[][] = [
  '................'.split(''),
  '................'.split(''),
  '....pp..........'.split(''),
  '...pooop........'.split(''),
  '...ooooo........'.split(''),
  '...oe.oo........'.split(''),
  '...oonoo........'.split(''),
  '....ooo.........'.split(''),
  '..ddoooo........'.split(''),
  '..oowwoo........'.split(''),
  '..oowwoo........'.split(''),
  '..oowwoo........'.split(''),
  '...owwo.........'.split(''),
  '..o..o..........'.split(''),
  '..o...o.........'.split(''),
  '................'.split(''),
];

const catEastWalk2: string[][] = [
  '................'.split(''),
  '................'.split(''),
  '....pp..........'.split(''),
  '...pooop........'.split(''),
  '...ooooo........'.split(''),
  '...oe.oo........'.split(''),
  '...oonoo........'.split(''),
  '....ooo.........'.split(''),
  '..ddoooo........'.split(''),
  '..oowwoo........'.split(''),
  '..oowwoo........'.split(''),
  '..oowwoo........'.split(''),
  '...owwo.........'.split(''),
  '...o.o..........'.split(''),
  '...o.o..........'.split(''),
  '................'.split(''),
];

const catEastWalk3: string[][] = [
  '................'.split(''),
  '................'.split(''),
  '....pp..........'.split(''),
  '...pooop........'.split(''),
  '...ooooo........'.split(''),
  '...oe.oo........'.split(''),
  '...oonoo........'.split(''),
  '....ooo.........'.split(''),
  '..ddoooo........'.split(''),
  '..oowwoo........'.split(''),
  '..oowwoo........'.split(''),
  '..oowwoo........'.split(''),
  '...owwo.........'.split(''),
  '....oo..........'.split(''),
  '...o..o.........'.split(''),
  '................'.split(''),
];

// Cat facing west (side view mirrored)
const catWestIdle: string[][] = catEastIdle.map(row => [...row].reverse());
const catWestWalk1: string[][] = catEastWalk1.map(row => [...row].reverse());
const catWestWalk2: string[][] = catEastWalk2.map(row => [...row].reverse());
const catWestWalk3: string[][] = catEastWalk3.map(row => [...row].reverse());

function generateDirectionFrames(idle: string[][], walks: string[][][]): string[][][] {
  const walkFrames: string[][][] = walks.length === 4 ? walks : [idle, idle, idle, idle];
  return [idle, ...walkFrames];
}

export function generatePlayerSprites(): Record<string, SpriteSheet> {
  const directions: Record<string, string[][][]> = {
    south: generateDirectionFrames(catSouthIdle, [catSouthWalk1, catSouthWalk2, catSouthWalk3, catSouthWalk4]),
    north: generateDirectionFrames(catNorthIdle, [catNorthWalk1, catNorthWalk2, catNorthWalk3, catNorthWalk1]),
    east: generateDirectionFrames(catEastIdle, [catEastWalk1, catEastWalk2, catEastWalk3, catEastWalk1]),
    west: generateDirectionFrames(catWestIdle, [catWestWalk1, catWestWalk2, catWestWalk3, catWestWalk1]),
    // Diagonal directions
    southeast: generateDirectionFrames(catSouthIdle, [catSouthWalk1, catSouthWalk2, catSouthWalk3, catSouthWalk4]),
    southwest: generateDirectionFrames(catSouthIdle, [catSouthWalk1, catSouthWalk2, catSouthWalk3, catSouthWalk4]),
    northeast: generateDirectionFrames(catNorthIdle, [catNorthWalk1, catNorthWalk2, catNorthWalk3, catNorthWalk1]),
    northwest: generateDirectionFrames(catNorthIdle, [catNorthWalk1, catNorthWalk2, catNorthWalk3, catNorthWalk1]),
  };

  const result: Record<string, SpriteSheet> = {};

  for (const [dir, frames] of Object.entries(directions)) {
    const totalFrames = frames.length; // 5: 1 idle + 4 walk
    const { canvas, ctx } = createCanvas(16 * totalFrames, 16);

    for (let f = 0; f < totalFrames; f++) {
      drawPixels(ctx, f * 16, 0, frames[f], P);
    }

    result[dir] = {
      canvas,
      frameWidth: 16,
      frameHeight: 16,
      frames: totalFrames,
      animations: {
        idle: { start: 0, end: 0, speed: 24 },
        move: { start: 1, end: 4, speed: 24 },
      },
    };
  }

  return result;
}
