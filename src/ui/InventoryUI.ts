import { Inventory, ItemStack } from "../systems/Inventory";
import { SpriteAtlas } from "../assets/SpriteTypes";
import { COLORS, HOTBAR_SIZE, BACKPACK_SIZE } from "../utils/constants";

export class InventoryUI {
  isOpen = false;
  private atlas: SpriteAtlas;
  private dragItem: { source: "backpack" | "hotbar"; index: number; item: ItemStack } | null = null;
  private dragX = 0;
  private dragY = 0;
  private hoverSlot: { type: "backpack" | "hotbar"; index: number } | null = null;

  constructor(atlas: SpriteAtlas) {
    this.atlas = atlas;
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }
  open(): void {
    this.isOpen = true;
  }
  close(): void {
    this.isOpen = false;
  }

  handleMouseDown(mx: number, my: number, inventory: Inventory, screenW: number, screenH: number): boolean {
    if (!this.isOpen) return false;

    const slot = this.getSlotAt(mx, my, screenW, screenH);
    if (!slot) return false;

    const arr = slot.type === "backpack" ? inventory.backpack : inventory.hotbar;
    const item = arr[slot.index];
    if (item) {
      this.dragItem = { source: slot.type, index: slot.index, item };
      this.dragX = mx;
      this.dragY = my;
    }
    return true;
  }

  handleMouseMove(mx: number, my: number, screenW: number, screenH: number): void {
    if (this.dragItem) {
      this.dragX = mx;
      this.dragY = my;
    }
    this.hoverSlot = this.getSlotAt(mx, my, screenW, screenH);
  }

  handleMouseUp(mx: number, my: number, inventory: Inventory, screenW: number, screenH: number): void {
    if (!this.dragItem) return;

    const targetSlot = this.getSlotAt(mx, my, screenW, screenH);
    if (targetSlot) {
      inventory.swapSlots(this.dragItem.source, this.dragItem.index, targetSlot.type, targetSlot.index);
    }
    this.dragItem = null;
  }

  private getSlotAt(
    mx: number,
    my: number,
    screenW: number,
    screenH: number,
  ): { type: "backpack" | "hotbar"; index: number } | null {
    const slotSize = 40;
    const padding = 4;

    // Backpack grid (6 columns x 5 rows)
    if (this.isOpen) {
      const cols = 6;
      const bpW = cols * (slotSize + padding) + padding;
      const rows = Math.ceil(BACKPACK_SIZE / cols);
      const bpH = rows * (slotSize + padding) + padding + 30;
      const bpX = (screenW - bpW) / 2;
      const bpY = (screenH - bpH) / 2 - 40;

      for (let i = 0; i < BACKPACK_SIZE; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const sx = bpX + padding + col * (slotSize + padding);
        const sy = bpY + 30 + padding + row * (slotSize + padding);
        if (mx >= sx && mx < sx + slotSize && my >= sy && my < sy + slotSize) {
          return { type: "backpack", index: i };
        }
      }
    }

    // Hotbar
    const hotbarW = HOTBAR_SIZE * (slotSize + padding) + padding;
    const hotbarX = (screenW - hotbarW) / 2;
    const hotbarY = screenH - slotSize - padding - 10;

    for (let i = 0; i < HOTBAR_SIZE; i++) {
      const sx = hotbarX + padding + i * (slotSize + padding);
      if (mx >= sx && mx < sx + slotSize && my >= hotbarY && my < hotbarY + slotSize) {
        return { type: "hotbar", index: i };
      }
    }

    return null;
  }

  render(ctx: CanvasRenderingContext2D, inventory: Inventory, screenW: number, screenH: number): void {
    const slotSize = 40;
    const padding = 4;

    // Always render hotbar at bottom center
    this.renderHotbar(ctx, inventory, screenW, screenH, slotSize, padding);

    // Render backpack if open
    if (this.isOpen) {
      this.renderBackpack(ctx, inventory, screenW, screenH, slotSize, padding);
    }

    // Render drag preview
    if (this.dragItem) {
      ctx.globalAlpha = 0.7;
      this.renderItemIcon(ctx, this.dragItem.item, this.dragX - slotSize / 2, this.dragY - slotSize / 2, slotSize);
      ctx.globalAlpha = 1.0;
    }
  }

