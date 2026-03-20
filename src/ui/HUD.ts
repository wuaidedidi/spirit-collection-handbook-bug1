import { Player } from '../entities/Player';
import { SpriteAtlas } from '../assets/SpriteTypes';
import { COLORS } from '../utils/constants';

export class HUD {
  private atlas: SpriteAtlas;

  constructor(atlas: SpriteAtlas) {
    this.atlas = atlas;
  }

  render(ctx: CanvasRenderingContext2D, player: Player, fps: number, screenW: number, screenH: number): void {
    // Gold display - top left
    this.renderGold(ctx, player, 12, 12);

    // HP bar - top right
    this.renderHP(ctx, player, screenW - 220, 12);

    // FPS counter - top right corner
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(12, 12, 65, 22);
    ctx.fillStyle = '#aaa';
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText(`FPS: ${fps}`, 18, 28);

    // Terrain info
    const terrain = player.visitedTerrains.size;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(12, 52, 160, 22);
    ctx.fillStyle = '#aaa';
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText(`已探索地形: ${terrain}/5`, 18, 67);

    // Controls hint
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(12, 80, 200, 60);
    ctx.fillStyle = '#888';
    ctx.font = '11px "Courier New", monospace';
    ctx.fillText('WASD:移动 Q:背包 M:商城', 18, 95);
    ctx.fillText('1-0:快捷栏 点击:捕捉/交互', 18, 110);
    ctx.fillText('鼠标点击生物进行捕捉', 18, 125);
  }

  private renderGold(ctx: CanvasRenderingContext2D, player: Player, x: number, y: number): void {
    // Background
    ctx.fillStyle = COLORS.uiBg;
    ctx.beginPath();
    ctx.roundRect(x, y, 140, 32, 6);
    ctx.fill();
    ctx.strokeStyle = COLORS.uiBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, 140, 32, 6);
    ctx.stroke();

    // Coin icon + gold text (both vertically centered in 32px bar)
    const coinSheet = this.atlas.items['coin'];
    const iconSize = 20;
    const centerY = y + 16;
    if (coinSheet) {
      ctx.drawImage(coinSheet.canvas, 0, 0, 16, 16, x + 8, Math.round(centerY - iconSize / 2), iconSize, iconSize);
    }

    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`-${player.gold}`, x + 8 + iconSize + 4, centerY + 1);
    ctx.textBaseline = 'alphabetic';
  }

  private renderHP(ctx: CanvasRenderingContext2D, player: Player, x: number, y: number): void {
    const barW = 200;
    const barH = 32;

    // Background
    ctx.fillStyle = COLORS.uiBg;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, 6);
    ctx.fill();
    ctx.strokeStyle = COLORS.uiBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, 6);
    ctx.stroke();

    // Cat portrait icon
    const catSheet = this.atlas.items['catPortrait'];
    if (catSheet) {
      ctx.drawImage(catSheet.canvas, 0, 0, 16, 16, x + 6, y + 8, 16, 16);
    }

    // HP bar
    const hpRatio = player.stats.hp / player.stats.maxHp;
    const hpBarX = x + 28;
    const hpBarY = y + 8;
    const hpBarW = barW - 40;
    const hpBarH = 16;

    ctx.fillStyle = COLORS.hpBg;
    ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);

    const hpColor = hpRatio > 0.5 ? COLORS.hpRed : hpRatio > 0.2 ? '#FFC107' : COLORS.hpGreen;
    ctx.fillStyle = hpColor;
    ctx.fillRect(hpBarX, hpBarY, hpBarW * hpRatio, hpBarH);

    // HP text
    ctx.fillStyle = COLORS.white;
    ctx.font = '11px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${player.stats.hp}/${player.stats.maxHp}`, hpBarX + hpBarW / 2, hpBarY + 12);
    ctx.textAlign = 'left';
  }
}
