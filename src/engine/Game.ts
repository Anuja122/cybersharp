import { Renderer } from './renderer/Renderer';
import { InputManager } from './input/InputManager';
import { PlayerController } from './player/PlayerController';
import { World } from './world/World';
import { HUD } from './ui/HUD';
import { AudioEngine } from './audio/AudioEngine';
import { RPGSystem } from './rpg/RPGSystem';
import { CombatSystem } from './combat/CombatSystem';
import { ParticleSystem } from './particles/ParticleSystem';
import { QuestSystem } from './quest/QuestSystem';
import { SaveSystem } from './save/SaveSystem';

export class Game {
  private canvas: HTMLCanvasElement;
  private renderer!: Renderer;
  private inputManager!: InputManager;
  private playerController!: PlayerController;
  private world!: World;
  private hud!: HUD;
  private audioEngine!: AudioEngine;
  private rpgSystem!: RPGSystem;
  private combatSystem!: CombatSystem;
  private particleSystem!: ParticleSystem;
  private questSystem!: QuestSystem;
  private saveSystem!: SaveSystem;

  private lastTime = 0;
  private running = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupCanvas();
  }

  private setupCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.renderer?.resize(window.innerWidth, window.innerHeight);
    });
  }

  async initialize() {
    console.log('🌆 Initializing Cybersharp Prime...');

    this.renderer = new Renderer(this.canvas);
    await this.renderer.initialize();

    this.inputManager = new InputManager(this.canvas);
    this.audioEngine = new AudioEngine();
    this.rpgSystem = new RPGSystem();
    this.world = new World(this.renderer);
    this.playerController = new PlayerController(this.inputManager, this.world);
    this.combatSystem = new CombatSystem(this.world, this.rpgSystem, this.audioEngine);
    this.particleSystem = new ParticleSystem();
    this.questSystem = new QuestSystem();
    this.saveSystem = new SaveSystem();
    this.hud = new HUD(this.rpgSystem, this.playerController);

    await this.world.generate();

    console.log('✅ Game initialized');
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  stop() {
    this.running = false;
  }

  private gameLoop = (currentTime: number) => {
    if (!this.running) return;

    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number) {
    this.inputManager.update();
    this.playerController.update(deltaTime);
    this.world.update(deltaTime, this.playerController.getPosition());
    this.audioEngine.update(this.playerController.getPosition());
    this.particleSystem.update(deltaTime, this.playerController.getPosition());
    this.questSystem.update(deltaTime, this.playerController.getPosition());
    this.combatSystem.update(deltaTime);
    this.hud.update(deltaTime);

    if (this.inputManager.isMouseDown(0)) {
      const camera = this.playerController.getCamera();
      const direction = camera.getForward();
      this.combatSystem.fire(camera.getPosition(), direction);
    }

    if (this.inputManager.isKeyDown('KeyR')) {
      this.combatSystem.reload();
    }
  }

  private render() {
    this.renderer.render(
      this.world,
      this.playerController.getCamera()
    );
  }
}
