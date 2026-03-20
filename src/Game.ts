import { GameLoop } from "./engine/GameLoop";
import { Camera } from "./engine/Camera";
import { InputManager } from "./engine/InputManager";
import { ChunkManager } from "./engine/ChunkManager";
import { PixelArtGenerator } from "./assets/PixelArtGenerator";
import { SpriteAtlas } from "./assets/SpriteTypes";
import { TerrainRenderer } from "./terrain/TerrainRenderer";
import { TerrainEffects } from "./terrain/TerrainEffects";
import { Player } from "./entities/Player";
import { Creature } from "./entities/Creature";
import { Inventory } from "./systems/Inventory";
import { CombatSystem } from "./systems/CombatSystem";
import { CaptureSystem } from "./systems/CaptureSystem";
import { PetSystem } from "./systems/PetSystem";
import { ShopSystem } from "./systems/ShopSystem";
import { HUD } from "./ui/HUD";
import { InventoryUI } from "./ui/InventoryUI";
import { ShopUI } from "./ui/ShopUI";
import { PetPanelUI } from "./ui/PetPanelUI";
import { AudioSystem } from "./systems/AudioSystem";
import { BALL_TYPES, BallType, CreatureType, CREATURE_NAMES } from "./utils/constants";
import { Vector2 } from "./utils/math";

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameLoop: GameLoop;
  private camera: Camera;
  private input: InputManager;
  private chunkManager: ChunkManager;
  private atlas!: SpriteAtlas;

  private terrainRenderer!: TerrainRenderer;
  private terrainEffects: TerrainEffects;

  private player: Player;
  private creatures: Creature[] = [];
  private spawnedChunks: Set<string> = new Set();

  private inventory: Inventory;
  private combatSystem: CombatSystem;
  private captureSystem: CaptureSystem;
  private petSystem: PetSystem;
  private shopSystem: ShopSystem;

  private hud!: HUD;
  private inventoryUI!: InventoryUI;
  private shopUI!: ShopUI;
  private petPanelUI!: PetPanelUI;
  private audio: AudioSystem;

  private screenWidth: number;
  private screenHeight: number;
  private previousCapturePhase: string = "idle";
  private deathTimer: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.ctx.imageSmoothingEnabled = false;

    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.canvas.width = this.screenWidth;
    this.canvas.height = this.screenHeight;

    this.camera = new Camera(this.screenWidth, this.screenHeight);
    this.input = new InputManager(canvas);
    this.input.setCamera(this.camera);
    this.chunkManager = new ChunkManager();
    this.terrainEffects = new TerrainEffects();
    this.terrainEffects.onTerrainDamage = (type) => {
      if (type === "lava") this.audio.play("lava_damage");
      else if (type === "trap") this.audio.play("trap_damage");
      else if (type === "falling_rock") this.audio.play("trap_damage");
    };

    this.player = new Player(256, 256);
    this.inventory = new Inventory();
    this.combatSystem = new CombatSystem();
    this.captureSystem = new CaptureSystem();
    this.petSystem = new PetSystem();
    this.shopSystem = new ShopSystem();
    this.audio = new AudioSystem();

    // Give player some starting items
    this.inventory.addItem("normalBall", "普通精灵球", 5);

    this.camera.snapTo(new Vector2(this.player.x, this.player.y));

    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render(),
    );

    // Handle resize
    window.addEventListener("resize", () => this.handleResize());

    // Mouse click handler
    this.input.onMouseClick((worldX, worldY, button) => {
      this.handleClick(worldX, worldY, button);
    });

    // Also handle screen-space clicks for UI
    this.canvas.addEventListener("mousedown", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      this.handleScreenClick(sx, sy, e.button);
    });

    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      if (this.inventoryUI) {
        this.inventoryUI.handleMouseMove(sx, sy, this.screenWidth, this.screenHeight);
      }
    });

    this.canvas.addEventListener("mouseup", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      if (this.inventoryUI) {
        this.inventoryUI.handleMouseUp(sx, sy, this.inventory, this.screenWidth, this.screenHeight);
      }
    });
  }

  async init(): Promise<void> {
    const loadingBar = document.getElementById("loading-bar") as HTMLElement;
    const loadingText = document.getElementById("loading-text") as HTMLElement;

    loadingText.textContent = "生成像素精灵...";
    loadingBar.style.width = "30%";

    await this.delay(100);

    const generator = new PixelArtGenerator();
    this.atlas = generator.generateAll();

    loadingBar.style.width = "60%";
    loadingText.textContent = "初始化游戏系统...";
    await this.delay(100);

    this.terrainRenderer = new TerrainRenderer(this.atlas);
    this.hud = new HUD(this.atlas);
    this.inventoryUI = new InventoryUI(this.atlas);
    this.shopUI = new ShopUI(this.atlas);
    this.petPanelUI = new PetPanelUI(this.atlas);

    loadingBar.style.width = "80%";
    loadingText.textContent = "加载地图...";
    await this.delay(100);

    this.chunkManager.update(this.player.x, this.player.y, this.player.canAccessDungeon());

    loadingBar.style.width = "100%";
    loadingText.textContent = "准备就绪！";
    await this.delay(300);

    // Hide loading screen
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.style.opacity = "0";
      setTimeout(() => (loadingScreen.style.display = "none"), 500);
    }

    // Initialize audio on first user interaction
    this.audio.init();

    console.log("[Game] Initialized successfully");
  }

  start(): void {
    this.gameLoop.start();
    console.log("[Game] Started");
  }

  private update(dt: number): void {
    this.input.update();

    // Handle keyboard shortcuts
    if (this.input.isKeyJustPressed("KeyQ")) {
      this.inventoryUI.toggle();
      if (this.shopSystem.isOpen) this.shopSystem.close();
    }
    if (this.input.isKeyJustPressed("KeyM")) {
      this.shopSystem.toggle();
      if (this.inventoryUI.isOpen) this.inventoryUI.close();
    }

    // Hotbar selection
    const hotbarKey = this.input.getHotbarKey();
    if (hotbarKey >= 0) {
      this.inventory.selectedHotbarSlot = hotbarKey;
    }

    // Player death recovery
    if (!this.player.isAlive) {
      this.deathTimer += dt;
      if (this.deathTimer >= 2.0) {
        this.player.isAlive = true;
        this.player.stats.hp = Math.floor(this.player.stats.maxHp * 0.5);
        this.player.currentAnimation = "idle";
        this.deathTimer = 0;
        this.combatSystem.addText(this.player.x, this.player.y - 30, "复活了！", "#4CAF50");
        console.log("[Game] Player revived with 50% HP");
      }
    }

    // Don't process game input when UI is open
    const uiOpen = this.inventoryUI.isOpen || this.shopSystem.isOpen;

    // Player movement
    if (!uiOpen && this.player.isAlive) {
      const move = this.input.getMovementVector();

      // Axis-separated collision: test X and Y independently to allow wall-sliding
      let moveX = move.x;
      let moveY = move.y;

      if (moveX !== 0 || moveY !== 0) {
        const speed = this.player.stats.speed * this.player.speedModifier * dt;
        const len = Math.sqrt(moveX * moveX + moveY * moveY);
        const nx = moveX / len;
        const ny = moveY / len;

        // Test X axis
        const testX = this.player.x + nx * speed;
        if (this.terrainEffects.checkObstacle(this.chunkManager, testX, this.player.y)) {
          moveX = 0;
        }

        // Test Y axis
        const testY = this.player.y + ny * speed;
        if (this.terrainEffects.checkObstacle(this.chunkManager, this.player.x, testY)) {
          moveY = 0;
        }
      }

      this.player.update(dt, moveX, moveY);
    }

    // Camera follow
    this.camera.follow(new Vector2(this.player.x, this.player.y));
    this.camera.update();

    // Chunk management
    this.chunkManager.update(this.player.x, this.player.y, this.player.canAccessDungeon());

    // Spawn creatures from new chunks
    this.spawnCreaturesFromChunks();

    // Terrain effects
    this.terrainEffects.update(dt, this.player, this.chunkManager);

    // Update creatures
    for (const creature of this.creatures) {
      if (creature.isAlive && !creature.isCaptured) {
        creature.update(dt, this.player.x, this.player.y, this.player);
      }
    }

    // Combat system
    this.combatSystem.update(dt, this.player, this.creatures);

    // Capture system
    const capturePhase = this.captureSystem.state.phase;
    const captured = this.captureSystem.update(dt, this.player, this.combatSystem);
    if (captured) {
      this.petSystem.addPet(this.player, captured);
      // Wire up damage callback for the new pet
      captured.onDamageDealt = (x, y, damage) => {
        this.combatSystem.addDamageText(x, y, damage);
        this.audio.play("attack_pet");
      };
      this.audio.play("capture_success");
    }
    // Audio for capture phase transitions
    if (capturePhase !== this.previousCapturePhase) {
      if (capturePhase === "throwing") this.audio.play("capture_throw");
      if (capturePhase === "shaking") this.audio.play("capture_shake");
      if (capturePhase === "result" && !this.captureSystem.state.success && this.previousCapturePhase === "shaking") {
        this.audio.play("capture_fail");
      }
    }
    this.previousCapturePhase = capturePhase;

    // Pet system
    this.petSystem.update(dt, this.player, this.combatSystem);

    // Terrain animation
    this.terrainRenderer.update(dt);

    // Shop notification timer
    this.shopUI.updateNotification(dt);

    // Clean up dead creatures (after die animation)
    this.creatures = this.creatures.filter((c) => {
      if (!c.isAlive && !c.isCaptured) {
        // Keep for die animation
        if (c.animationFrame < 3) return true;
        return false;
      }
      if (c.isCaptured) return false;
      return true;
    });

    // Chest interaction
    const tile = this.chunkManager.getTileAt(this.player.x, this.player.y);
    if (tile && tile.chest) {
      tile.chest = false;
      // Random reward
      const rewards = [
        { id: "normalBall", name: "普通精灵球", count: 3 },
        { id: "greatBall", name: "高级精灵球", count: 1 },
        { id: "ultraBall", name: "超级精灵球", count: 1 },
      ];
      const reward = rewards[Math.floor(Math.random() * rewards.length)];
      this.inventory.addItem(reward.id, reward.name, reward.count);
      this.combatSystem.addText(this.player.x, this.player.y - 30, `获得 ${reward.name} x${reward.count}`, "#FFD700");
      // Also give some gold
      const goldReward = 10 + Math.floor(Math.random() * 20);
      this.player.addGold(goldReward);
      this.combatSystem.addGoldText(this.player.x, this.player.y - 50, goldReward);
      this.audio.play("chest_open");
    }
  }

  private render(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.screenWidth, this.screenHeight);

    // Fill background
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);

    const vp = this.camera.getViewport();

    // Render terrain chunks
    const visibleChunks = this.chunkManager.getVisibleChunks(vp.x, vp.y, vp.w, vp.h);
    for (const chunk of visibleChunks) {
      this.terrainRenderer.renderChunk(ctx, chunk, this.camera);
    }

    // Render creatures
    for (const creature of this.creatures) {
      if (!creature.isCaptured && this.camera.isVisible(creature.x - 8, creature.y - 8, 16, 16)) {
        this.renderEntity(ctx, creature);
      }
    }

    // Render active pet
    if (this.player.activePetIndex >= 0 && this.player.activePetIndex < this.player.pets.length) {
      const pet = this.player.pets[this.player.activePetIndex];
      if (pet.isAlive) {
        this.renderEntity(ctx, pet);
      }
    }

    // Render player
    this.renderPlayer(ctx);

    // Render capture animation
    if (this.captureSystem.isCapturing()) {
      this.renderCaptureAnimation(ctx);
    }

    // Render floating texts
    for (const ft of this.combatSystem.floatingTexts) {
      const screen = this.camera.worldToScreen(ft.x, ft.y);
      const alpha = 1 - ft.timer / ft.maxTime;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 14px "Courier New", monospace';
      ctx.textAlign = "center";
      ctx.fillText(ft.text, screen.x, screen.y);
      ctx.textAlign = "left";
      ctx.globalAlpha = 1;
    }

    // Render UI (screen space)
    // Hide HUD and pet panel when shop/inventory overlay is open to avoid visual clutter
    const uiOverlayOpen = this.shopSystem.isOpen || this.inventoryUI.isOpen;
    if (!uiOverlayOpen) {
      this.hud.render(ctx, this.player, this.gameLoop.getFPS(), this.screenWidth, this.screenHeight);
      this.petPanelUI.render(ctx, this.player, this.petSystem, this.screenWidth, this.screenHeight);
    }
    this.inventoryUI.render(ctx, this.inventory, this.screenWidth, this.screenHeight);
    this.shopUI.render(ctx, this.shopSystem, this.player, this.screenWidth, this.screenHeight);

    // Render virtual joystick (mobile)
    this.input.renderJoystick(ctx);
  }

  private renderPlayer(ctx: CanvasRenderingContext2D): void {
    const dirMap: Record<string, string> = {
      s: "south",
      n: "north",
      e: "east",
      w: "west",
      se: "southeast",
      sw: "southwest",
      ne: "northeast",
      nw: "northwest",
    };
    const dir = dirMap[this.player.direction] || "south";
    const sheet = this.atlas.player[dir];
    if (!sheet) return;

    const anim = sheet.animations?.[this.player.currentAnimation];
    let frame = 0;
    if (anim) {
      const range = anim.end - anim.start + 1;
      frame = anim.start + (this.player.animationFrame % range);
      this.player.animationSpeed = anim.speed;
    }

    const screen = this.camera.worldToScreen(this.player.x - 8, this.player.y - 8);
    ctx.drawImage(
      sheet.canvas,
      frame * sheet.frameWidth,
      0,
      sheet.frameWidth,
      sheet.frameHeight,
      Math.floor(screen.x),
      Math.floor(screen.y),
      Math.floor(sheet.frameWidth * this.camera.scale),
      Math.floor(sheet.frameHeight * this.camera.scale),
    );
  }

  private renderEntity(ctx: CanvasRenderingContext2D, entity: Creature): void {
    const sheet = this.atlas.creatures[entity.creatureType];
    if (!sheet) return;

    const anim = sheet.animations?.[entity.currentAnimation];
    let frame = 0;
    if (anim) {
      const range = anim.end - anim.start + 1;
      frame = anim.start + (entity.animationFrame % range);
      entity.animationSpeed = anim.speed;
    }

    const screen = this.camera.worldToScreen(entity.x - 8, entity.y - 8);
    ctx.drawImage(
      sheet.canvas,
      frame * sheet.frameWidth,
      0,
      sheet.frameWidth,
      sheet.frameHeight,
      Math.floor(screen.x),
      Math.floor(screen.y),
      Math.floor(sheet.frameWidth * this.camera.scale),
      Math.floor(sheet.frameHeight * this.camera.scale),
    );

    // HP bar above creature
    if (entity.isAlive) {
      const barW = 48 * this.camera.scale;
      const barH = 3 * this.camera.scale;
      const barX = screen.x + (sheet.frameWidth * this.camera.scale - barW) / 2;
      const barY = screen.y - 6 * this.camera.scale;
      const hpRatio = entity.stats.hp / entity.stats.maxHp;

      ctx.fillStyle = "#333";
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = hpRatio > 0.5 ? "#2ecc71" : hpRatio > 0.2 ? "#FFC107" : "#e74c3c";
      ctx.fillRect(barX, barY, barW * hpRatio, barH);

      // Name label
      const name = CREATURE_NAMES[entity.creatureType as CreatureType] || "";
      if (entity.isPet) {
        ctx.fillStyle = "#ddd";
      } else {
        ctx.fillStyle = "#FFD700";
      }
      ctx.font = '10px "Courier New", monospace';
      ctx.textAlign = "center";
      ctx.fillText(name, screen.x + (sheet.frameWidth * this.camera.scale) / 2, barY - 2);
      ctx.textAlign = "left";
    }
  }

  private renderCaptureAnimation(ctx: CanvasRenderingContext2D): void {
    const state = this.captureSystem.state;
    if (state.phase === "idle") return;

    const ballType = state.ballType || "normalBall";
    const ballSheet = this.atlas.items[ballType];
    if (!ballSheet) return;

    const screen = this.camera.worldToScreen(state.ballX - 8, state.ballY - 8);
    const size = 16 * this.camera.scale;

    ctx.drawImage(
      ballSheet.canvas,
      0,
      0,
      ballSheet.frameWidth,
      ballSheet.frameHeight,
      Math.floor(screen.x),
      Math.floor(screen.y),
      Math.floor(size),
      Math.floor(size),
    );

    // Sparkle effect on success
    if (state.phase === "result" && !state.success) {
      const t = state.timer;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + t * 3;
        const dist = t * 40;
        const sx = screen.x + size / 2 + Math.cos(angle) * dist;
        const sy = screen.y + size / 2 + Math.sin(angle) * dist;
        ctx.fillStyle = `rgba(255, 215, 0, ${1 - t})`;
        ctx.fillRect(sx - 2, sy - 2, 4, 4);
      }
    }
  }

  private handleClick(worldX: number, worldY: number, button: number): void {
    if (button !== 0) return;
    if (this.inventoryUI.isOpen || this.shopSystem.isOpen) return;
    if (this.captureSystem.isCapturing()) return;

    // Check if clicking on a creature
    const selectedItem = this.inventory.getSelectedItem();
    const isBall = selectedItem && BALL_TYPES.includes(selectedItem.id as BallType);

    for (const creature of this.creatures) {
      if (!creature.isAlive || creature.isCaptured || creature.isPet) continue;
      const dx = worldX - creature.x;
      const dy = worldY - creature.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 20) {
        if (isBall) {
          this.captureSystem.attemptCapture(
            this.player,
            creature,
            selectedItem!.id as BallType,
            this.inventory,
            this.combatSystem,
          );
        } else {
          this.combatSystem.addText(creature.x, creature.y - 20, "请先选择精灵球！", "#FF9800");
        }
        return;
      }
    }
  }

  private handleScreenClick(sx: number, sy: number, button: number): void {
    if (button !== 0) return;

    // Shop UI
    if (this.shopSystem.isOpen) {
      const goldBefore = this.player.gold;
      this.shopUI.handleClick(
        sx,
        sy,
        this.shopSystem,
        this.player,
        this.inventory,
        this.combatSystem,
        this.screenWidth,
        this.screenHeight,
      );
      if (this.player.gold < goldBefore) {
        this.audio.play("shop_buy");
      } else if (this.player.gold === goldBefore) {
        // Could be a failed purchase or quantity change - only play fail if buy was attempted
      }
      return;
    }

    // Inventory UI drag start
    if (this.inventoryUI.isOpen) {
      if (this.inventoryUI.handleMouseDown(sx, sy, this.inventory, this.screenWidth, this.screenHeight)) {
        return;
      }
    }

    // Pet panel click
    const prevPetIdx = this.player.activePetIndex;
    if (this.petPanelUI.handleClick(sx, sy, this.player, this.petSystem, this.screenWidth, this.screenHeight)) {
      if (this.player.activePetIndex >= 0 && this.player.activePetIndex !== prevPetIdx) {
        this.audio.play("pet_deploy");
      } else if (this.player.activePetIndex === -1 && prevPetIdx >= 0) {
        this.audio.play("pet_recall");
      }
      return;
    }
  }

  private spawnCreaturesFromChunks(): void {
    for (const chunk of this.chunkManager.getAllChunks()) {
      const key = `${chunk.cx},${chunk.cy}`;
      if (this.spawnedChunks.has(key)) continue;
      this.spawnedChunks.add(key);

      for (const spawn of chunk.creatureSpawns) {
        const creature = new Creature(spawn.type as CreatureType, spawn.x, spawn.y);
        // Wire up damage callback for floating text & audio
        creature.onDamageDealt = (x, y, damage) => {
          this.combatSystem.addDamageText(x, y, damage);
          if (creature.isPet) {
            this.audio.play("attack_pet");
          } else {
            this.audio.play("attack_hit");
            this.audio.play("player_hurt");
          }
        };
        this.creatures.push(creature);
      }
    }
  }

  private handleResize(): void {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.canvas.width = this.screenWidth;
    this.canvas.height = this.screenHeight;
    this.camera.resize(this.screenWidth, this.screenHeight);
    this.ctx.imageSmoothingEnabled = false;

    // Adjust camera scale for smaller screens
    if (this.screenWidth < 768) {
      this.camera.scale = 1.5;
    } else if (this.screenWidth < 1200) {
      this.camera.scale = 2;
    } else {
      this.camera.scale = 2.5;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
