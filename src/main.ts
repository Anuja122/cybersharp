import './index.css';
import { Game } from './engine/Game';

async function init() {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

  if (!canvas) {
    throw new Error('Canvas element not found');
  }

  if (!navigator.gpu) {
    showWebGPUError();
    return;
  }

  try {
    const game = new Game(canvas);
    await game.initialize();
    game.start();
  } catch (error) {
    console.error('Failed to initialize game:', error);
    showWebGPUError();
  }
}

function showWebGPUError() {
  const overlay = document.getElementById('ui-overlay');
  if (overlay) {
    overlay.innerHTML = `
      <div class="error-screen">
        <div class="glitch-text">SYSTEM ERROR</div>
        <div class="error-message">
          <p>WebGPU not supported</p>
          <p class="small">Chrome 113+ or Firefox Nightly required</p>
          <p class="small">Enable WebGPU in browser flags</p>
        </div>
      </div>
    `;
  }
}

init();
