import { Player } from "../entities/Player";
import { PetSystem } from "../systems/PetSystem";
import { SpriteAtlas } from "../assets/SpriteTypes";
import { COLORS, CREATURE_NAMES, CreatureType } from "../utils/constants";

export class PetPanelUI {
  private atlas: SpriteAtlas;

  constructor(atlas: SpriteAtlas) {
    this.atlas = atlas;
  }

  render(ctx: CanvasRenderingContext2D, player: Player, petSystem: PetSystem, screenW: number, screenH: number): void {
    const maxDisplay = 3;
    const pets = player.pets.slice(0, maxDisplay);
    if (pets.length === 0) return;

    const panelW = 220;
    const petH = 76;
    const panelH = pets.length * (petH + 4) + 30;
    const px = screenW - panelW - 12;
    const py = screenH - panelH - 70; // above hotbar

    // Background
    ctx.fillStyle = COLORS.uiBg;
    ctx.beginPath();
    ctx.roundRect(px, py, panelW, panelH, 8);
    ctx.fill();
    ctx.strokeStyle = COLORS.uiBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(px, py, panelW, panelH, 8);
    ctx.stroke();

    // Title
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.textAlign = "center";
    ctx.fillText("宠物", px + panelW / 2, py + 16);
    ctx.textAlign = "left";

    for (let i = 0; i < pets.length; i++) {
      const pet = pets[i];
      const iy = py + 24 + i * (petH + 4);
      const isActive = i === player.activePetIndex;

      // Pet row background
      ctx.fillStyle = isActive ? "rgba(255,215,0,0.1)" : "rgba(40,40,60,0.6)";
      ctx.beginPath();
      ctx.roundRect(px + 4, iy, panelW - 8, petH, 4);
      ctx.fill();

      if (isActive) {
        ctx.strokeStyle = COLORS.gold;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(px + 4, iy, panelW - 8, petH, 4);
        ctx.stroke();
      }

      // Pet portrait (scaled from 16x16 to 64x64)
      const creatureSheet = this.atlas.creatures[pet.creatureType];
      if (creatureSheet) {
        ctx.drawImage(
          creatureSheet.canvas,
          0,
          0,
          16,
          16, // idle frame 0
          px + 6,
          iy + 6,
          64,
          64,
        );
      }

      // Pet name
      const name = CREATURE_NAMES[pet.creatureType as CreatureType] || pet.creatureType;
      ctx.fillStyle = isActive ? COLORS.gold : COLORS.uiText;
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText(name, px + 74, iy + 20);

      // HP bar
      const hpBarX = px + 74;
      const hpBarY = iy + 28;
      const hpBarW = panelW - 86;
      const hpBarH = 10;
      const hpRatio = pet.isAlive ? pet.stats.hp / pet.stats.maxHp : 0;

      ctx.fillStyle = COLORS.hpBg;
      ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);
      ctx.fillStyle = hpRatio > 0.5 ? COLORS.hpGreen : hpRatio > 0.2 ? "#FFC107" : COLORS.hpRed;
      ctx.fillRect(hpBarX, hpBarY, hpBarW * hpRatio, hpBarH);

      // HP text
      ctx.fillStyle = "#ccc";
      ctx.font = '10px "Courier New", monospace';
      ctx.fillText(`HP:${pet.stats.hp}/${pet.stats.maxHp}`, hpBarX, hpBarY + 22);

      // ATK
      ctx.fillText(`ATK:${pet.stats.attack}`, hpBarX + 74, hpBarY + 22);

      // Faint cooldown
      if (!pet.isAlive) {
        const cd = petSystem.getFaintCooldown(pet.id);
        if (cd > 0) {
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.fillRect(px + 4, iy, panelW - 8, petH);
          ctx.fillStyle = "#FF5252";
          ctx.font = '10px "Courier New", monospace';
          ctx.textAlign = "center";
          ctx.fillText(`恢复中 ${Math.ceil(cd)}s`, px + panelW / 2, iy + petH / 2 + 4);
          ctx.textAlign = "left";
        }
      }

      // Active indicator
      if (isActive && pet.isAlive) {
        ctx.fillStyle = COLORS.gold;
        ctx.font = '10px "Courier New", monospace';
        ctx.fillText("出战中", px + panelW - 52, iy + 66);
      }
    }
  }

  handleClick(mx: number, my: number, player: Player, petSystem: PetSystem, screenW: number, screenH: number): boolean {
    const maxDisplay = 3;
    const pets = player.pets.slice(0, maxDisplay);
    if (pets.length === 0) return false;

    const panelW = 220;
    const petH = 76;
    const panelH = pets.length * (petH + 4) + 30;
    const px = screenW - panelW - 12;
    const py = screenH - panelH - 70;

    for (let i = 0; i < pets.length; i++) {
      const iy = py + 24 + i * (petH + 4);
      if (mx >= px + 4 && mx < px + panelW - 4 && my >= iy && my < iy + petH) {
        if (i === player.activePetIndex) {
          petSystem.recallPet(player);
        } else {
          petSystem.deployPet(player, i);
        }
        return true;
      }
    }

    return false;
  }
}
