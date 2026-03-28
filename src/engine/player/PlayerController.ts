import { vec3 } from 'gl-matrix';
import { InputManager } from '../input/InputManager';
import { Camera } from './Camera';
import { World } from '../world/World';

export class PlayerController {
  private camera: Camera;
  private inputManager: InputManager;
  private world: World;

  private velocity: vec3;
  private speed = 5.0;
  private sprintSpeed = 10.0;
  private jumpVelocity = 8.0;
  private gravity = -20.0;
  private mouseSensitivity = 0.002;

  private isGrounded = false;
  private isCrouching = false;
  private height = 1.8;
  private crouchHeight = 1.0;

  constructor(inputManager: InputManager, world: World) {
    this.camera = new Camera();
    this.inputManager = inputManager;
    this.world = world;
    this.velocity = vec3.create();
  }

  update(deltaTime: number) {
    this.handleMouseLook();
    this.handleMovement(deltaTime);
    this.applyGravity(deltaTime);
  }

  private handleMouseLook() {
    if (!this.inputManager.isPointerLocked()) return;

    const delta = this.inputManager.getMouseDelta();
    this.camera.rotate(
      -delta.y * this.mouseSensitivity,
      -delta.x * this.mouseSensitivity
    );
  }

  private handleMovement(deltaTime: number) {
    const forward = this.camera.getForward();
    const right = this.camera.getRight();

    const moveDir = vec3.create();

    if (this.inputManager.isKeyDown('KeyW')) {
      vec3.add(moveDir, moveDir, forward);
    }
    if (this.inputManager.isKeyDown('KeyS')) {
      vec3.subtract(moveDir, moveDir, forward);
    }
    if (this.inputManager.isKeyDown('KeyA')) {
      vec3.subtract(moveDir, moveDir, right);
    }
    if (this.inputManager.isKeyDown('KeyD')) {
      vec3.add(moveDir, moveDir, right);
    }

    if (vec3.length(moveDir) > 0) {
      vec3.normalize(moveDir, moveDir);
    }

    const isSprinting = this.inputManager.isKeyDown('ShiftLeft');
    const currentSpeed = isSprinting ? this.sprintSpeed : this.speed;

    vec3.scale(moveDir, moveDir, currentSpeed * deltaTime);

    const pos = this.camera.getPosition();
    vec3.add(pos, pos, moveDir);

    if (this.inputManager.isKeyDown('Space') && this.isGrounded) {
      this.velocity[1] = this.jumpVelocity;
      this.isGrounded = false;
    }

    this.isCrouching = this.inputManager.isKeyDown('ControlLeft');
  }

  private applyGravity(deltaTime: number) {
    this.velocity[1] += this.gravity * deltaTime;

    const pos = this.camera.getPosition();
    pos[1] += this.velocity[1] * deltaTime;

    const currentHeight = this.isCrouching ? this.crouchHeight : this.height;
    const groundLevel = this.world.getGroundLevel(pos[0], pos[2]) + currentHeight;

    if (pos[1] <= groundLevel) {
      pos[1] = groundLevel;
      this.velocity[1] = 0;
      this.isGrounded = true;
    }
  }

  getCamera(): Camera {
    return this.camera;
  }

  getPosition(): vec3 {
    return this.camera.getPosition();
  }

  getVelocity(): vec3 {
    return this.velocity;
  }

  isPlayerGrounded(): boolean {
    return this.isGrounded;
  }
}
