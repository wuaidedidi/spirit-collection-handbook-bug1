import { BACKPACK_SIZE, HOTBAR_SIZE, BallType } from '../utils/constants';

export interface ItemStack {
  id: string;       // item type id
  name: string;
  count: number;
  maxStack: number;
}

export class Inventory {
  backpack: (ItemStack | null)[];
  hotbar: (ItemStack | null)[];
  selectedHotbarSlot: number = 0;

  constructor() {
    this.backpack = new Array(BACKPACK_SIZE).fill(null);
    this.hotbar = new Array(HOTBAR_SIZE).fill(null);
  }

  addItem(id: string, name: string, count: number = 1, maxStack: number = 99): boolean {
    // Try to stack in hotbar first
    for (let i = 0; i < this.hotbar.length; i++) {
      const slot = this.hotbar[i];
      if (slot && slot.id === id && slot.count < slot.maxStack) {
        const canAdd = Math.min(count, slot.maxStack - slot.count);
        slot.count += canAdd;
        count -= canAdd;
        if (count <= 0) return true;
      }
    }

    // Try to stack in backpack
    for (let i = 0; i < this.backpack.length; i++) {
      const slot = this.backpack[i];
      if (slot && slot.id === id && slot.count < slot.maxStack) {
        const canAdd = Math.min(count, slot.maxStack - slot.count);
        slot.count += canAdd;
        count -= canAdd;
        if (count <= 0) return true;
      }
    }

    // Find empty slot in hotbar
    for (let i = 0; i < this.hotbar.length; i++) {
      if (!this.hotbar[i]) {
        this.hotbar[i] = { id, name, count: Math.min(count, maxStack), maxStack };
        count -= Math.min(count, maxStack);
        if (count <= 0) return true;
      }
    }

    // Find empty slot in backpack
    for (let i = 0; i < this.backpack.length; i++) {
      if (!this.backpack[i]) {
        this.backpack[i] = { id, name, count: Math.min(count, maxStack), maxStack };
        count -= Math.min(count, maxStack);
        if (count <= 0) return true;
      }
    }

    return count <= 0;
  }

  removeItem(id: string, count: number = 1): boolean {
    let remaining = count;

    // Remove from hotbar first
    for (let i = 0; i < this.hotbar.length; i++) {
      const slot = this.hotbar[i];
      if (slot && slot.id === id) {
        const remove = Math.min(remaining, slot.count);
        slot.count -= remove;
        remaining -= remove;
        if (slot.count <= 0) this.hotbar[i] = null;
        if (remaining <= 0) return true;
      }
    }

    // Remove from backpack
    for (let i = 0; i < this.backpack.length; i++) {
      const slot = this.backpack[i];
      if (slot && slot.id === id) {
        const remove = Math.min(remaining, slot.count);
        slot.count -= remove;
        remaining -= remove;
        if (slot.count <= 0) this.backpack[i] = null;
        if (remaining <= 0) return true;
      }
    }

    return remaining <= 0;
  }

  getItemCount(id: string): number {
    let total = 0;
    for (const slot of this.hotbar) {
      if (slot && slot.id === id) total += slot.count;
    }
    for (const slot of this.backpack) {
      if (slot && slot.id === id) total += slot.count;
    }
    return total;
  }

  getSelectedItem(): ItemStack | null {
    return this.hotbar[this.selectedHotbarSlot];
  }

  swapSlots(fromType: 'backpack' | 'hotbar', fromIdx: number, toType: 'backpack' | 'hotbar', toIdx: number): void {
    const fromArr = fromType === 'backpack' ? this.backpack : this.hotbar;
    const toArr = toType === 'backpack' ? this.backpack : this.hotbar;

    if (fromIdx < 0 || fromIdx >= fromArr.length || toIdx < 0 || toIdx >= toArr.length) return;

    const temp = fromArr[fromIdx];
    fromArr[fromIdx] = toArr[toIdx];
    toArr[toIdx] = temp;
  }
}
