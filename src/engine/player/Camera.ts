import { mat4, vec3 } from 'gl-matrix';

export class Camera {
  private position: vec3;
  private rotation: vec3;
  private viewMatrix: mat4;
  private projectionMatrix: mat4;
  private fov: number;
  private aspect: number;
  private near: number;
  private far: number;

  constructor() {
    this.position = vec3.fromValues(0, 2, 0);
    this.rotation = vec3.fromValues(0, 0, 0);
    this.viewMatrix = mat4.create();
    this.projectionMatrix = mat4.create();
    this.fov = Math.PI / 3;
    this.aspect = window.innerWidth / window.innerHeight;
    this.near = 0.1;
    this.far = 1000;

    this.updateProjectionMatrix();
  }

  updateProjectionMatrix() {
    mat4.perspective(
      this.projectionMatrix,
      this.fov,
      this.aspect,
      this.near,
      this.far
    );
  }

  updateViewMatrix() {
    const target = vec3.create();
    const up = vec3.fromValues(0, 1, 0);

    const forward = vec3.fromValues(
      Math.sin(this.rotation[1]) * Math.cos(this.rotation[0]),
      -Math.sin(this.rotation[0]),
      -Math.cos(this.rotation[1]) * Math.cos(this.rotation[0])
    );

    vec3.add(target, this.position, forward);
    mat4.lookAt(this.viewMatrix, this.position, target, up);
  }

  getViewMatrix(): mat4 {
    this.updateViewMatrix();
    return this.viewMatrix;
  }

  getProjectionMatrix(): mat4 {
    return this.projectionMatrix;
  }

  getPosition(): vec3 {
    return this.position;
  }

  setPosition(x: number, y: number, z: number) {
    vec3.set(this.position, x, y, z);
  }

  getRotation(): vec3 {
    return this.rotation;
  }

  rotate(pitch: number, yaw: number) {
    this.rotation[0] += pitch;
    this.rotation[1] += yaw;

    this.rotation[0] = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation[0]));
  }

  getForward(): vec3 {
    return vec3.fromValues(
      Math.sin(this.rotation[1]),
      0,
      -Math.cos(this.rotation[1])
    );
  }

  getRight(): vec3 {
    return vec3.fromValues(
      Math.cos(this.rotation[1]),
      0,
      Math.sin(this.rotation[1])
    );
  }

  setAspect(aspect: number) {
    this.aspect = aspect;
    this.updateProjectionMatrix();
  }
}
