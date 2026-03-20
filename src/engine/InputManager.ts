import { Camera } from './Camera';

export type MouseClickHandler = (worldX: number, worldY: number, button: number) => void;

export class InputManager {
  private keys: Set<string> = new Set();
  private mouseScreenX = 0;
  private mouseScreenY = 0;
  private mouseWorldX = 0;
  private mouseWorldY = 0;
  private clickHandlers: MouseClickHandler[] = [];
  private camera: Camera | null = null;
  private canvas: HTMLCanvasElement;

  // Touch / virtual joystick state
  private touchJoystickId: number | null = null;
  private touchJoystickStart = { x: 0, y: 0 };
  private touchMoveVec = { x: 0, y: 0 };
  private touchActionId: number | null = null;
  public joystickActive = false;
  public joystickX = 0;
  public joystickY = 0;
  public joystickDx = 0;
  public joystickDy = 0;

  // Prevent default for these keys
  private gameKeys = new Set([
    'KeyW', 'KeyA', 'KeyS', 'KeyD',
    'KeyQ', 'KeyM',
    'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5',
    'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0',
  ]);

  // Key press detection (single frame)
  private justPressed: Set<string> = new Set();
  private justPressedBuffer: Set<string> = new Set();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    canvas.addEventListener('mousemove', this.onMouseMove);
    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Touch events for mobile
    canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
    canvas.addEventListener('touchend', this.onTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', this.onTouchEnd, { passive: false });
  }

  setCamera(camera: Camera): void {
    this.camera = camera;
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (this.gameKeys.has(e.code)) e.preventDefault();
    if (!this.keys.has(e.code)) {
      this.justPressedBuffer.add(e.code);
    }
    this.keys.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code);
  };

  private onMouseMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseScreenX = e.clientX - rect.left;
    this.mouseScreenY = e.clientY - rect.top;
    if (this.camera) {
      const world = this.camera.screenToWorld(this.mouseScreenX, this.mouseScreenY);
      this.mouseWorldX = world.x;
      this.mouseWorldY = world.y;
    }
  };

  private onMouseDown = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    if (this.camera) {
      const world = this.camera.screenToWorld(sx, sy);
      this.mouseWorldX = world.x;
      this.mouseWorldY = world.y;
      for (const handler of this.clickHandlers) {
        handler(world.x, world.y, e.button);
      }
    }
  };

  update(): void {
    this.justPressed = new Set(this.justPressedBuffer);
    this.justPressedBuffer.clear();
  }

  isKeyDown(code: string): boolean {
    return this.keys.has(code);
  }

  isKeyJustPressed(code: string): boolean {
    return this.justPressed.has(code);
  }

  getMouseScreen(): { x: number; y: number } {
    return { x: this.mouseScreenX, y: this.mouseScreenY };
  }

  getMouseWorld(): { x: number; y: number } {
    return { x: this.mouseWorldX, y: this.mouseWorldY };
  }

  onMouseClick(handler: MouseClickHandler): void {
    this.clickHandlers.push(handler);
  }

  removeMouseClick(handler: MouseClickHandler): void {
    const idx = this.clickHandlers.indexOf(handler);
    if (idx >= 0) this.clickHandlers.splice(idx, 1);
  }

  getMovementVector(): { x: number; y: number } {
    let x = 0, y = 0;
    if (this.keys.has('KeyW')) y -= 1;
    if (this.keys.has('KeyS')) y += 1;
    if (this.keys.has('KeyA')) x -= 1;
    if (this.keys.has('KeyD')) x += 1;

    // Apply touch joystick if active
    if (this.touchJoystickId !== null) {
      x += this.touchMoveVec.x;
      y += this.touchMoveVec.y;
    }

    // Normalize diagonal
    const len = Math.sqrt(x * x + y * y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    return { x, y };
  }

  // --- Touch handlers ---
  private onTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const sx = t.clientX - rect.left;
      const sy = t.clientY - rect.top;

      // Left half of screen = joystick, right half = action
      if (sx < rect.width / 2) {
        if (this.touchJoystickId === null) {
          this.touchJoystickId = t.identifier;
          this.touchJoystickStart = { x: sx, y: sy };
          this.touchMoveVec = { x: 0, y: 0 };
          this.joystickActive = true;
          this.joystickX = sx;
          this.joystickY = sy;
          this.joystickDx = 0;
          this.joystickDy = 0;
        }
      } else {
        // Right side tap = click at that position
        this.touchActionId = t.identifier;
        this.mouseScreenX = sx;
        this.mouseScreenY = sy;
        if (this.camera) {
          const world = this.camera.screenToWorld(sx, sy);
          this.mouseWorldX = world.x;
          this.mouseWorldY = world.y;
          for (const handler of this.clickHandlers) {
            handler(world.x, world.y, 0);
          }
        }
      }
    }
  };

  private onTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === this.touchJoystickId) {
        const dx = t.clientX - rect.left - this.touchJoystickStart.x;
        const dy = t.clientY - rect.top - this.touchJoystickStart.y;
        const maxRadius = 50;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const clampedDist = Math.min(dist, maxRadius);
        if (dist > 5) {
          this.touchMoveVec = {
            x: (dx / dist) * (clampedDist / maxRadius),
            y: (dy / dist) * (clampedDist / maxRadius),
          };
          this.joystickDx = (dx / dist) * clampedDist;
          this.joystickDy = (dy / dist) * clampedDist;
        } else {
          this.touchMoveVec = { x: 0, y: 0 };
          this.joystickDx = 0;
          this.joystickDy = 0;
        }
      }
    }
  };

  private onTouchEnd = (e: TouchEvent): void => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === this.touchJoystickId) {
        this.touchJoystickId = null;
        this.touchMoveVec = { x: 0, y: 0 };
        this.joystickActive = false;
        this.joystickDx = 0;
        this.joystickDy = 0;
      }
      if (t.identifier === this.touchActionId) {
        this.touchActionId = null;
      }
    }
  };

  renderJoystick(ctx: CanvasRenderingContext2D): void {
    if (!this.joystickActive) return;
    // Outer circle
    ctx.beginPath();
    ctx.arc(this.joystickX, this.joystickY, 50, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Inner circle (knob)
    ctx.beginPath();
    ctx.arc(this.joystickX + this.joystickDx, this.joystickY + this.joystickDy, 20, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();
  }

  getHotbarKey(): number {
    for (let i = 0; i <= 9; i++) {
      const code = i === 0 ? 'Digit0' : `Digit${i}`;
      if (this.justPressed.has(code)) return i === 0 ? 9 : i - 1;
    }
    return -1;
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('touchstart', this.onTouchStart);
    this.canvas.removeEventListener('touchmove', this.onTouchMove);
    this.canvas.removeEventListener('touchend', this.onTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.onTouchEnd);
  }
}
