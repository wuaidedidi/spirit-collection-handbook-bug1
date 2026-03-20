// Game constants
export const TILE_SIZE = 16;
export const CHUNK_TILES = 32;
export const CHUNK_SIZE = TILE_SIZE * CHUNK_TILES; // 512px
export const RENDER_DISTANCE = 2; // chunks in each direction
export const WORLD_SEED = 42;

// Player
export const PLAYER_SPEED = 48; // 3 pixel units per second (3 × 16px)
export const PLAYER_INITIAL_HP = 300;
export const PLAYER_INITIAL_GOLD = 100;

// Terrain
export const TERRAIN_TYPES = ["grassland", "highland", "desert", "ocean", "volcano", "dungeon"] as const;
export type TerrainType = (typeof TERRAIN_TYPES)[number];

// Terrain animation periods (seconds)
export const TERRAIN_ANIM = {
  grassland: { frames: 2, period: 0.8 },
  highland: { frames: 1, period: 1 },
  desert: { frames: 2, period: 1.2 },
  ocean: { frames: 3, period: 0.6 },
  volcano: { frames: 3, period: 0.5 },
  dungeon: { frames: 1, period: 1 },
} as const;

// Terrain effects
export const OCEAN_SPEED_MODIFIER = 0.7; // 30% slower
export const VOLCANO_DAMAGE_PER_SEC = 20;

// Creatures
export const CREATURE_TYPES = ["knight", "archer", "flameBeast", "jelly"] as const;
export type CreatureType = (typeof CREATURE_TYPES)[number];

export const CREATURE_NAMES: Record<CreatureType, string> = {
  knight: "小骑士",
  archer: "小弓箭手",
  flameBeast: "烈焰兽",
  jelly: "果冻冻",
};

export const CREATURE_CONFIG: Record<
  CreatureType,
  {
    speed: number;
    attackRange: number;
    attackInterval: number;
    minHp: number;
    maxHp: number;
    minAtk: number;
    maxAtk: number;
  }
> = {
  knight: { speed: 32, attackRange: 100, attackInterval: 2, minHp: 50, maxHp: 200, minAtk: 10, maxAtk: 30 },
  archer: { speed: 24, attackRange: 300, attackInterval: 3, minHp: 50, maxHp: 200, minAtk: 10, maxAtk: 30 },
  flameBeast: { speed: 48, attackRange: 150, attackInterval: 2.5, minHp: 50, maxHp: 200, minAtk: 10, maxAtk: 30 },
  jelly: { speed: 32, attackRange: 80, attackInterval: 1.5, minHp: 50, maxHp: 200, minAtk: 10, maxAtk: 30 },
};

export const CREATURE_ALERT_RANGE = 200;

// Items
export const BALL_TYPES = ["normalBall", "greatBall", "ultraBall"] as const;
export type BallType = (typeof BALL_TYPES)[number];

export const BALL_CONFIG: Record<
  BallType,
  {
    name: string;
    price: number;
    catchRate: number;
    maxBuy: number;
  }
> = {
  normalBall: { name: "普通精灵球", price: 5, catchRate: 0.4, maxBuy: 999 },
  greatBall: { name: "高级精灵球", price: 15, catchRate: 0.6, maxBuy: 10 },
  ultraBall: { name: "超级精灵球", price: 30, catchRate: 0.99, maxBuy: 5 },
};

// Inventory
export const BACKPACK_SIZE = 30;
export const HOTBAR_SIZE = 10;

// UI
export const UI_SCALE = 2;
export const SLOT_SIZE = 36;
export const SLOT_PADDING = 4;

// Colors
export const COLORS = {
  gold: "#ffd700",
  goldDark: "#b8860b",
  hpRed: "#e74c3c",
  hpGreen: "#2ecc71",
  hpBg: "#333",
  uiBg: "rgba(20, 20, 40, 0.85)",
  uiBorder: "rgba(255, 215, 0, 0.6)",
  uiText: "#e0e0e0",
  uiHighlight: "rgba(255, 215, 0, 0.3)",
  slotBg: "rgba(40, 40, 60, 0.9)",
  slotSelected: "rgba(255, 215, 0, 0.5)",
  slotHover: "rgba(255, 255, 255, 0.15)",
  white: "#ffffff",
  black: "#000000",
  shadow: "rgba(0,0,0,0.5)",
};
