import { Game } from './Game';

async function main(): Promise<void> {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('[Main] Canvas element not found');
    return;
  }

  // Enable pointer events on canvas
  canvas.style.cursor = 'crosshair';

  const game = new Game(canvas);

  try {
    await game.init();
    game.start();
    console.log('[Main] 精灵收集手册 - Game running!');
  } catch (err) {
    console.error('[Main] Failed to initialize game:', err);
    const loadingText = document.getElementById('loading-text');
    if (loadingText) {
      loadingText.textContent = '加载失败，请刷新页面重试';
      loadingText.style.color = '#FF5252';
    }
  }
}

main();
