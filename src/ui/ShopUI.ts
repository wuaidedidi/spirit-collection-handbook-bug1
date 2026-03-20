import { Player } from '../entities/Player';
import { Inventory } from '../systems/Inventory';
import { ShopSystem } from '../systems/ShopSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { SpriteAtlas } from '../assets/SpriteTypes';
import { COLORS, BallType } from '../utils/constants';

export class ShopUI {
  private atlas: SpriteAtlas;
  private quantities: number[] = [1, 1, 1];
  private notification: { text: string; color: string; timer: number } | null = null;

  constructor(atlas: SpriteAtlas) {
    this.atlas = atlas;
  }

  private showNotification(text: string, color: string): void {
    this.notification = { text, color, timer: 2.0 };
  }

  updateNotification(dt: number): void {
    if (this.notification) {
      this.notification.timer -= dt;
      if (this.notification.timer <= 0) this.notification = null;
    }
  }

  render(ctx: CanvasRenderingContext2D, shop: ShopSystem, player: Player, screenW: number, screenH: number): void {
    if (!shop.isOpen) return;

    const panelW = 340;
    const panelH = 330;
    const px = (screenW - panelW) / 2;
    const py = (screenH - panelH) / 2;

    // Background overlay
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, screenW, screenH);

    // Panel
    ctx.fillStyle = 'rgba(15, 15, 35, 0.97)';
    ctx.beginPath();
    ctx.roundRect(px, py, panelW, panelH, 12);
    ctx.fill();
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(px, py, panelW, panelH, 12);
    ctx.stroke();

    // Title
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('背  包', px + panelW / 2, py + 22);

    // Subtitle
    ctx.fillStyle = 'rgba(200,200,200,0.5)';
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText('按 M 关闭', px + panelW / 2, py + 40);

