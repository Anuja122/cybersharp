export class InputManager {
  private keys: Set<string> = new Set();
  private mouseDown: Set<number> = new Set();
  private mouseDelta = { x: 0, y: 0 };
  private mousePosition = { x: 0, y: 0 };
  private canvas: HTMLCanvasElement;
  private pointerLocked = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (e.code === 'KeyF' && !this.pointerLocked) {
        this.requestPointerLock();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.mouseDown.add(e.button);
      if (!this.pointerLocked) {
        this.requestPointerLock();
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      this.mouseDown.delete(e.button);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.pointerLocked) {
        this.mouseDelta.x += e.movementX;
        this.mouseDelta.y += e.movementY;
      }
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
    });

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
    });
  }

  private requestPointerLock() {
    this.canvas.requestPointerLock();
  }

  update() {
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
  }

  isKeyDown(code: string): boolean {
    return this.keys.has(code);
  }

  isMouseDown(button: number): boolean {
    return this.mouseDown.has(button);
  }

  getMouseDelta(): { x: number; y: number } {
    return { ...this.mouseDelta };
  }

  getMousePosition(): { x: number; y: number } {
    return { ...this.mousePosition };
  }

  isPointerLocked(): boolean {
    return this.pointerLocked;
  }
}
