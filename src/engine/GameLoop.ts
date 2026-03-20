// Game loop with fixed timestep at 60 FPS

export type UpdateFn = (dt: number) => void;
export type RenderFn = () => void;

export class GameLoop {
  private running = false;
  private rafId = 0;
  private lastTime = 0;
  private accumulator = 0;
  private readonly fixedDt = 1 / 60; // 60 FPS fixed step
  private fps = 0;
  private frameCount = 0;
  private fpsTimer = 0;
  private onUpdate: UpdateFn;
  private onRender: RenderFn;

  constructor(onUpdate: UpdateFn, onRender: RenderFn) {
    this.onUpdate = onUpdate;
    this.onRender = onRender;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.frameCount = 0;
    this.fpsTimer = 0;
    this.tick(this.lastTime);
  }

  stop(): void {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  getFPS(): number {
    return this.fps;
  }

  private tick = (now: number): void => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.tick);

    const elapsed = Math.min((now - this.lastTime) / 1000, 0.1); // cap at 100ms
    this.lastTime = now;
    this.accumulator += elapsed;

    // FPS counter
    this.fpsTimer += elapsed;
    this.frameCount++;
    if (this.fpsTimer >= 1) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer -= 1;
    }

    // Fixed timestep updates
    while (this.accumulator >= this.fixedDt) {
      this.onUpdate(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }

    this.onRender();
  };
}
