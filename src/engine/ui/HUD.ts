import { RPGSystem } from '../rpg/RPGSystem';
import { PlayerController } from '../player/PlayerController';

export class HUD {
  private container: HTMLElement;
  private rpgSystem: RPGSystem;
  private playerController: PlayerController;

  constructor(rpgSystem: RPGSystem, playerController: PlayerController) {
    this.rpgSystem = rpgSystem;
    this.playerController = playerController;
    this.container = document.getElementById('hud')!;
    this.createHUD();
  }

  private createHUD() {
    this.container.innerHTML = `
      <div class="hud-container">
        <div class="hud-top-left">
          <div class="objective-tracker">
            <div class="objective-title">MAIN OBJECTIVE</div>
            <div class="objective-text">Explore Night City</div>
            <div class="objective-distance">0m</div>
          </div>
        </div>

        <div class="hud-top-right">
          <div class="money-display">
            <span class="currency-symbol">€$</span>
            <span class="money-value" id="money">1000</span>
          </div>
          <div class="wanted-level" id="wanted">
            <div class="wanted-star"></div>
            <div class="wanted-star"></div>
            <div class="wanted-star"></div>
            <div class="wanted-star"></div>
            <div class="wanted-star"></div>
          </div>
        </div>

        <div class="hud-bottom-left">
          <div class="minimap">
            <canvas id="minimap-canvas" width="200" height="200"></canvas>
          </div>
          <div class="health-bar-container">
            <div class="stat-label">HP</div>
            <div class="health-bar">
              <div class="health-fill" id="health-fill" style="width: 100%"></div>
            </div>
            <div class="health-text" id="health-text">100/100</div>
          </div>
          <div class="stamina-bar-container">
            <div class="stamina-bar">
              <div class="stamina-fill" id="stamina-fill" style="width: 100%"></div>
            </div>
          </div>
        </div>

        <div class="hud-bottom-right">
          <div class="ammo-display">
            <div class="weapon-icon">🔫</div>
            <div class="ammo-count">
              <span class="ammo-current" id="ammo-current">30</span>
              <span class="ammo-separator">/</span>
              <span class="ammo-reserve" id="ammo-reserve">90</span>
            </div>
          </div>
        </div>

        <div class="hud-center-bottom">
          <div class="interaction-prompt" id="interaction-prompt" style="display: none;">
            <div class="prompt-key">[E]</div>
            <div class="prompt-text">Interact</div>
          </div>
        </div>

        <div class="crosshair"></div>
      </div>
    `;
  }

  update(deltaTime: number) {
    const stats = this.rpgSystem.getPlayerStats();

    const healthFill = document.getElementById('health-fill');
    const healthText = document.getElementById('health-text');

    if (healthFill && healthText) {
      const healthPercent = (stats.currentHealth / stats.maxHealth) * 100;
      healthFill.style.width = `${healthPercent}%`;
      healthText.textContent = `${Math.floor(stats.currentHealth)}/${stats.maxHealth}`;
    }

    const moneyDisplay = document.getElementById('money');
    if (moneyDisplay) {
      moneyDisplay.textContent = stats.money.toString();
    }
  }

  showInteractionPrompt(text: string) {
    const prompt = document.getElementById('interaction-prompt');
    if (prompt) {
      const promptText = prompt.querySelector('.prompt-text');
      if (promptText) {
        promptText.textContent = text;
      }
      prompt.style.display = 'flex';
    }
  }

  hideInteractionPrompt() {
    const prompt = document.getElementById('interaction-prompt');
    if (prompt) {
      prompt.style.display = 'none';
    }
  }
}