  private renderHotbar(
    ctx: CanvasRenderingContext2D,
    inventory: Inventory,
    screenW: number,
    screenH: number,
    slotSize: number,
    padding: number,
  ): void {
    const hotbarW = HOTBAR_SIZE * (slotSize + padding) + padding;
    const hotbarX = (screenW - hotbarW) / 2;
    const hotbarY = screenH - slotSize - padding - 10;

    // Background
    ctx.fillStyle = COLORS.uiBg;
    ctx.beginPath();
    ctx.roundRect(hotbarX - 4, hotbarY - 4, hotbarW + 8, slotSize + 8 + padding, 8);
    ctx.fill();
    ctx.strokeStyle = COLORS.uiBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(hotbarX - 4, hotbarY - 4, hotbarW + 8, slotSize + 8 + padding, 8);
    ctx.stroke();

    for (let i = 0; i < HOTBAR_SIZE; i++) {
      const sx = hotbarX + padding + i * (slotSize + padding);
      const selected = i === inventory.selectedHotbarSlot;

      // Slot background
      ctx.fillStyle = selected ? COLORS.slotSelected : COLORS.slotBg;
      ctx.fillRect(sx, hotbarY, slotSize, slotSize);
      ctx.strokeStyle = selected ? COLORS.gold : "rgba(100,100,140,0.5)";
      ctx.lineWidth = selected ? 2 : 1;
      ctx.strokeRect(sx, hotbarY, slotSize, slotSize);

      // Item
      const item = inventory.hotbar[i];
      if (item) {
        this.renderItemIcon(ctx, item, sx, hotbarY, slotSize);
      }

      // Key label
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = '9px "Courier New", monospace';
      ctx.fillText(`${(i + 1) % 10}`, sx + 2, hotbarY + 10);
    }
  }

  private renderBackpack(
    ctx: CanvasRenderingContext2D,
    inventory: Inventory,
    screenW: number,
    screenH: number,
    slotSize: number,
    padding: number,
  ): void {
    const cols = 6;
    const rows = Math.ceil(BACKPACK_SIZE / cols);
    const bpW = cols * (slotSize + padding) + padding;
    const bpH = rows * (slotSize + padding) + padding + 30;
    const bpX = (screenW - bpW) / 2;
    const bpY = (screenH - bpH) / 2 - 40;

    // Background
    ctx.fillStyle = "rgba(15, 15, 30, 0.95)";
    ctx.beginPath();
    ctx.roundRect(bpX - 8, bpY - 8, bpW + 16, bpH + 16, 10);
    ctx.fill();
    ctx.strokeStyle = COLORS.uiBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bpX - 8, bpY - 8, bpW + 16, bpH + 16, 10);
    ctx.stroke();

    // Title
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = "center";
    ctx.fillText("背包 (Q关闭)", bpX + bpW / 2, bpY + 18);
    ctx.textAlign = "left";

    for (let i = 0; i < BACKPACK_SIZE; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const sx = bpX + padding + col * (slotSize + padding);
      const sy = bpY + 30 + padding + row * (slotSize + padding);

      const isHover = this.hoverSlot?.type === "backpack" && this.hoverSlot.index === i;

      ctx.fillStyle = isHover ? COLORS.slotHover : COLORS.slotBg;
      ctx.fillRect(sx, sy, slotSize, slotSize);
      ctx.strokeStyle = "rgba(100,100,140,0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(sx, sy, slotSize, slotSize);

      const item = inventory.backpack[i];
      if (item) {
        this.renderItemIcon(ctx, item, sx, sy, slotSize);
      }
    }
  }

  private renderItemIcon(ctx: CanvasRenderingContext2D, item: ItemStack, x: number, y: number, size: number): void {
    // Draw item sprite
    const sheet = this.atlas.items[item.id];
    if (sheet) {
      const iconSize = size - 8;
      ctx.drawImage(sheet.canvas, 0, 0, sheet.frameWidth, sheet.frameHeight, x + 4, y + 2, iconSize, iconSize);
    }

    // Item count
    if (item.count > 1) {
      ctx.fillStyle = COLORS.white;
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.textAlign = "right";
      ctx.fillText(`${item.count}`, x + size - 2, y + size - 2);
      ctx.textAlign = "left";
    }

    // Item name tooltip on hover
    ctx.fillStyle = "rgba(200,200,200,0.7)";
    ctx.font = '8px "Courier New", monospace';
    ctx.textAlign = "center";
    ctx.fillText(item.name, x + size / 2, y + size - 1);
    ctx.textAlign = "left";
  }
}