    // Notification message
    if (this.notification) {
      const alpha = Math.min(1, this.notification.timer / 0.3);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.notification.color;
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText(this.notification.text, px + panelW / 2, py + panelH - 14);
      ctx.globalAlpha = 1;
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Separator line
    ctx.strokeStyle = 'rgba(255,215,0,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 16, py + 52);
    ctx.lineTo(px + panelW - 16, py + 52);
    ctx.stroke();

    // Items
    const items = shop.getItems();
    const itemH = 76;
    const itemGap = 10;
    const startY = py + 60;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const iy = startY + i * (itemH + itemGap);

      // Item row background
      ctx.fillStyle = 'rgba(40, 40, 65, 0.8)';
      ctx.beginPath();
      ctx.roundRect(px + 12, iy, panelW - 24, itemH, 8);
      ctx.fill();

      // Ball icon (vertically centered in row)
      const ballSheet = this.atlas.items[item.type];
      const iconSize = 36;
      if (ballSheet) {
        ctx.drawImage(ballSheet.canvas, 0, 0, 16, 16, px + 20, iy + (itemH - iconSize) / 2, iconSize, iconSize);
      }

      // Item info (left side)
      const infoX = px + 64;
      ctx.textBaseline = 'middle';

      ctx.fillStyle = COLORS.white;
      ctx.font = 'bold 13px "Courier New", monospace';
      ctx.fillText(item.name, infoX, iy + 18);

      ctx.fillStyle = '#bbb';
      ctx.font = '11px "Courier New", monospace';
      ctx.fillText(`价格: ${item.price}金币  捕捉率: ${(item.catchRate * 100).toFixed(0)}%`, infoX, iy + 36);
      ctx.fillText(`限购: ${item.maxBuy === 999 ? '无限' : item.maxBuy + '个'}`, infoX, iy + 52);

      // Right side: quantity controls + buy button (vertically centered)
      const rightX = px + panelW - 100;
      const rowCenterY = iy + itemH / 2;
      const btnSize = 22;

      // Quantity row (centered at rowCenterY - 12)
      const qtyY = rowCenterY - 14;

      // Minus button [-]
      ctx.fillStyle = 'rgba(60, 60, 90, 0.9)';
      ctx.beginPath();
      ctx.roundRect(rightX - 20, qtyY - btnSize / 2, btnSize, btnSize, 4);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(rightX - 20, qtyY - btnSize / 2, btnSize, btnSize, 4);
      ctx.stroke();
      ctx.fillStyle = COLORS.white;
      ctx.font = 'bold 14px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('-', rightX - 20 + btnSize / 2, qtyY);

      // Quantity display
      ctx.fillStyle = COLORS.uiText;
      ctx.font = 'bold 13px "Courier New", monospace';
      ctx.fillText(`x${this.quantities[i]}`, rightX + 18, qtyY);

      // Plus button [+]
      ctx.fillStyle = 'rgba(60, 60, 90, 0.9)';
      ctx.beginPath();
      ctx.roundRect(rightX + 38, qtyY - btnSize / 2, btnSize, btnSize, 4);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(rightX + 38, qtyY - btnSize / 2, btnSize, btnSize, 4);
      ctx.stroke();
      ctx.fillStyle = COLORS.white;
      ctx.font = 'bold 14px "Courier New", monospace';
      ctx.fillText('+', rightX + 38 + btnSize / 2, qtyY);

      // Buy button (centered at rowCenterY + 14)
      const buyY = rowCenterY + 14;
      const buyW = 60;
      const buyH = 24;
      ctx.fillStyle = player.gold >= item.price * this.quantities[i] ? '#4CAF50' : '#666';
      ctx.beginPath();
      ctx.roundRect(rightX - 10, buyY - buyH / 2, buyW, buyH, 5);
      ctx.fill();
      ctx.fillStyle = COLORS.white;
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText('购买', rightX - 10 + buyW / 2, buyY);

      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }
  }

  handleClick(mx: number, my: number, shop: ShopSystem, player: Player, inventory: Inventory, combat: CombatSystem, screenW: number, screenH: number): boolean {
    if (!shop.isOpen) return false;

    const panelW = 340;
    const panelH = 330;
    const px = (screenW - panelW) / 2;
    const py = (screenH - panelH) / 2;

    const items = shop.getItems();
    const itemH = 76;
    const itemGap = 10;
    const startY = py + 60;

    for (let i = 0; i < items.length; i++) {
      const iy = startY + i * (itemH + itemGap);
      const rightX = px + panelW - 100;
      const rowCenterY = iy + itemH / 2;
      const btnSize = 22;
      const qtyY = rowCenterY - 14;

      // Quantity minus
      if (mx >= rightX - 20 && mx < rightX - 20 + btnSize && my >= qtyY - btnSize / 2 && my < qtyY + btnSize / 2) {
        this.quantities[i] = Math.max(1, this.quantities[i] - 1);
        return true;
      }

      // Quantity plus
      if (mx >= rightX + 38 && mx < rightX + 38 + btnSize && my >= qtyY - btnSize / 2 && my < qtyY + btnSize / 2) {
        this.quantities[i] = Math.min(items[i].maxBuy, this.quantities[i] + 1);
        return true;
      }

      // Buy button
      const buyY = rowCenterY + 14;
      const buyW = 60;
      const buyH = 24;
      if (mx >= rightX - 10 && mx < rightX - 10 + buyW && my >= buyY - buyH / 2 && my < buyY + buyH / 2) {
        const totalCost = items[i].price * this.quantities[i];
        if (player.gold < totalCost) {
          this.showNotification(`金币不足！需要${totalCost}，当前${player.gold}`, '#FF5252');
        } else {
          const success = shop.buyItem(player, inventory, items[i].type as BallType, this.quantities[i], combat);
          if (success) {
            this.showNotification(`购买成功！${this.quantities[i]}个${items[i].name} -${totalCost}金币`, '#4CAF50');
          } else {
            this.showNotification('背包已满，无法购买！', '#FF9800');
          }
        }
        return true;
      }
    }

    return false;
  }
}
