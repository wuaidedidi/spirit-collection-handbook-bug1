import { Player } from "../entities/Player";
import { Creature } from "../entities/Creature";
import { Inventory } from "./Inventory";
import { CombatSystem } from "./CombatSystem";
import { BALL_CONFIG, BallType, CREATURE_NAMES } from "../utils/constants";

export type CapturePhase = "idle" | "throwing" | "shaking" | "result";

export interface CaptureState {
  phase: CapturePhase;
  target: Creature | null;
  ballType: BallType | null;
  timer: number;
  success: boolean;
  ballX: number;
  ballY: number;
  startX: number;
  startY: number;
  shakeCount: number;
}

export class CaptureSystem {
  state: CaptureState = {
    phase: "idle",
    target: null,
    ballType: null,
    timer: 0,
    success: false,
    ballX: 0,
    ballY: 0,
    startX: 0,
    startY: 0,
    shakeCount: 0,
  };

  isCapturing(): boolean {
    return this.state.phase !== "idle";
  }

  attemptCapture(
    player: Player,
    target: Creature,
    ballType: BallType,
    inventory: Inventory,
    combat: CombatSystem,
  ): boolean {
    if (this.isCapturing()) return false;
    if (!target.isAlive || target.isCaptured || target.isPet) return false;

    // Check if player has the ball
    if (inventory.getItemCount(ballType) <= 0) {
      combat.addText(player.x, player.y - 20, "没有精灵球！", "#FF5252");
      return false;
    }

    // Consume ball
    inventory.removeItem(ballType, 1);

    // Calculate capture probability: finalProb = baseCatchRate × (1 + hpBonus)
    const config = BALL_CONFIG[ballType];
    const hpRatio = target.stats.hp / target.stats.maxHp;
    // General HP bonus: the lower the HP, the higher the bonus (up to 1.0)
    let hpBonus = 1 - hpRatio;
    // Extra +50% bonus when HP < 20%
    if (hpRatio < 0.2) {
      hpBonus += 0.5;
    }
    let probability = Math.min(config.catchRate * (1 + hpBonus), 1.0);

    const roll = Math.random();
    const success = roll <= probability;

    console.log(
      `[Capture] ${CREATURE_NAMES[target.creatureType]}: prob=${(probability * 100).toFixed(1)}%, roll=${(roll * 100).toFixed(1)}%, ${success ? "SUCCESS" : "FAIL"}`,
    );

    // Show probability to player
    const probPercent = (probability * 100).toFixed(0);
    const probColor = probability >= 0.8 ? "#4CAF50" : probability >= 0.5 ? "#FF9800" : "#FF5252";
    combat.addText(player.x, player.y - 40, `捕捉概率: ${probPercent}%`, probColor);

    // Start capture animation
    this.state = {
      phase: "throwing",
      target,
      ballType,
      timer: 0,
      success,
      ballX: player.x,
      ballY: player.y,
      startX: player.x,
      startY: player.y,
      shakeCount: 0,
    };

    return true;
  }

  update(dt: number, player: Player, combat: CombatSystem): Creature | null {
    if (this.state.phase === "idle") return null;

    this.state.timer += dt;
    const { target } = this.state;
    if (!target) {
      this.reset();
      return null;
    }

    switch (this.state.phase) {
      case "throwing": {
        // Ball flies toward creature (0.5s)
        const t = Math.min(this.state.timer / 0.5, 1);
        this.state.ballX = this.state.startX + (target.x - this.state.startX) * t;
        this.state.ballY = this.state.startY + (target.y - this.state.startY) * t - Math.sin(t * Math.PI) * 30;
        if (this.state.timer >= 0.5) {
          this.state.phase = "shaking";
          this.state.timer = 0;
          this.state.ballX = target.x;
          this.state.ballY = target.y;
        }
        break;
      }
      case "shaking": {
        // Ball shakes 3 times (1.5s)
        const shakePhase = Math.floor(this.state.timer / 0.5);
        this.state.shakeCount = shakePhase;
        this.state.ballX = target.x + Math.sin(this.state.timer * 12) * 3;
        if (this.state.timer >= 1.5) {
          this.state.phase = "result";
          this.state.timer = 0;
        }
        break;
      }
      case "result": {
        if (this.state.timer >= 1.0) {
          if (this.state.success) {
            // Capture success
            target.isCaptured = true;
            target.isAlive = false;
            player.addGold(20);
            combat.addGoldText(target.x, target.y - 20, 20);
            combat.addText(target.x, target.y - 40, "捕捉成功！", "#4CAF50");
            console.log(`[Capture] ${CREATURE_NAMES[target.creatureType]} captured! +20 gold`);
            const captured = target;
            this.reset();
            return captured;
          } else {
            // Capture failed
            combat.addText(target.x, target.y - 20, "捕捉失败...", "#FF9800");
            // Creature becomes aggressive
            target.aiState = "chase";
            this.reset();
          }
        }
        break;
      }
    }

    return null;
  }

  private reset(): void {
    this.state = {
      phase: "idle",
      target: null,
      ballType: null,
      timer: 0,
      success: false,
      ballX: 0,
      ballY: 0,
      startX: 0,
      startY: 0,
      shakeCount: 0,
    };
  }
}
