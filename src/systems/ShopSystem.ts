import { Player } from '../entities/Player';
import { Inventory } from './Inventory';
import { CombatSystem } from './CombatSystem';
import { BALL_CONFIG, BallType, BALL_TYPES } from '../utils/constants';

export class ShopSystem {
  isOpen = false;

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  open(): void { this.isOpen = true; }
  close(): void { this.isOpen = false; }

  buyItem(player: Player, inventory: Inventory, ballType: BallType, quantity: number, combat: CombatSystem): boolean {
    const config = BALL_CONFIG[ballType];
    const totalCost = config.price * quantity;

    // Check max buy limit
    if (quantity > config.maxBuy) {
      combat.addText(player.x, player.y - 20, `单次最多购买${config.maxBuy}个！`, '#FF9800');
      return false;
    }

    // Check gold
    if (!player.spendGold(totalCost)) {
      combat.addText(player.x, player.y - 20, '金币不足！', '#FF5252');
      return false;
    }

    // Add to inventory
    const added = inventory.addItem(ballType, config.name, quantity);
    if (!added) {
      // Refund
      player.addGold(totalCost);
      combat.addText(player.x, player.y - 20, '背包已满！', '#FF9800');
      return false;
    }

    combat.addText(player.x, player.y - 20, `购买了${quantity}个${config.name}`, '#4CAF50');
    console.log(`[Shop] Bought ${quantity}x ${config.name} for ${totalCost} gold`);
    return true;
  }

  getItems(): { type: BallType; name: string; price: number; catchRate: number; maxBuy: number }[] {
    return BALL_TYPES.map(type => ({
      type,
      name: BALL_CONFIG[type].name,
      price: BALL_CONFIG[type].price,
      catchRate: BALL_CONFIG[type].catchRate,
      maxBuy: BALL_CONFIG[type].maxBuy,
    }));
  }
}
